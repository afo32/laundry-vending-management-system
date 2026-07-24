from flask import Blueprint, request, jsonify
from app.database import db
from app.models.cambio_urgente import CambioUrgente
from app.utils.auth_required import auth_required
from datetime import datetime

cambio_urgente_bp = Blueprint("cambio_urgente", __name__, url_prefix="/cambio-urgente")

DENOMINACIONES = [0.05, 0.10, 0.20, 0.50, 1, 2]

@cambio_urgente_bp.route("", methods=["GET"])
@auth_required
def listar():
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    query = CambioUrgente.query
    if desde:
        query = query.filter(CambioUrgente.fecha >= desde)
    if hasta:
        query = query.filter(CambioUrgente.fecha <= hasta)

    registros = query.order_by(CambioUrgente.fecha.desc()).all()

    return jsonify([
        {
            "id": r.id,
            "fecha": r.fecha.isoformat(),
            "denominacion": r.denominacion,
            "cantidad": r.cantidad,
            "total": r.total,
        }
        for r in registros
    ])

@cambio_urgente_bp.route("", methods=["POST"])
@auth_required
def crear():
    data = request.get_json()

    fecha_str = data.get("fecha")
    denominacion = data.get("denominacion")
    cantidad = data.get("cantidad")

    if not denominacion or not cantidad:
        return jsonify({"error": "denominacion y cantidad son obligatorios"}), 400

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date() if fecha_str else datetime.now().date()
    except:
        fecha = datetime.now().date()

    r = CambioUrgente()
    r.fecha = fecha
    r.denominacion = float(denominacion)
    r.cantidad = int(cantidad)
    r.total = round(float(denominacion) * int(cantidad), 2)

    db.session.add(r)
    db.session.commit()

    return jsonify({"message": "Cambio urgente registrado", "id": r.id}), 201

@cambio_urgente_bp.route("/<int:id>", methods=["DELETE"])
@auth_required
def eliminar(id):
    r = CambioUrgente.query.get_or_404(id)
    db.session.delete(r)
    db.session.commit()
    return jsonify({"message": "Eliminado"})