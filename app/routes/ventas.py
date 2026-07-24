from flask import Blueprint, request, jsonify
from app.database import db
from app.models.ventas import Venta
from app.models.productos import Producto
from app.utils.auth_required import auth_required
from datetime import datetime
from app.models import VentaDia

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

    producto_id = data.get("producto_id")
    maquina_id = data.get("maquina_id")
    cantidad = data.get("cantidad")
    precio = data.get("precio")
    fecha = data.get("fecha")
    dia_id = data.get("dia_id")


    # Validación correcta
    if producto_id is not None and not isinstance(producto_id, int):
        return jsonify({"error": "producto_id debe ser entero o null"}), 400

    if cantidad is None or precio is None:
        return jsonify({"error": "cantidad y precio son obligatorios"}), 400

    try:
        fecha_dt = datetime.strptime(fecha, "%Y-%m-%d") if fecha else datetime.now()
    except:
        fecha_dt = datetime.now()

    # CREACIÓN SEGURA (sin kwargs)
    nueva = Venta()
    nueva.producto_id = producto_id
    nueva.maquina_id = maquina_id
    nueva.cantidad = cantidad
    nueva.precio = precio
    nueva.fecha = fecha_dt
    nueva.dia_id = dia_id
    
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

@ventas_bp.route("/bulk", methods=["POST"])
@auth_required
def crear_ventas_bulk():
    data = request.get_json()

    fecha_str = data.get("fecha")
    categoria = data.get("categoria")
    maquina_id = data.get("maquina_id")  # opcional para lavanderia
    items = data.get("items", [])

    if not fecha_str or not categoria or not items:
        return jsonify({"error": "fecha, categoria e items son obligatorios"}), 400

    # maquina_id solo obligatorio para vending
    if categoria == "vending" and not maquina_id:
        return jsonify({"error": "maquina_id es obligatorio para vending"}), 400

    try:
        fecha_dt = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except:
        return jsonify({"error": "Formato de fecha inválido, usar YYYY-MM-DD"}), 400

    venta_dia = VentaDia()
    venta_dia.fecha = fecha_dt
    venta_dia.categoria = categoria
    db.session.add(venta_dia)
    db.session.flush()

    for item in items:
        producto_id = item.get("producto_id")
        cantidad = item.get("cantidad")
        precio = item.get("precio")

        if cantidad is None or precio is None:
            db.session.rollback()
            return jsonify({"error": "Cada item necesita cantidad y precio"}), 400

        v = Venta()
        v.producto_id = producto_id
        v.maquina_id = maquina_id if categoria == "vending" else None
        v.cantidad = int(cantidad)
        v.precio = float(precio)
        v.fecha = fecha_dt
        v.dia_id = venta_dia.id
        db.session.add(v)
        
        if producto_id and categoria == "vending":
            producto = Producto.query.get(producto_id)
            if producto:
                producto.stock = max(0, producto.stock - int(cantidad))

    db.session.commit()

    return jsonify({
        "message": "Ventas guardadas correctamente",
        "venta_dia_id": venta_dia.id,
        "total_items": len(items)
    }), 201