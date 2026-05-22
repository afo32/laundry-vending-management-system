from flask import Blueprint, request, jsonify
from app.database import db
from app.models.maquinas import Maquina

maquinas_bp = Blueprint("maquinas", __name__)

@maquinas_bp.route("/maquinas", methods=["GET"])
def listar_maquinas():
    maquinas = Maquina.query.all()
    return jsonify([{
        "id": m.id,
        "nombre": m.nombre,
        "tipo": m.tipo,
        "ubicacion": m.ubicacion,
        "estado": m.estado
    } for m in maquinas])

@maquinas_bp.route("/maquinas", methods=["POST"])
def crear_maquina():
    data = request.json
    maquina = Maquina(
        nombre=data["nombre"],
        tipo=data["tipo"],
        ubicacion=data.get("ubicacion"),
        estado=data.get("estado", "activa")
    )
    db.session.add(maquina)
    db.session.commit()
    return jsonify({"message": "Máquina creada", "id": maquina.id})
@maquinas_bp.route("/maquinas/<int:id>", methods=["PUT"])
def actualizar_maquina(id):
    maquina = Maquina.query.get_or_404(id)
    data = request.json
    maquina.nombre = data.get("nombre", maquina.nombre)
    maquina.tipo = data.get("tipo", maquina.tipo)
    maquina.ubicacion = data.get("ubicacion", maquina.ubicacion)
    maquina.estado = data.get("estado", maquina.estado)
    db.session.commit()
    return jsonify({"message": "Máquina actualizada"})