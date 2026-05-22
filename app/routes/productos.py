from flask import Blueprint, request, jsonify
from app.database import db
from app.models.productos import Producto
from app.utils.auth_required import auth_required

productos_bp = Blueprint("productos", __name__, url_prefix="/productos")


# ---------------------------------------------------
# FUNCIÓN PARA GENERAR CÓDIGO AUTOMÁTICO
# ---------------------------------------------------
def generar_codigo(subcategoria, nombre):
    mapa_sub = {
        "bebida": "B",
        "chuches": "CH",
        "parafarmacia": "P",
        "fumar": "F",
        "cafetera": "C"
    }

    inicial_sub = mapa_sub.get(subcategoria.lower(), "")

    # Iniciales del nombre del producto
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
            "precio": p.precio
        }
        for p in productos
    ])


# ---------------------------------------------------
# GET: Obtener un producto por ID
# ---------------------------------------------------
@productos_bp.route("/<int:id>", methods=["GET"])
@auth_required
def obtener_producto(id):
    p = Producto.query.get_or_404(id)

    return jsonify({
        "id": p.id,
        "codigo": p.codigo,
        "nombre": p.nombre,
        "categoria": p.categoria,
        "subcategoria": p.subcategoria,
        "stock": p.stock,
        "precio": p.precio
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
    subcategoria = data.get("subcategoria")  # solo para vending
    stock = data.get("stock", 0)
    precio = data.get("precio", 0)

    if not nombre or not categoria:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    # Generar código automáticamente
    codigo = generar_codigo(subcategoria if categoria == "vending" else categoria, nombre)

    nuevo = Producto(
        codigo=codigo,
        nombre=nombre,
        categoria=categoria,
        subcategoria=subcategoria,
        stock=int(stock),
        precio=float(precio)
    )

    db.session.add(nuevo)
    db.session.commit()

    return jsonify({"message": "Producto creado correctamente", "id": nuevo.id}), 201


# ---------------------------------------------------
# PUT: Editar producto
# ---------------------------------------------------
@productos_bp.route("/<int:id>", methods=["PUT"])
@auth_required
def editar_producto(id):
    p = Producto.query.get_or_404(id)
    data = request.get_json()

    if "nombre" in data:
        p.nombre = data["nombre"]

    if "categoria" in data:
        p.categoria = data["categoria"]

    if "subcategoria" in data:
        p.subcategoria = data["subcategoria"]

    if "stock" in data:
        p.stock = int(data["stock"])

    if "precio" in data:
        p.precio = float(data["precio"])

    # Si cambia nombre o subcategoría → regenerar código
    if "nombre" in data or "subcategoria" in data:
        sub = p.subcategoria if p.categoria == "vending" else p.categoria
        p.codigo = generar_codigo(sub, p.nombre)

    db.session.commit()

    return jsonify({"message": "Producto actualizado correctamente"})


# ---------------------------------------------------
# DELETE: Eliminar producto
# ---------------------------------------------------
@productos_bp.route("/<int:id>", methods=["DELETE"])
@auth_required
def eliminar_producto(id):
    p = Producto.query.get_or_404(id)

    db.session.delete(p)
    db.session.commit()

    return jsonify({"message": "Producto eliminado correctamente"})

@productos_bp.route("/buscar/<codigo>", methods=["GET"])
@auth_required
def buscar_por_codigo(codigo):
    p = Producto.query.filter(Producto.codigo == codigo.upper()).first()

    if not p:
        return jsonify({"error": "Producto no encontrado"}), 404

    return jsonify({
        "id": p.id,
        "codigo": p.codigo,
        "nombre": p.nombre,
        "categoria": p.categoria,
        "subcategoria": p.subcategoria,
        "stock": p.stock,
        "precio": p.precio
    })

