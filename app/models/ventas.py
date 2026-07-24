# app/models/ventas.py
from app.database import db
from datetime import datetime

class Venta(db.Model):
    __tablename__ = "ventas"

    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey("productos.id"), nullable=True)  # ← cambiado
    maquina_id = db.Column(db.Integer, db.ForeignKey("maquinas.id"), nullable=True)
    cantidad = db.Column(db.Integer, nullable=False)
    precio = db.Column(db.Float, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.now)

    producto = db.relationship("Producto")

    dia_id = db.Column(db.Integer, db.ForeignKey("ventas_dia.id"))
    dia = db.relationship("VentaDia", back_populates="ventas")