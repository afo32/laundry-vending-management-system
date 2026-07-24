from flask import Blueprint, jsonify, request
from app.database import db
from app.models.ventas import Venta
from app.models.compras import Compra
from app.models.gastos import Gasto
from app.models.productos import Producto
from app.models.maquinas import Maquina

from app.utils.auth_required import auth_required
from sqlalchemy import func

reportes_bp = Blueprint("reportes", __name__)

@reportes_bp.route("/ventas-dia", methods=["GET"])
@auth_required
def ventas_por_dia():
    categoria = request.args.get("categoria")  # "lavanderia" o "vending"
    fecha_inicio = request.args.get("fecha_inicio")
    fecha_fin = request.args.get("fecha_fin")

    # Determinar qué tipos de máquina corresponden a cada categoría
    if categoria == "lavanderia":
        tipos = ["lavadora", "secadora"]
    elif categoria == "vending":
        tipos = ["vending", "cafe"]
    else:
        tipos = ["lavadora", "secadora", "vending", "cafe"]  # sin filtro = todo

    query = (
        db.session.query(
            func.date(Venta.fecha).label("dia"),
            func.sum(Venta.cantidad * Venta.precio).label("total"),
            func.sum(Venta.cantidad).label("unidades")
        )
        .join(Maquina, Maquina.id == Venta.maquina_id)  # outerjoin si puede no tener maquina
        .filter(Maquina.tipo.in_(tipos))
    )

    if fecha_inicio:
        query = query.filter(Venta.fecha >= fecha_inicio)
    if fecha_fin:
        query = query.filter(Venta.fecha <= fecha_fin + " 23:59:59")

    resultados = (
        query
        .group_by(func.date(Venta.fecha))
        .order_by(func.date(Venta.fecha).desc())
        .all()
    )

    data = [
        {
            "dia": str(r.dia),
            "total": round(float(r.total), 2),
            "unidades": int(r.unidades)
        }
        for r in resultados
    ]

    return jsonify(data)

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
    categoria = request.args.get("categoria")

    query = (
        db.session.query(
            Producto.id,
            Producto.nombre,
            func.sum(Venta.cantidad).label("cantidad"),
            func.sum(Venta.cantidad * Venta.precio).label("total")
        )
        .join(Producto, Producto.id == Venta.producto_id)
    )

    if categoria:
        query = query.filter(Producto.categoria == categoria)
    if producto_id:
        query = query.filter(Venta.producto_id == producto_id)
    if desde:
        query = query.filter(Venta.fecha >= desde)
    if hasta:
        query = query.filter(Venta.fecha <= hasta + " 23:59:59")

    resultados = query.group_by(Producto.id, Producto.nombre).all()

    data = [
        {
            "producto_id": r.id,
            "producto": r.nombre,
            "cantidad": int(r.cantidad),
            "total": round(float(r.total), 2)
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
