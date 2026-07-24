from app.database import db
from datetime import datetime

class EntradaMaquina(db.Model):
    __tablename__ = "entradas_maquina"

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    hucha = db.Column(db.Float, default=0.0)
    monedas = db.Column(db.Float, default=0.0)
    billetes = db.Column(db.Float, default=0.0)
    cambio = db.Column(db.Float, default=0.0)
    tarjeta = db.Column(db.Float, default=0.0)  # ← agregado
    creado_en = db.Column(db.DateTime, default=datetime.now)