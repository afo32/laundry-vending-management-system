from flask import Blueprint, request, jsonify
from app.database import db
from app.models.productos import Producto
from app.utils.auth_required import auth_required
from app.models.compras import Compra
from datetime import datetime

productos_bp = Blueprint("productos", __name__, url_prefix="/productos")


# ---------------------------------------------------
# FUNCIÓN PARA GENERAR CÓDIGO AUTOMÁTICO
# ---------------------------------------------------
def generar_codigo(subcategoria, nombre):
    print("SUBCATEGORIA RECIBIDA:", repr(subcategoria))

    sub = subcategoria.strip().lower()

    mapa_sub = {
        "bebida": "B",
        "bebidas": "B",
        "chuches": "CH",
        "parafarmacia": "P",
        "fumar": "F",
        "cafetera": "C"
    }

    inicial_sub = mapa_sub.get(sub, "")

    palabras = nombre.split()
    iniciales = "".join([p[0].upper() for p in palabras])

    return inicial_sub + iniciales



# ---------------------------------------------------
# GET: Obtener productos (con filtro por categoría)
# ---------------------------------------------------
@productos_bp.route("", methods=["GET"])
@auth_required
def obtener_productos():
    categoria = request.args.get("categoria")

    query = Producto.query

    if categoria:
        query = query.filter(Producto.categoria == categoria)

    productos = query.order_by(Producto.nombre.asc()).all()

    return jsonify([
        {
            "id": p.id,
            "codigo": p.codigo,
            "nombre": p.nombre,
            "categoria": p.categoria,
            "subcategoria": p.subcategoria,
            "stock": p.stock,
            "precio": p.precio,
            "precio_compra": p.precio_compra or 0.0
        }
        for p in productos
    ])


# ---------------------------------------------------
# GET: Obtener un producto por ID
# ---------------------------------------------------
@productos_bp.route("/<int:id>", methods=["GET"])
def obtener_producto(id):
    p = Producto.query.get_or_404(id)
    return jsonify({
        "id": p.id,
        "nombre": p.nombre,
        "codigo": p.codigo,
        "subcategoria": p.subcategoria,
        "categoria": p.categoria,
        "stock": p.stock,
        "precio": p.precio,
        "precio_compra": p.precio_compra or 0.0
    })

# ---------------------------------------------------
# POST: Crear un nuevo producto
# ---------------------------------------------------
@productos_bp.route("", methods=["POST"])
@auth_required
def crear_producto():
    data = request.get_json()

    nombre = data.get("nombre")
    categoria = data.get("categoria")
    subcategoria = data.get("subcategoria", "").strip().lower()
    stock = data.get("stock", 0)
    precio = data.get("precio", 0)
    precio_compra = data.get("precio_compra", 0.0)  # ← agregado

    if not nombre or not categoria:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    if not subcategoria:
        return jsonify({"error": "Subcategoría requerida"}), 400

    codigo = generar_codigo(subcategoria if categoria == "vending" else categoria, nombre)

    nuevo = Producto(
        codigo=codigo,
        nombre=nombre,
        categoria=categoria,
        subcategoria=subcategoria,
        stock=int(stock),
        precio=float(precio),
        precio_compra=float(precio_compra)  # ← agregado
    )

    db.session.add(nuevo)
    db.session.commit()
    
    if categoria == "vending" and int(stock) > 0 and float(precio_compra) > 0:
        compra = Compra()
        compra.producto_id = nuevo.id
        compra.cantidad = int(stock)
        compra.precio_unitario = float(precio_compra)
        compra.costo_total = float(precio_compra) * int(stock)
        compra.fecha = datetime.now()
        db.session.add(compra)
        db.session.commit()

    return jsonify({"message": "Producto creado correctamente", "id": nuevo.id}), 201


# ---------------------------------------------------
# PUT: Editar producto
# ---------------------------------------------------
@productos_bp.route("/<int:id>", methods=["PUT"])
def editar_producto(id):
    p = Producto.query.get_or_404(id)
    data = request.json

    p.nombre = data.get("nombre", p.nombre)
    p.codigo = data.get("codigo", p.codigo)
    p.subcategoria = data.get("subcategoria", p.subcategoria)
    p.stock = data.get("stock", p.stock)
    p.precio = float(data.get("precio", p.precio))
    if "precio_compra" in data:
        p.precio_compra = float(data["precio_compra"])

    db.session.commit()
    return jsonify({"message": "Producto actualizado"})
# ---------------------------------------------------
# DELETE: Eliminar producto
# ---------------------------------------------------
@productos_bp.route("/<int:id>", methods=["DELETE"])
def eliminar_producto(id):
    p = Producto.query.get_or_404(id)

    db.session.delete(p)
    db.session.commit()

    return jsonify({"message": "Producto eliminado"})

@productos_bp.route("/buscar", methods=["GET"])
@auth_required
def buscar_productos():
    q = request.args.get("q", "").upper()

    if not q:
        return jsonify([])

    productos = Producto.query.filter(Producto.codigo.like(f"%{q}%")).all()

    return jsonify([
        {
            "id": p.id,
            "codigo": p.codigo,
            "nombre": p.nombre,
            "categoria": p.categoria,
            "subcategoria": p.subcategoria,
            "stock": p.stock,
            "precio": p.precio
        }
        for p in productos
    ])
