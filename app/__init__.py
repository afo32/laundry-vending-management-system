import os
from flask import app, send_from_directory, Flask, request
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
from app.routes.venta_dia import ventas_dia_bp
from app.routes.caja import caja_bp
from app.routes.ganancia import ganancia_bp
from app.routes.resumen_maquina import resumen_bp
from app.routes.trimestral import trimestral_bp
from app.routes.pago_prestamo import pago_prestamo_bp
from app.routes.merma import merma_bp
from app.routes.cambio_urgente import cambio_urgente_bp

from app.utils.auth_required import auth_required

# Rutas de API que requieren autenticación
API_PREFIXES = (
    "/productos", "/ventas", "/compras", "/gastos", "/maquinas",
    "/inventario", "/reportes", "/resumen-maquina", "/caja",
    "/ganancia", "/trimestral", "/pagos-prestamo", "/merma",
    "/cambio-urgente", "/login"
)

# Archivos estáticos del frontend que nunca requieren auth
STATIC_EXTENSIONS = (
    ".js", ".css", ".png", ".svg", ".ico", ".json", ".webmanifest", ".txt"
)


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    import os
    print("SERVICIO:", os.environ.get("RAILWAY_SERVICE_ID"), os.environ.get("RAILWAY_SERVICE_NAME"), flush=True)
    print("ENTORNO:", os.environ.get("RAILWAY_ENVIRONMENT_NAME"), flush=True)
    print("DOMINIO:", os.environ.get("RAILWAY_PUBLIC_DOMAIN"), flush=True)
    print("PROYECTO:", os.environ.get("RAILWAY_PROJECT_NAME"), flush=True)

    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}}, expose_headers=["Authorization"])

    db.init_app(app)

    # Registrar blueprints
    app.register_blueprint(productos_bp)
    app.register_blueprint(maquinas_bp, url_prefix="/maquinas")
    app.register_blueprint(ventas_bp)
    app.register_blueprint(compras_bp)
    app.register_blueprint(gastos_bp)
    app.register_blueprint(inventario_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(reportes_bp, url_prefix="/reportes")
    app.register_blueprint(ventas_dia_bp)
    app.register_blueprint(caja_bp)
    app.register_blueprint(ganancia_bp)
    app.register_blueprint(resumen_bp)
    app.register_blueprint(trimestral_bp)
    app.register_blueprint(pago_prestamo_bp)
    app.register_blueprint(merma_bp)
    app.register_blueprint(cambio_urgente_bp)

    @app.before_request
    def proteger_todo():
        # Permitir preflight OPTIONS
        if request.method == "OPTIONS":
            return ""

        # Permitir archivos estáticos del frontend
        if any(request.path.endswith(ext) for ext in STATIC_EXTENSIONS):
            return

        # Permitir rutas del frontend (React Router) — no son API
        if not any(request.path.startswith(prefix) for prefix in API_PREFIXES):
            return

        # Permitir login sin auth
        if request.path == "/login":
            return

        # Todo lo demás requiere auth
        return auth_required(lambda: None)()

    with app.app_context():
        db.create_all()

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        dist_dir = os.path.join(os.path.dirname(app.root_path), "dist")
        if path and os.path.exists(os.path.join(dist_dir, path)):
            return send_from_directory(dist_dir, path)
        return send_from_directory(dist_dir, "index.html")

    return app