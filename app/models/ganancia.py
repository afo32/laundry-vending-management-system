from app.database import db
from datetime import datetime

class Ganancia(db.Model):
    __tablename__ = "ganancias"

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    total = db.Column(db.Float, nullable=False, default=0.0)
    retirado = db.Column(db.Boolean, default=False)
    fecha_retiro = db.Column(db.DateTime, nullable=True)
    creado_en = db.Column(db.DateTime, default=datetime.now)

    # ← agregado
    total_retirado_monedas = db.Column(db.Float, default=0.0)
    total_retirado_billetes = db.Column(db.Float, default=0.0)

    detalle = db.relationship("GananciaDetalle", back_populates="ganancia", cascade="all, delete-orphan")

class GananciaDetalle(db.Model):
    __tablename__ = "ganancias_detalle"

    id = db.Column(db.Integer, primary_key=True)
    ganancia_id = db.Column(db.Integer, db.ForeignKey("ganancias.id"), nullable=False)
    denominacion = db.Column(db.Float, nullable=False)
    cantidad = db.Column(db.Integer, nullable=False, default=0)
    subtotal = db.Column(db.Float, nullable=False, default=0.0)

    ganancia = db.relationship("Ganancia", back_populates="detalle")