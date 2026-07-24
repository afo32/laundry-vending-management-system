from flask import Blueprint, request, jsonify
from app.database import db
from app.models.merma import Merma
from app.models.productos import Producto
from app.utils.auth_required import auth_required
from datetime import datetime

merma_bp = Blueprint("merma", __name__, url_prefix="/merma")

@merma_bp.route("", methods=["GET"])
@auth_required
def listar_mermas():
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    query = Merma.query
    if desde:
        query = query.filter(Merma.fecha >= desde)
    if hasta:
        query = query.filter(Merma.fecha <= hasta)

    mermas = query.order_by(Merma.fecha.desc()).all()

    return jsonify([
        {
            "id": m.id,
            "producto_id": m.producto_id,
            "producto": m.producto.nombre if m.producto else None,
            "cantidad": m.cantidad,
            "fecha": m.fecha.isoformat(),
        }
        for m in mermas
    ])

@merma_bp.route("", methods=["POST"])
@auth_required
def crear_merma():
    data = request.get_json()

    producto_id = data.get("producto_id")
    cantidad = data.get("cantidad")
    fecha_str = data.get("fecha")

    if not producto_id or not cantidad:
        return jsonify({"error": "producto_id y cantidad son obligatorios"}), 400

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date() if fecha_str else datetime.now().date()
    except:
        fecha = datetime.now().date()

    # Descontar stock
    producto = Producto.query.get_or_404(producto_id)
    producto.stock = max(0, producto.stock - int(cantidad))

    merma = Merma()
    merma.producto_id = int(producto_id)
    merma.cantidad = int(cantidad)
    merma.fecha = fecha

    db.session.add(merma)
    db.session.commit()

    return jsonify({"message": "Merma registrada", "id": merma.id}), 201

@merma_bp.route("/<int:id>", methods=["DELETE"])
@auth_required
def eliminar_merma(id):
    merma = Merma.query.get_or_404(id)

    # Restaurar stock al eliminar
    producto = Producto.query.get(merma.producto_id)
    if producto:
        producto.stock = producto.stock + merma.cantidad

    db.session.delete(merma)
    db.session.commit()
    return jsonify({"message": "Merma eliminada"})