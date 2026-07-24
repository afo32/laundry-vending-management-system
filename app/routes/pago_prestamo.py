from flask import Blueprint, request, jsonify
from app.database import db
from app.models.pago_prestamo import PagoPrestamo
from app.utils.auth_required import auth_required
from sqlalchemy import func
from datetime import datetime

pago_prestamo_bp = Blueprint("pago_prestamo", __name__, url_prefix="/pagos-prestamo")

@pago_prestamo_bp.route("", methods=["GET"])
@auth_required
def listar_pagos():
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    query = PagoPrestamo.query
    if desde:
        query = query.filter(PagoPrestamo.fecha >= desde)
    if hasta:
        query = query.filter(PagoPrestamo.fecha <= hasta)

    pagos = query.order_by(PagoPrestamo.fecha.desc()).all()

    # Total acumulado de TODOS los pagos (sin filtro de fecha)
    total_tarjeta_acum = db.session.query(func.sum(PagoPrestamo.tarjeta)).scalar() or 0
    total_efectivo_acum = db.session.query(func.sum(PagoPrestamo.efectivo)).scalar() or 0

    return jsonify({
        "pagos": [
            {
                "id": p.id,
                "fecha": p.fecha.isoformat(),
                "tarjeta": p.tarjeta,
                "efectivo": p.efectivo,
                "total": round(p.tarjeta + p.efectivo, 2),
            }
            for p in pagos
        ],
        "total_acumulado": {
            "tarjeta": round(float(total_tarjeta_acum), 2),
            "efectivo": round(float(total_efectivo_acum), 2),
            "total": round(float(total_tarjeta_acum) + float(total_efectivo_acum), 2),
        }
    })

@pago_prestamo_bp.route("", methods=["POST"])
@auth_required
def crear_pago():
    data = request.get_json()

    fecha_str = data.get("fecha")
    if not fecha_str:
        return jsonify({"error": "fecha es obligatoria"}), 400

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except:
        return jsonify({"error": "Formato de fecha inválido"}), 400

    pago = PagoPrestamo()
    pago.fecha = fecha
    pago.tarjeta = float(data.get("tarjeta", 0))
    pago.efectivo = float(data.get("efectivo", 0))

    db.session.add(pago)
    db.session.commit()

    return jsonify({"message": "Pago guardado", "id": pago.id}), 201

@pago_prestamo_bp.route("/<int:id>", methods=["PUT"])
@auth_required
def editar_pago(id):
    pago = PagoPrestamo.query.get_or_404(id)
    data = request.get_json()

    if "fecha" in data:
        try:
            pago.fecha = datetime.strptime(data["fecha"], "%Y-%m-%d").date()
        except:
            pass
    pago.tarjeta = float(data.get("tarjeta", pago.tarjeta))
    pago.efectivo = float(data.get("efectivo", pago.efectivo))

    db.session.commit()
    return jsonify({"message": "Pago actualizado"})

@pago_prestamo_bp.route("/<int:id>", methods=["DELETE"])
@auth_required
def eliminar_pago(id):
    pago = PagoPrestamo.query.get_or_404(id)
    db.session.delete(pago)
    db.session.commit()
    return jsonify({"message": "Pago eliminado"})