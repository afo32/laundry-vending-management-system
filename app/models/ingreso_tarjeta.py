from app.database import db

class IngresoTarjeta(db.Model):
    __tablename__ = "ingresos_tarjeta"

    id = db.Column(db.Integer, primary_key=True)
    mes = db.Column(db.Integer, nullable=False)
    año = db.Column(db.Integer, nullable=False)
    monto = db.Column(db.Float, default=0.0)
    efectivo_h = db.Column(db.Float, default=0.0)  # ← agregado