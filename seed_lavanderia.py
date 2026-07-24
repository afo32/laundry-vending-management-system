from app import create_app
from app.database import db
from app.models.productos import Producto

app = create_app()

productos = [
    {"nombre": "Lavadora 1", "categoria": "lavanderia", "precio": 6.0, "codigo": "LAV1"},
    {"nombre": "Lavadora 2", "categoria": "lavanderia", "precio": 6.0, "codigo": "LAV2"},
    {"nombre": "Lavadora 3", "categoria": "lavanderia", "precio": 7.0, "codigo": "LAV3"},
    {"nombre": "Secadora 1", "categoria": "lavanderia", "precio": 5.0, "codigo": "SEC1"},
    {"nombre": "Secadora 2", "categoria": "lavanderia", "precio": 5.0, "codigo": "SEC2"},
    {"nombre": "Incremento Secadora 1", "categoria": "lavanderia", "precio": 1.0, "codigo": "ISEC1"},
    {"nombre": "Incremento Secadora 2", "categoria": "lavanderia", "precio": 1.0, "codigo": "ISEC2"},
]

with app.app_context():
    for p in productos:
        existe = Producto.query.filter_by(codigo=p["codigo"]).first()
        if not existe:
            nuevo = Producto()
            nuevo.nombre = p["nombre"]
            nuevo.categoria = p["categoria"]
            nuevo.precio = p["precio"]
            nuevo.codigo = p["codigo"]
            db.session.add(nuevo)
    db.session.commit()
    print("Productos de lavandería insertados correctamente")