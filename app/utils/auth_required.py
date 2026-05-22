from functools import wraps
from flask import request, jsonify
import jwt
from app.config import Config
from app.models.usuario import Usuario

def auth_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"error": "Token requerido"}), 401

        try:
            token = token.replace("Bearer ", "")
            data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
            usuario = Usuario.query.get(data["user_id"])
            if not usuario:
                return jsonify({"error": "Token inválido"}), 401
        except Exception:
            return jsonify({"error": "Token inválido o expirado"}), 401

        return f(*args, **kwargs)

    return wrapper
