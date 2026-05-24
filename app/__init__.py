from flask import Flask, request
from app.config import Config
from app.database import db
from flask_cors import CORS

# Importar modelos a nivel de módulo
from app.models import *

# Importar blueprints a nivel de módulo
from app.routes.productos import productos_bp
from app.routes.maquinas import maquinas_bp
from app.routes.ventas import ventas_bp
from app.routes.compras import compras_bp
from app.routes.gastos import gastos_bp
from app.routes.inventario import inventario_bp
from app.routes.auth import auth_bp
from app.routes.reportes import reportes_bp

# Decorador de autenticación
from app.utils.auth_required import auth_required


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS para permitir React
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}}, expose_headers=["Authorization"])

    db.init_app(app)

    # Registrar blueprints
    app.register_blueprint(productos_bp)
    app.register_blueprint(maquinas_bp)
    app.register_blueprint(ventas_bp)
    app.register_blueprint(compras_bp)
    app.register_blueprint(gastos_bp)
    app.register_blueprint(inventario_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(reportes_bp, url_prefix="/reportes")


    # Rutas públicas
    EXCLUDED_ROUTES = {"/login"}

    @app.before_request
    def proteger_todo():
        # Permitir preflight OPTIONS (React → Flask)
        if request.method == "OPTIONS":
            return ""

        # Permitir rutas públicas
        if request.path in EXCLUDED_ROUTES:
            return

        # Proteger todo lo demás
        return auth_required(lambda: None)()

    with app.app_context():
        db.create_all()

    return app
