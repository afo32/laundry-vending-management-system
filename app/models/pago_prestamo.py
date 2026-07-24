from app.database import db
from datetime import datetime

class PagoPrestamo(db.Model):
    __tablename__ = "pagos_prestamo"

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    tarjeta = db.Column(db.Float, default=0.0)
    efectivo = db.Column(db.Float, default=0.0)
    creado_en = db.Column(db.DateTime, default=datetime.now)