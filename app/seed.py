from app.database import db
from app.models.productos import Producto
from app.models.maquinas import Maquina

PRODUCTOS_LAVANDERIA = [
    ("Lavadora 1", "LAV1", 6.0),
    ("Lavadora 2", "LAV2", 6.0),
    ("Lavadora 3", "LAV3", 7.0),
    ("Secadora 1", "SEC1", 5.0),
    ("Secadora 2", "SEC2", 5.0),
    ("Incremento Secadora 1", "ISEC1", 1.0),
    ("Incremento Secadora 2", "ISEC2", 1.0),
]

PRODUCTOS_CAFE = [
    ("Cafe normal", 0.7),
    ("Cafe largo", 0.8),
    ("Cafe cortado", 0.7),
    ("Cafe con leche", 1.0),
    ("Capuchino", 1.1),
    ("Descafeinado", 0.7),
    ("Descafeinado largo", 0.8),
    ("Descafeinado cortado", 0.7),
    ("Descafeinado con leche", 1.0),
    ("Descafeinado capuchino", 1.1),
    ("Chocolate", 1.1),
    ("Chocolate con leche", 1.2),
    ("Leche", 0.6),
    ("Vaso", 0.2),
    ("Cafe avellana", 1.2),
    ("Agua caliente", 0.2),
    ("Cafe vainilla", 1.2),
    ("Leche manchada con chocolate", 0.8),
    ("Leche manchada", 0.7),
    ("Leche manchada descafeinado", 0.8),
]

MAQUINAS = [
    ("L1", "lavadora"),
    ("L2", "lavadora"),
    ("L3", "lavadora"),
    ("S1", "secadora"),
    ("S2", "secadora"),
    ("IS1", "incremento secadora"),
    ("IS2", "incremento secadora"),
    ("Cafetera", "vending"),
    ("Comida", "vending"),
]


def _crear_producto(nombre, codigo, categoria, precio):
    p = Producto()
    p.nombre = nombre
    p.codigo = codigo
    p.categoria = categoria
    p.subcategoria = ""
    p.precio = precio
    p.precio_compra = 0.0
    p.stock = 0
    db.session.add(p)


def seed_datos():
    for nombre, codigo, precio in PRODUCTOS_LAVANDERIA:
        if not Producto.query.filter_by(codigo=codigo).first():
            _crear_producto(nombre, codigo, "lavanderia", precio)

    for i, (nombre, precio) in enumerate(PRODUCTOS_CAFE, start=1):
        if not Producto.query.filter_by(nombre=nombre, categoria="cafe").first():
            _crear_producto(nombre, f"CAF{i:02d}", "cafe", precio)

    for nombre, tipo in MAQUINAS:
        if not Maquina.query.filter_by(nombre=nombre).first():
            m = Maquina()
            m.nombre = nombre
            m.tipo = tipo
            m.estado = "activa"
            db.session.add(m)

    db.session.commit()