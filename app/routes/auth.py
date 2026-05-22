from flask import Blueprint, request, jsonify
from app.models.usuario import Usuario
from app.config import Config
import jwt
from datetime import datetime, timedelta

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    usuario = Usuario.query.filter_by(username=username).first()

    if not usuario or not usuario.check_password(password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    token = jwt.encode(
        {
            "user_id": usuario.id,
            "exp": datetime.utcnow() + timedelta(hours=12)
        },
        Config.JWT_SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({"token": token})
