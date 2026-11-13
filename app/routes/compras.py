from flask import Blueprint, request, jsonify
from app.database import db
from app.models.compras import Compra
from app.models.productos import Producto
from app.utils.auth_required import auth_required
from datetime import datetime
from sqlalchemy import func
from app.routes.productos import generar_codigo

compras_bp = Blueprint("compras", __name__, url_prefix="/compras")


# -----------------------------------
# GET: Obtener todas las compras
# -----------------------------------
@compras_bp.route("", methods=["GET"])
@auth_required
def obtener_compras():
    categoria = request.args.get("categoria")
    producto_id = request.args.get("producto_id")
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    query = Compra.query.join(Producto)

    if categoria:
        query = query.filter(Producto.categoria == categoria)
    if producto_id:
        query = query.filter(Compra.producto_id == producto_id)
    if desde:
        query = query.filter(Compra.fecha >= desde)
    if hasta:
        query = query.filter(Compra.fecha <= hasta + " 23:59:59")

    compras = query.order_by(Compra.fecha.desc()).all()

    return jsonify([
    {
        "id": c.id,
        "producto_id": c.producto_id,
        "producto": c.producto.nombre if c.producto else None,
        "cantidad": c.cantidad,
        "precio": c.precio_unitario or 0,
        "total": c.costo_total or 0,
        "fecha": c.fecha.strftime("%Y-%m-%d"),
    }
    for c in compras
])


# -----------------------------------
# GET: Obtener una compra por ID
# -----------------------------------
@compras_bp.route("/<int:id>", methods=["GET"])
@auth_required
def obtener_compra(id):
    compra = Compra.query.get_or_404(id)

    return jsonify([
    {
        "id": compra.id,
        "producto_id": compra.producto_id,
        "producto": compra.producto.nombre if compra.producto else None,
        "cantidad": compra.cantidad,
        "precio": compra.costo_total / compra.cantidad if compra.cantidad and compra.costo_total else 0,
        "total": compra.costo_total or 0,
        "fecha": compra.fecha.strftime("%Y-%m-%d"),
    }
])


# -----------------------------------
# POST: Crear una nueva compra
# -----------------------------------
@compras_bp.route("", methods=["POST"])
@auth_required
def crear_compra():
    data = request.get_json()

    categoria = data.get("categoria")
    producto_id = data.get("producto_id")
    cantidad = data.get("cantidad")
    precio = data.get("precio")
    fecha = data.get("fecha")
    proveedor = data.get("proveedor")
    factura = data.get("factura")
    notas = data.get("notas")

    if not categoria or not producto_id or not cantidad or not precio:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    try:
        fecha_dt = datetime.strptime(fecha, "%Y-%m-%d") if fecha else datetime.now()
    except:
        fecha_dt = datetime.now()

    nueva = Compra(
        categoria=categoria,
        producto_id=producto_id,
        cantidad=int(cantidad),
        precio=float(precio),
        fecha=fecha_dt,
        proveedor=proveedor,
        factura=factura,
        notas=notas
    )

    db.session.add(nueva)
    db.session.commit()

    return jsonify({"message": "Compra creada correctamente", "id": nueva.id}), 201


# -----------------------------------
# PUT: Editar una compra existente
# -----------------------------------
@compras_bp.route("/<int:id>", methods=["PUT"])
@auth_required
def editar_compra(id):
    compra = Compra.query.get_or_404(id)
    data = request.get_json()

    compra.categoria = data.get("categoria", compra.categoria)
    compra.producto_id = data.get("producto_id", compra.producto_id)
    compra.cantidad = int(data.get("cantidad", compra.cantidad))
    compra.precio = float(data.get("precio", compra.precio))

    if "fecha" in data:
        try:
            compra.fecha = datetime.strptime(data["fecha"], "%Y-%m-%d")
        except:
            pass

    db.session.commit()

    return jsonify({"message": "Compra actualizada correctamente"})


# -----------------------------------
# DELETE: Eliminar una compra
# -----------------------------------
@compras_bp.route("/<int:id>", methods=["DELETE"])
@auth_required
def eliminar_compra(id):
    compra = Compra.query.get_or_404(id)

    db.session.delete(compra)
    db.session.commit()

    return jsonify({"message": "Compra eliminada correctamente"})

@compras_bp.route("/rapida", methods=["POST"])
@auth_required
def compra_rapida():
    data = request.get_json() or {}

    categoria = data.get("categoria")
    subcategoria = (data.get("subcategoria") or "").strip().lower()
    nombre = (data.get("nombre") or "").strip()
    fecha_str = data.get("fecha")

    try:
        cantidad = int(data.get("cantidad"))
        precio_compra = float(data.get("precio_compra"))
    except (TypeError, ValueError):
        return jsonify({"error": "Cantidad y precio de compra son obligatorios"}), 400

    if categoria not in ("lavanderia", "vending") or not nombre:
        return jsonify({"error": "Categoría y nombre son obligatorios"}), 400
    if categoria == "vending" and not subcategoria:
        return jsonify({"error": "La subcategoría es obligatoria en vending"}), 400
    if cantidad <= 0 or precio_compra < 0:
        return jsonify({"error": "Cantidad o precio no válidos"}), 400

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d") if fecha_str else datetime.now()
    except ValueError:
        fecha = datetime.now()

    # ¿Ya existe el artículo? (mismo nombre y categoría, sin distinguir mayúsculas)
    producto = Producto.query.filter(
        func.lower(Producto.nombre) == nombre.lower(),
        Producto.categoria == categoria,
    ).first()

    creado = False
    if producto:
        producto.stock = (producto.stock or 0) + cantidad
        producto.precio_compra = precio_compra
    else:
        creado = True
        producto = Producto(
            codigo=generar_codigo(subcategoria if categoria == "vending" else categoria, nombre),
            nombre=nombre,
            categoria=categoria,
            subcategoria=subcategoria if categoria == "vending" else "",
            stock=cantidad,
            precio=float(data.get("precio_venta") or 0),
            precio_compra=precio_compra,
        )
        db.session.add(producto)
        db.session.flush()

    compra = Compra()
    compra.producto_id = producto.id
    compra.cantidad = cantidad
    compra.precio_unitario = precio_compra
    compra.costo_total = round(precio_compra * cantidad, 2)
    compra.fecha = fecha
    db.session.add(compra)
    db.session.commit()

    return jsonify({
        "message": "Producto creado" if creado else "Stock actualizado",
        "creado": creado,
        "producto": producto.nombre,
        "codigo": producto.codigo,
        "stock": producto.stock,
    }), 201
