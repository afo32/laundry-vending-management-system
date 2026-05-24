from app.database import db

class Maquina(db.Model):
    __tablename__ = "maquinas"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # lavadora, secadora, vending
    ubicacion = db.Column(db.String(150))
    estado = db.Column(db.String(50), default="activa")
    

    ventas = db.relationship("Venta", backref="maquina", lazy=True)

    def __repr__(self):
        return f"<Maquina {self.nombre} ({self.tipo})>"
