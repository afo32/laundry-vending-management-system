from app.database import db
from datetime import datetime

class Merma(db.Model):
    __tablename__ = "mermas"

    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey("productos.id"), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    creado_en = db.Column(db.DateTime, default=datetime.now)
    origen = db.Column(db.String(20), default="manual")  # "manual" o "inventario"

    producto = db.relationship("Producto")