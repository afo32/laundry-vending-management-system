from app.database import db
from datetime import datetime

class CambioUrgente(db.Model):
    __tablename__ = "cambios_urgentes"

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    denominacion = db.Column(db.Float, nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Float, nullable=False)
    creado_en = db.Column(db.DateTime, default=datetime.now)