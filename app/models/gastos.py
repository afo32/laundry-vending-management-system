from app.database import db
from datetime import datetime

class Gasto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.String(255), nullable=False)
    categoria = db.Column(db.String(100), nullable=False)
    importe = db.Column(db.Float, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.now)
