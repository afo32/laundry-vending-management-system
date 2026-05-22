from flask import Blueprint, request, jsonify
from app.database import db
from app.models.gastos import Gasto
from app.utils.auth_required import auth_required
from datetime import datetime

gastos_bp = Blueprint("gastos", __name__, url_prefix="/gastos")


# -----------------------------
# GET: Obtener todos los gastos
# -----------------------------
@gastos_bp.route("", methods=["GET"])
@auth_required
def obtener_gastos():
    gastos = Gasto.query.order_by(Gasto.fecha.desc()).all()

    return jsonify([
        {
            "id": g.id,
            "descripcion": g.descripcion,
            "categoria": g.categoria,
            "importe": g.importe,
            "fecha": g.fecha.strftime("%Y-%m-%d")
        }
        for g in gastos
    ])


# --------------------------------
# GET: Obtener un gasto por su ID
# --------------------------------
@gastos_bp.route("/<int:id>", methods=["GET"])
@auth_required
def obtener_gasto(id):
    gasto = Gasto.query.get_or_404(id)

    return jsonify({
        "id": gasto.id,
        "descripcion": gasto.descripcion,
        "categoria": gasto.categoria,
        "importe": gasto.importe,
        "fecha": gasto.fecha.strftime("%Y-%m-%d")
    })


# -----------------------------
# POST: Crear un nuevo gasto
# -----------------------------
@gastos_bp.route("", methods=["POST"])
@auth_required
def crear_gasto():
    data = request.get_json()

    descripcion = data.get("descripcion")
    categoria = data.get("categoria")
    importe = data.get("importe")

    if not descripcion or not categoria or importe is None:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    nuevo = Gasto(
        descripcion=descripcion,
        categoria=categoria,
        importe=float(importe),
        fecha=datetime.now()
    )

    db.session.add(nuevo)
    db.session.commit()

    return jsonify({"message": "Gasto creado correctamente", "id": nuevo.id}), 201


# -----------------------------
# PUT: Editar un gasto existente
# -----------------------------
@gastos_bp.route("/<int:id>", methods=["PUT"])
@auth_required
def editar_gasto(id):
    gasto = Gasto.query.get_or_404(id)
    data = request.get_json()

    gasto.descripcion = data.get("descripcion", gasto.descripcion)
    gasto.categoria = data.get("categoria", gasto.categoria)
    gasto.importe = float(data.get("importe", gasto.importe))

    db.session.commit()

    return jsonify({"message": "Gasto actualizado correctamente"})


# -----------------------------
# DELETE: Eliminar un gasto
# -----------------------------
@gastos_bp.route("/<int:id>", methods=["DELETE"])
@auth_required
def eliminar_gasto(id):
    gasto = Gasto.query.get_or_404(id)

    db.session.delete(gasto)
    db.session.commit()

    return jsonify({"message": "Gasto eliminado correctamente"})
