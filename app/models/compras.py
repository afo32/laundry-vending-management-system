from app.database import db
from datetime import datetime

class Compra(db.Model):
    __tablename__ = "compras"

    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey("productos.id"), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Float, nullable=True)  # ← precio por unidad
    costo_total = db.Column(db.Float, nullable=True)       # ← total de la compra
    fecha = db.Column(db.DateTime, default=datetime.now)

    proveedor = db.Column(db.String(255))
    factura = db.Column(db.String(255))
    notas = db.Column(db.Text)

    producto = db.relationship("Producto", back_populates="compras")