from flask import Blueprint, request, jsonify
from app.database import db
from app.models.ganancia import Ganancia, GananciaDetalle
from app.utils.auth_required import auth_required
from datetime import datetime

ganancia_bp = Blueprint("ganancia", __name__, url_prefix="/ganancia")

@ganancia_bp.route("", methods=["GET"])
@auth_required
def listar_ganancias():
    tipo = request.args.get("tipo")
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    query = Ganancia.query
    if tipo:
        query = query.filter(Ganancia.tipo == tipo)
    if desde:
        query = query.filter(Ganancia.fecha >= desde)
    if hasta:
        query = query.filter(Ganancia.fecha <= hasta)

    ganancias = query.order_by(Ganancia.fecha.desc()).all()

    return jsonify([
    {
        "id": g.id,
        "fecha": g.fecha.isoformat(),
        "tipo": g.tipo,
        "total": g.total,
        "retirado": g.retirado,
        "fecha_retiro": g.fecha_retiro.isoformat() if g.fecha_retiro else None,
        "total_retirado_monedas": g.total_retirado_monedas or 0,
        "total_retirado_billetes": g.total_retirado_billetes or 0,
    }
    for g in ganancias
])

@ganancia_bp.route("/buscar", methods=["GET"])
@auth_required
def buscar_ganancia():
    fecha_str = request.args.get("fecha")
    tipo = request.args.get("tipo")

    if not fecha_str or not tipo:
        return jsonify(None), 200

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except:
        return jsonify(None), 200

    g = Ganancia.query.filter_by(fecha=fecha, tipo=tipo).first()
    if not g:
        return jsonify(None), 200

    return jsonify({
        "id": g.id,
        "fecha": g.fecha.isoformat(),
        "tipo": g.tipo,
        "total": g.total,
        "detalle": [
            {
                "denominacion": d.denominacion,
                "cantidad": d.cantidad,
                "subtotal": d.subtotal,
            }
            for d in sorted(g.detalle, key=lambda x: x.denominacion)
        ]
    })
    
    
@ganancia_bp.route("/<int:id>", methods=["GET"])
@auth_required
def obtener_ganancia(id):
    g = Ganancia.query.get_or_404(id)
    return jsonify({
        "id": g.id,
        "fecha": g.fecha.isoformat(),
        "tipo": g.tipo,
        "total": g.total,
        "retirado": g.retirado,
        "total_retirado_monedas": g.total_retirado_monedas or 0,
        "total_retirado_billetes": g.total_retirado_billetes or 0,
        "detalle": [
            {
                "denominacion": d.denominacion,
                "cantidad": d.cantidad,
                "subtotal": d.subtotal,
            }
            for d in sorted(g.detalle, key=lambda x: x.denominacion)
        ]
    })

@ganancia_bp.route("", methods=["POST"])
@auth_required
def crear_ganancia():
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

    # Upsert
    g = Ganancia.query.filter_by(fecha=fecha, tipo=tipo).first()
    if g:
        GananciaDetalle.query.filter_by(ganancia_id=g.id).delete()
        g.total = round(total, 2)
        g.creado_en = datetime.now()
    else:
        g = Ganancia()
        g.fecha = fecha
        g.tipo = tipo
        g.total = round(total, 2)
        db.session.add(g)

    db.session.flush()

    for item in detalle:
        d = GananciaDetalle()
        d.ganancia_id = g.id
        d.denominacion = item.get("denominacion")
        d.cantidad = int(item.get("cantidad", 0))
        d.subtotal = round(d.cantidad * d.denominacion, 2)
        db.session.add(d)

    db.session.commit()
    return jsonify({"message": "Ganancia guardada", "id": g.id}), 201

@ganancia_bp.route("/<int:id>/retirar", methods=["POST"])
@auth_required
def retirar_ganancia(id):
    g = Ganancia.query.get_or_404(id)

    # Poner todas las cantidades en 0
    for d in g.detalle:
        d.cantidad = 0
        d.subtotal = 0.0
    g.total = 0.0
    g.retirado = True
    g.fecha_retiro = datetime.now()

    db.session.commit()
    return jsonify({"message": "Ganancia retirada"})

@ganancia_bp.route("/<int:id>", methods=["DELETE"])
@auth_required
def eliminar_ganancia(id):
    g = Ganancia.query.get_or_404(id)
    db.session.delete(g)
    db.session.commit()
    return jsonify({"message": "Ganancia eliminada"})

@ganancia_bp.route("/<int:id>/retirar-denominacion", methods=["POST"])
@auth_required
def retirar_denominacion(id):
    data = request.get_json()
    denominacion = data.get("denominacion")

    if denominacion is None:
        return jsonify({"error": "denominacion es obligatoria"}), 400

    g = Ganancia.query.get_or_404(id)
    detalle = GananciaDetalle.query.filter_by(
        ganancia_id=id, denominacion=denominacion
    ).first()

    if not detalle:
        return jsonify({"error": "Denominación no encontrada"}), 404

    monto_retirado = detalle.subtotal

    # Acumular en monedas o billetes
    if denominacion <= 2:
        g.total_retirado_monedas = round((g.total_retirado_monedas or 0) + monto_retirado, 2)
    else:
        g.total_retirado_billetes = round((g.total_retirado_billetes or 0) + monto_retirado, 2)

    g.total = round(g.total - monto_retirado, 2)
    detalle.cantidad = 0
    detalle.subtotal = 0.0

    if all(d.cantidad == 0 for d in g.detalle):
        g.retirado = True
        g.fecha_retiro = datetime.now()

    db.session.commit()
    return jsonify({"message": "Denominación retirada"})