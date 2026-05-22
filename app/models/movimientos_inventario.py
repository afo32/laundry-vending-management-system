from app.database import db
from datetime import datetime

class MovimientoInventario(db.Model):
    __tablename__ = "movimientos_inventario"

    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey("productos.id"), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # entrada, salida, ajuste
    cantidad = db.Column(db.Integer, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    referencia = db.Column(db.String(150))  # venta, compra, ajuste manual

    producto = db.relationship("Producto", back_populates="movimientos")
    def __repr__(self):
        return f"<MovimientoInventario {self.tipo} - Producto ID: {self.producto_id} - Cantidad: {self.cantidad}>"