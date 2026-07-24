from flask import Blueprint, request, jsonify
from app.database import db
from app.models.caja import Caja, CajaDetalle
from app.utils.auth_required import auth_required
from datetime import datetime

caja_bp = Blueprint("caja", __name__, url_prefix="/caja")

DENOMINACIONES = [0.01, 0.02, 0.05, 0.10, 0.20, 0.50, 1, 2, 5, 10, 20, 50]

@caja_bp.route("", methods=["GET"])
@auth_required
def listar_cajas():
    tipo = request.args.get("tipo")
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    query = Caja.query
    if tipo:
        query = query.filter(Caja.tipo == tipo)
    if desde:
        query = query.filter(Caja.fecha >= desde)
    if hasta:
        query = query.filter(Caja.fecha <= hasta)

    cajas = query.order_by(Caja.fecha.desc()).all()

    return jsonify([
        {
            "id": c.id,
            "fecha": c.fecha.isoformat(),
            "tipo": c.tipo,
            "total": c.total,
        }
        for c in cajas
    ])

@caja_bp.route("/<int:id>", methods=["GET"])
@auth_required
def obtener_caja(id):
    caja = Caja.query.get_or_404(id)
    return jsonify({
        "id": caja.id,
        "fecha": caja.fecha.isoformat(),
        "tipo": caja.tipo,
        "total": caja.total,
        "detalle": [
            {
                "denominacion": d.denominacion,
                "cantidad": d.cantidad,
                "subtotal": d.subtotal,
            }
            for d in sorted(caja.detalle, key=lambda x: x.denominacion)
        ]
    })

@caja_bp.route("", methods=["POST"])
@auth_required
def crear_caja():
    data = request.get_json()

    fecha_str = data.get("fecha")
    tipo = data.get("tipo")
    detalle = data.get("detalle", [])

    if not fecha_str or not tipo:
        return jsonify({"error": "fecha y tipo son obligatorios"}), 400

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except:
        return jsonify({"error": "Formato de fecha inválido"}), 400

    total = sum(item.get("cantidad", 0) * item.get("denominacion", 0) for item in detalle)

    # Si ya existe una caja de ese día y tipo, la sobreescribe
    caja = Caja.query.filter_by(fecha=fecha, tipo=tipo).first()
    if caja:
        CajaDetalle.query.filter_by(caja_id=caja.id).delete()
        caja.total = round(total, 2)
        caja.creado_en = datetime.now()
    else:
        caja = Caja()
        caja.fecha = fecha
        caja.tipo = tipo
        caja.total = round(total, 2)
        db.session.add(caja)

    db.session.flush()

    for item in detalle:
        d = CajaDetalle()
        d.caja_id = caja.id
        d.denominacion = item.get("denominacion")
        d.cantidad = int(item.get("cantidad", 0))
        d.subtotal = round(d.cantidad * d.denominacion, 2)
        db.session.add(d)

    db.session.commit()
    return jsonify({"message": "Caja guardada", "id": caja.id}), 201

@caja_bp.route("/<int:id>", methods=["PUT"])
@auth_required
def editar_caja(id):
    caja = Caja.query.get_or_404(id)
    data = request.get_json()

    detalle = data.get("detalle", [])

    CajaDetalle.query.filter_by(caja_id=caja.id).delete()

    total = sum(item.get("cantidad", 0) * item.get("denominacion", 0) for item in detalle)
    caja.total = round(total, 2)

    if "fecha" in data:
        try:
            caja.fecha = datetime.strptime(data["fecha"], "%Y-%m-%d").date()
        except:
            pass

    for item in detalle:
        d = CajaDetalle()
        d.caja_id = caja.id
        d.denominacion = item.get("denominacion")
        d.cantidad = int(item.get("cantidad", 0))
        d.subtotal = round(d.cantidad * d.denominacion, 2)
        db.session.add(d)

    db.session.commit()
    return jsonify({"message": "Caja actualizada"})

@caja_bp.route("/<int:id>", methods=["DELETE"])
@auth_required
def eliminar_caja(id):
    caja = Caja.query.get_or_404(id)
    db.session.delete(caja)
    db.session.commit()
    return jsonify({"message": "Caja eliminada"})

@caja_bp.route("/buscar", methods=["GET"])
@auth_required
def buscar_caja():
    fecha_str = request.args.get("fecha")
    tipo = request.args.get("tipo")

    if not fecha_str or not tipo:
        return jsonify(None), 200

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except:
        return jsonify(None), 200

    caja = Caja.query.filter_by(fecha=fecha, tipo=tipo).first()
    if not caja:
        return jsonify(None), 200

    return jsonify({
        "id": caja.id,
        "fecha": caja.fecha.isoformat(),
        "tipo": caja.tipo,
        "total": caja.total,
        "detalle": [
            {
                "denominacion": d.denominacion,
                "cantidad": d.cantidad,
                "subtotal": d.subtotal,
            }
            for d in sorted(caja.detalle, key=lambda x: x.denominacion)
        ]
    })