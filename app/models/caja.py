from app.database import db
from datetime import datetime

class Caja(db.Model):
    __tablename__ = "cajas"

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # "expendedora" o "lavanderia"
    total = db.Column(db.Float, nullable=False, default=0.0)
    creado_en = db.Column(db.DateTime, default=datetime.now)

    detalle = db.relationship("CajaDetalle", back_populates="caja", cascade="all, delete-orphan")

class CajaDetalle(db.Model):
    __tablename__ = "cajas_detalle"

    id = db.Column(db.Integer, primary_key=True)
    caja_id = db.Column(db.Integer, db.ForeignKey("cajas.id"), nullable=False)
    denominacion = db.Column(db.Float, nullable=False)
    cantidad = db.Column(db.Integer, nullable=False, default=0)
    subtotal = db.Column(db.Float, nullable=False, default=0.0)

    caja = db.relationship("Caja", back_populates="detalle")