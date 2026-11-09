from flask import Blueprint, jsonify, request
from sqlalchemy import func
from app.database import db
from app.models.productos import Producto
from app.models.movimientos_inventario import MovimientoInventario
from app.models.ventas import Venta
from app.models.merma import Merma

inventario_bp = Blueprint("inventario", __name__)

@inventario_bp.route("/inventario", methods=["GET"])
def ver_inventario():
    productos = Producto.query.all()
    return jsonify([{
        "id": p.id,
        "nombre": p.nombre,
        "stock_actual": p.stock_actual
    } for p in productos])

@inventario_bp.route("/inventario/movimientos", methods=["GET"])
def listar_movimientos():
    movimientos = MovimientoInventario.query.all()
    return jsonify([{
        "id": m.id,
        "producto_id": m.producto_id,
        "tipo": m.tipo,
        "cantidad": m.cantidad,
        "fecha": m.fecha.isoformat(),
        "referencia": m.referencia
    } for m in movimientos])


@inventario_bp.route("/inventario/mensual", methods=["GET"])
def inventario_mensual():
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    if not desde or not hasta:
        return jsonify({"error": "desde y hasta son obligatorios"}), 400

    def suma_ventas(filtro):
        filas = (
            db.session.query(Venta.producto_id, func.sum(Venta.cantidad))
            .filter(filtro)
            .group_by(Venta.producto_id)
            .all()
        )
        return {pid: int(total or 0) for pid, total in filas}

    def suma_mermas(filtro):
        filas = (
            db.session.query(Merma.producto_id, func.sum(Merma.cantidad))
            .filter(filtro)
            .group_by(Merma.producto_id)
            .all()
        )
        return {pid: int(total or 0) for pid, total in filas}

    ventas_per = suma_ventas(
        (func.date(Venta.fecha) >= desde) & (func.date(Venta.fecha) <= hasta)
    )
    ventas_post = suma_ventas(func.date(Venta.fecha) > hasta)
    mermas_per = suma_mermas((Merma.fecha >= desde) & (Merma.fecha <= hasta))
    mermas_post = suma_mermas(Merma.fecha > hasta)

    productos = (
        Producto.query
        .filter(Producto.categoria.in_(["vending", "cafe"]))
        .order_by(Producto.nombre.asc())
        .all()
    )

    resultado = []
    for p in productos:
        v_per = ventas_per.get(p.id, 0)
        v_post = ventas_post.get(p.id, 0)
        m_per = mermas_per.get(p.id, 0)
        m_post = mermas_post.get(p.id, 0)
        stock = p.stock or 0

        resultado.append({
            "id": p.id,
            "nombre": p.nombre,
            "codigo": p.codigo,
            "categoria": p.categoria,
            "stock_actual": stock,
            # stock al inicio del período
            "stock": stock + v_per + v_post + m_per + m_post,
            "ventas": v_per,
            "merma": m_per,
            # lo que debería quedar al final del período
            "total": stock + v_post + m_post,
        })

    return jsonify(resultado)