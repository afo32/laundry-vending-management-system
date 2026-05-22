from flask import Blueprint, jsonify
from app.models.productos import Producto
from app.models.movimientos_inventario import MovimientoInventario

inventario_bp = Blueprint("inventario", __name__)

@inventario_bp.route("/inventario", methods=["GET"])
def ver_inventario():
    productos = Producto.query.all()
    return jsonify([{
        "id": p.id,
        "nombre": p.nombre,
        "stock_actual": p.stock_actual
    } for p in productos])

@inventario_bp.route("/inventario/movimientos", methods=["GET"])
def listar_movimientos():
    movimientos = MovimientoInventario.query.all()
    return jsonify([{
        "id": m.id,
        "producto_id": m.producto_id,
        "tipo": m.tipo,
        "cantidad": m.cantidad,
        "fecha": m.fecha.isoformat(),
        "referencia": m.referencia
    } for m in movimientos])
