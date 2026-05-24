from flask import Blueprint, jsonify, request
from app.database import db
from app.models.ventas import Venta
from app.models.compras import Compra
from app.models.gastos import Gasto
from app.models.productos import Producto
from app.utils.auth_required import auth_required
from sqlalchemy import func

reportes_bp = Blueprint("reportes", __name__)

@reportes_bp.route("/ventas-dia", methods=["GET"])
@auth_required
def ventas_por_dia():
    categoria = request.args.get("categoria")

    if categoria == "lavadoras":
        query = (
            db.session.query(
                func.date(Venta.fecha).label("fecha"),
                func.sum(Venta.cantidad).label("cantidad"),
                func.sum(Venta.precio * Venta.cantidad).label("total")
            )
            .filter(Venta.maquina_id == 1)  # lavadora 1
            .group_by(func.date(Venta.fecha))
            .order_by(func.date(Venta.fecha))
        )
    else:
        query = (
            db.session.query(
                func.date(Venta.fecha).label("fecha"),
                func.sum(Venta.cantidad).label("cantidad"),
                func.sum(Venta.precio * Venta.cantidad).label("total")
            )
            .join(Producto)
            .filter(Producto.categoria == categoria)
            .group_by(func.date(Venta.fecha))
            .order_by(func.date(Venta.fecha))
        )

    resultados = [
        {
            "fecha": str(r.fecha),
            "cantidad": r.cantidad,
            "total": float(r.total)
        }
        for r in query.all()
    ]

    return jsonify(resultados)



@reportes_bp.route("/ventas-maquina", methods=["GET"])
@auth_required
def ventas_por_maquina():
    maquina_id = request.args.get("maquina_id")
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    query = db.session.query(
        Venta.maquina_id,
        func.sum(Venta.total).label("total")
    )

    if maquina_id:
        query = query.filter(Venta.maquina_id == maquina_id)
    if desde:
        query = query.filter(Venta.fecha >= desde)
    if hasta:
        query = query.filter(Venta.fecha <= hasta)

    resultados = query.group_by(Venta.maquina_id).all()

    data = [{"maquina_id": r.maquina_id, "total": float(r.total)} for r in resultados]
    return jsonify(data)


@reportes_bp.route("/ventas-producto", methods=["GET"])
@auth_required
def ventas_por_producto():
    producto_id = request.args.get("producto_id")
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    query = (
        db.session.query(
            Producto.nombre,
            func.sum(Venta.cantidad).label("cantidad"),
            func.sum(Venta.total).label("total")
        )
        .join(Producto, Producto.id == Venta.producto_id)
    )

    if producto_id:
        query = query.filter(Venta.producto_id == producto_id)
    if desde:
        query = query.filter(Venta.fecha >= desde)
    if hasta:
        query = query.filter(Venta.fecha <= hasta)

    resultados = query.group_by(Producto.nombre).all()

    data = [
        {
            "producto": r.nombre,
            "cantidad": int(r.cantidad),
            "total": float(r.total)
        }
        for r in resultados
    ]
    return jsonify(data)


@reportes_bp.route("/compras-mes", methods=["GET"])
@auth_required
def compras_por_mes():
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    query = db.session.query(
        func.strftime("%Y-%m", Compra.fecha).label("mes"),
        func.sum(Compra.total).label("total")
    )

    if desde:
        query = query.filter(Compra.fecha >= desde)
    if hasta:
        query = query.filter(Compra.fecha <= hasta)

    resultados = query.group_by("mes").order_by("mes").all()

    data = [{"mes": r.mes, "total": float(r.total)} for r in resultados]
    return jsonify(data)


@reportes_bp.route("/gastos-categoria", methods=["GET"])
@auth_required
def gastos_por_categoria():
    categoria = request.args.get("categoria")
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    query = db.session.query(
        Gasto.categoria,
        func.sum(Gasto.monto).label("total")
    )

    if categoria:
        query = query.filter(Gasto.categoria == categoria)
    if desde:
        query = query.filter(Gasto.fecha >= desde)
    if hasta:
        query = query.filter(Gasto.fecha <= hasta)

    resultados = query.group_by(Gasto.categoria).all()

    data = [{"categoria": r.categoria, "total": float(r.total)} for r in resultados]
    return jsonify(data)


@reportes_bp.route("/stock-bajo", methods=["GET"])
@auth_required
def stock_bajo():
    productos = Producto.query.filter(Producto.stock_actual < 5).all()

    data = [
        {
            "producto": p.nombre,
            "stock": p.stock_actual
        }
        for p in productos
    ]
    return jsonify(data)

@reportes_bp.route("/beneficio", methods=["GET"])
@auth_required
def beneficio():
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    ventas_q = db.session.query(func.sum(Venta.total))
    compras_q = db.session.query(func.sum(Compra.total))
    gastos_q = db.session.query(func.sum(Gasto.monto))

    if desde:
        ventas_q = ventas_q.filter(Venta.fecha >= desde)
        compras_q = compras_q.filter(Compra.fecha >= desde)
        gastos_q = gastos_q.filter(Gasto.fecha >= desde)

    if hasta:
        ventas_q = ventas_q.filter(Venta.fecha <= hasta)
        compras_q = compras_q.filter(Compra.fecha <= hasta)
        gastos_q = gastos_q.filter(Gasto.fecha <= hasta)

    total_ventas = ventas_q.scalar() or 0
    total_compras = compras_q.scalar() or 0
    total_gastos = gastos_q.scalar() or 0

    beneficio = total_ventas - total_compras - total_gastos

    return jsonify({
        "ventas": float(total_ventas),
        "compras": float(total_compras),
        "gastos": float(total_gastos),
        "beneficio": float(beneficio)
    })
