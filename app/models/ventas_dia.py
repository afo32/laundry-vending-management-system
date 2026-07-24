from app.database import db
from datetime import datetime

class VentaDia(db.Model):
    __tablename__ = "ventas_dia"

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, default=datetime.utcnow)
    categoria = db.Column(db.String(50), nullable=False)

    ventas = db.relationship("Venta", back_populates="dia")

    def __repr__(self):
            return f"<VentaDia {self.fecha} - {self.categoria}>"