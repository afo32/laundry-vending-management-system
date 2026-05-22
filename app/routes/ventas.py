from flask import Blueprint, request, jsonify
from app.database import db
from app.models.ventas import Venta
from app.models.productos import Producto
from app.utils.auth_required import auth_required
from datetime import datetime

ventas_bp = Blueprint("ventas", __name__, url_prefix="/ventas")


# -----------------------------------
# GET: Obtener todas las ventas
# -----------------------------------
@ventas_bp.route("", methods=["GET"])
@auth_required
def obtener_ventas():
    categoria = request.args.get("categoria")
    maquina = request.args.get("maquina")
    producto_id = request.args.get("producto_id")
    fecha = request.args.get("fecha")

    query = Venta.query

    if categoria:
        query = query.filter(Venta.categoria == categoria)

    if maquina:
        query = query.filter(Venta.maquina == maquina)

    if producto_id:
        query = query.filter(Venta.producto_id == producto_id)

    if fecha:
        try:
            fecha_dt = datetime.strptime(fecha, "%Y-%m-%d")
            query = query.filter(db.func.date(Venta.fecha) == fecha_dt.date())
        except:
            pass

    ventas = query.order_by(Venta.fecha.desc()).all()

    return jsonify([
        {
            "id": v.id,
            "categoria": v.categoria,
            "producto_id": v.producto_id,
            "producto": v.producto.nombre if v.producto else None,
            "maquina": v.maquina,
            "cantidad": v.cantidad,
            "precio": v.precio,
            "total": v.cantidad * v.precio,
            "fecha": v.fecha.strftime("%Y-%m-%d")
        }
        for v in ventas
    ])


# -----------------------------------
# GET: Obtener una venta por ID
# -----------------------------------
@ventas_bp.route("/<int:id>", methods=["GET"])
@auth_required
def obtener_venta(id):
    venta = Venta.query.get_or_404(id)

    return jsonify({
        "id": venta.id,
        "categoria": venta.categoria,
        "producto_id": venta.producto_id,
        "producto": venta.producto.nombre if venta.producto else None,
        "maquina": venta.maquina,
        "cantidad": venta.cantidad,
        "precio": venta.precio,
        "total": venta.cantidad * venta.precio,
        "fecha": venta.fecha.strftime("%Y-%m-%d")
    })


# -----------------------------------
# POST: Crear una nueva venta
# -----------------------------------
@ventas_bp.route("", methods=["POST"])
@auth_required
def crear_venta():
    data = request.get_json()

    categoria = data.get("categoria")
    producto_id = data.get("producto_id")
    maquina = data.get("maquina")
    cantidad = data.get("cantidad")
    precio = data.get("precio")
    fecha = data.get("fecha")

    if not categoria or not producto_id or not cantidad or not precio:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    try:
        fecha_dt = datetime.strptime(fecha, "%Y-%m-%d") if fecha else datetime.now()
    except:
        fecha_dt = datetime.now()

    nueva = Venta(
        categoria=categoria,
        producto_id=producto_id,
        maquina=maquina,
        cantidad=int(cantidad),
        precio=float(precio),
        fecha=fecha_dt
    )

    db.session.add(nueva)
    db.session.commit()

    return jsonify({"message": "Venta creada correctamente", "id": nueva.id}), 201


# -----------------------------------
# PUT: Editar una venta existente
# -----------------------------------
@ventas_bp.route("/<int:id>", methods=["PUT"])
@auth_required
def editar_venta(id):
    venta = Venta.query.get_or_404(id)
    data = request.get_json()

    venta.categoria = data.get("categoria", venta.categoria)
    venta.producto_id = data.get("producto_id", venta.producto_id)
    venta.maquina = data.get("maquina", venta.maquina)
    venta.cantidad = int(data.get("cantidad", venta.cantidad))
    venta.precio = float(data.get("precio", venta.precio))

    if "fecha" in data:
        try:
            venta.fecha = datetime.strptime(data["fecha"], "%Y-%m-%d")
        except:
            pass

    db.session.commit()

    return jsonify({"message": "Venta actualizada correctamente"})


# -----------------------------------
# DELETE: Eliminar una venta
# -----------------------------------
@ventas_bp.route("/<int:id>", methods=["DELETE"])
@auth_required
def eliminar_venta(id):
    venta = Venta.query.get_or_404(id)

    db.session.delete(venta)
    db.session.commit()

    return jsonify({"message": "Venta eliminada correctamente"})
