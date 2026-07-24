from app import create_app
from app.database import db
from app.models.productos import Producto

app = create_app()

productos = [
    {"nombre": "Cafe normal", "precio": 0.7},
    {"nombre": "Cafe largo", "precio": 0.8},
    {"nombre": "Cafe cortado", "precio": 0.7},
    {"nombre": "Cafe con leche", "precio": 1.0},
    {"nombre": "Capuchino", "precio": 1.1},
    {"nombre": "Descafeinado", "precio": 0.7},
    {"nombre": "Descafeinado largo", "precio": 0.8},
    {"nombre": "Descafeinado cortado", "precio": 0.7},
    {"nombre": "Descafeinado con leche", "precio": 1.0},
    {"nombre": "Descafeinado capuchino", "precio": 1.1},
    {"nombre": "Chocolate", "precio": 1.1},
    {"nombre": "Chocolate con leche", "precio": 1.2},
    {"nombre": "Leche", "precio": 0.6},
    {"nombre": "Vaso", "precio": 0.2},
    {"nombre": "Cafe avellana", "precio": 1.2},
    {"nombre": "Agua caliente", "precio": 0.2},
    {"nombre": "Cafe vainilla", "precio": 1.2},
    {"nombre": "Leche manchada con chocolate", "precio": 0.8},
    {"nombre": "Leche manchada", "precio": 0.7},
    {"nombre": "Leche manchada descafeinado", "precio": 0.8},
]

with app.app_context():
    for p in productos:
        existe = Producto.query.filter_by(nombre=p["nombre"], categoria="cafe").first()
        if not existe:
            nuevo = Producto()
            nuevo.nombre = p["nombre"]
            nuevo.categoria = "cafe"
            nuevo.codigo = "CAF" + p["nombre"].replace(" ", "")[:4].upper()
            nuevo.precio = p["precio"]
            nuevo.precio_compra = 0.0
            nuevo.stock = 0
            nuevo.subcategoria = ""
            db.session.add(nuevo)
    db.session.commit()
    print("Productos de café insertados correctamente")