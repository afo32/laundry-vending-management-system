from app.database import db

class Producto(db.Model):
    __tablename__ = "productos"

    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True, nullable=False)
    nombre = db.Column(db.String(255), nullable=False)
    categoria = db.Column(db.String(50), nullable=False)  # lavadoras / vending
    subcategoria = db.Column(db.String(50))  # bebida, chuches, parafarmacia, fumar, cafetera
    stock = db.Column(db.Integer, default=0)
    precio = db.Column(db.Float, default=0)


    ventas = db.relationship("Venta", back_populates="producto")
    compras = db.relationship("Compra", back_populates="producto")
    movimientos = db.relationship("MovimientoInventario", back_populates="producto")
    def __repr__(self):
        return f"<Producto {self.nombre}>"