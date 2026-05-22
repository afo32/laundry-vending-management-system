from flask import Blueprint, request, jsonify
from app.database import db
from app.models.compras import Compra
from app.models.productos import Producto
from app.utils.auth_required import auth_required
from datetime import datetime

compras_bp = Blueprint("compras", __name__, url_prefix="/compras")


# -----------------------------------
# GET: Obtener todas las compras
# -----------------------------------
@compras_bp.route("", methods=["GET"])
@auth_required
def obtener_compras():
    categoria = request.args.get("categoria")
    producto_id = request.args.get("producto_id")
    fecha = request.args.get("fecha")

    query = Compra.query

    if categoria:
        query = query.filter(Compra.categoria == categoria)

    if producto_id:
        query = query.filter(Compra.producto_id == producto_id)

    if fecha:
        try:
            fecha_dt = datetime.strptime(fecha, "%Y-%m-%d")
            query = query.filter(db.func.date(Compra.fecha) == fecha_dt.date())
        except:
            pass

    compras = query.order_by(Compra.fecha.desc()).all()

    return jsonify([
        {
            "id": c.id,
            "categoria": c.categoria,
            "producto_id": c.producto_id,
            "producto": c.producto.nombre if c.producto else None,
            "cantidad": c.cantidad,
            "precio": c.precio,
            "total": c.cantidad * c.precio,
            "fecha": c.fecha.strftime("%Y-%m-%d"),
            "proveedor": c.proveedor,
            "factura": c.factura,
            "notas": c.notas

        }
        for c in compras
    ])


# -----------------------------------
# GET: Obtener una compra por ID
# -----------------------------------
@compras_bp.route("/<int:id>", methods=["GET"])
@auth_required
def obtener_compra(id):
    compra = Compra.query.get_or_404(id)

    return jsonify({
        "id": compra.id,
        "categoria": compra.categoria,
        "producto_id": compra.producto_id,
        "producto": compra.producto.nombre if compra.producto else None,
        "cantidad": compra.cantidad,
        "precio": compra.precio,
        "total": compra.cantidad * compra.precio,
        "fecha": compra.fecha.strftime("%Y-%m-%d")
    })


# -----------------------------------
# POST: Crear una nueva compra
# -----------------------------------
@compras_bp.route("", methods=["POST"])
@auth_required
def crear_compra():
    data = request.get_json()

    categoria = data.get("categoria")
    producto_id = data.get("producto_id")
    cantidad = data.get("cantidad")
    precio = data.get("precio")
    fecha = data.get("fecha")
    proveedor = data.get("proveedor")
    factura = data.get("factura")
    notas = data.get("notas")

    if not categoria or not producto_id or not cantidad or not precio:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    try:
        fecha_dt = datetime.strptime(fecha, "%Y-%m-%d") if fecha else datetime.now()
    except:
        fecha_dt = datetime.now()

    nueva = Compra(
        categoria=categoria,
        producto_id=producto_id,
        cantidad=int(cantidad),
        precio=float(precio),
        fecha=fecha_dt,
        proveedor=proveedor,
        factura=factura,
        notas=notas
    )

    db.session.add(nueva)
    db.session.commit()

    return jsonify({"message": "Compra creada correctamente", "id": nueva.id}), 201


# -----------------------------------
# PUT: Editar una compra existente
# -----------------------------------
@compras_bp.route("/<int:id>", methods=["PUT"])
@auth_required
def editar_compra(id):
    compra = Compra.query.get_or_404(id)
    data = request.get_json()

    compra.categoria = data.get("categoria", compra.categoria)
    compra.producto_id = data.get("producto_id", compra.producto_id)
    compra.cantidad = int(data.get("cantidad", compra.cantidad))
    compra.precio = float(data.get("precio", compra.precio))

    if "fecha" in data:
        try:
            compra.fecha = datetime.strptime(data["fecha"], "%Y-%m-%d")
        except:
            pass

    db.session.commit()

    return jsonify({"message": "Compra actualizada correctamente"})


# -----------------------------------
# DELETE: Eliminar una compra
# -----------------------------------
@compras_bp.route("/<int:id>", methods=["DELETE"])
@auth_required
def eliminar_compra(id):
    compra = Compra.query.get_or_404(id)

    db.session.delete(compra)
    db.session.commit()

    return jsonify({"message": "Compra eliminada correctamente"})
