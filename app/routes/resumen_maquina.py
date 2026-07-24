from flask import Blueprint, request, jsonify
from app.database import db
from app.models.resumen_maquina import EntradaMaquina
from app.models.ganancia import Ganancia
from app.models.ventas import Venta
from app.models.productos import Producto
from app.utils.auth_required import auth_required
from sqlalchemy import func
from datetime import datetime

resumen_bp = Blueprint("resumen", __name__, url_prefix="/resumen-maquina")


# -----------------------------------
# GET: Listar entradas (historial)
# -----------------------------------
@resumen_bp.route("/entradas", methods=["GET"])
@auth_required
def listar_entradas():
    tipo = request.args.get("tipo")
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    query = EntradaMaquina.query
    if tipo:
        query = query.filter(EntradaMaquina.tipo == tipo)
    if desde:
        query = query.filter(EntradaMaquina.fecha >= desde)
    if hasta:
        query = query.filter(EntradaMaquina.fecha <= hasta)

    entradas = query.order_by(EntradaMaquina.fecha.desc()).all()
    

    return jsonify([
        {
            "id": e.id,
            "fecha": e.fecha.isoformat(),
            "tipo": e.tipo,
            "hucha": e.hucha,
            "monedas": e.monedas,
            "billetes": e.billetes,
            "cambio": e.cambio,
            "total_entrada": round(e.hucha + e.monedas + e.billetes, 2),
            "tarjeta": e.tarjeta or 0,
        }
        for e in entradas
    ])


# -----------------------------------
# POST: Crear un registro de entrada
# -----------------------------------
@resumen_bp.route("/entradas", methods=["POST"])
@auth_required
def crear_entrada():
    data = request.get_json()

    fecha_str = data.get("fecha")
    tipo = data.get("tipo")

    if not fecha_str or not tipo:
        return jsonify({"error": "fecha y tipo son obligatorios"}), 400

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except:
        return jsonify({"error": "Formato de fecha inválido"}), 400

    entrada = EntradaMaquina()
    entrada.fecha = fecha
    entrada.tipo = tipo
    entrada.hucha = float(data.get("hucha", 0))
    entrada.monedas = float(data.get("monedas", 0))
    entrada.billetes = float(data.get("billetes", 0))
    entrada.cambio = float(data.get("cambio", 0))
    entrada.tarjeta = float(data.get("tarjeta", 0))

    db.session.add(entrada)
    db.session.commit()

    return jsonify({"message": "Entrada guardada", "id": entrada.id}), 201


# -----------------------------------
# DELETE: Eliminar un registro de entrada
# -----------------------------------
@resumen_bp.route("/entradas/<int:id>", methods=["DELETE"])
@auth_required
def eliminar_entrada(id):
    entrada = EntradaMaquina.query.get_or_404(id)
    db.session.delete(entrada)
    db.session.commit()
    return jsonify({"message": "Entrada eliminada"})


# -----------------------------------
# GET: Resumen sumado por período
# -----------------------------------
@resumen_bp.route("", methods=["GET"])
@auth_required
def obtener_resumen():
    tipo = request.args.get("tipo")
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    if not tipo or not desde or not hasta:
        return jsonify({"error": "tipo, desde y hasta son obligatorios"}), 400

    # Sumar entradas del período
    entradas = EntradaMaquina.query.filter(
        EntradaMaquina.tipo == tipo,
        EntradaMaquina.fecha >= desde,
        EntradaMaquina.fecha <= hasta
    ).all()

    entrada_hucha = sum(e.hucha for e in entradas)
    entrada_monedas = sum(e.monedas for e in entradas)
    entrada_billetes = sum(e.billetes for e in entradas)
    cambio = sum(e.cambio for e in entradas)
    tarjeta = sum(e.tarjeta or 0 for e in entradas)
    entrada_total = entrada_hucha + entrada_monedas + entrada_billetes + tarjeta
    total_entrada_cambio = entrada_total - cambio

    # Total ventas del período
    if tipo == "vending":
        categorias = ["vending", "cafe"]
    else:
        categorias = ["lavanderia"]

    total_ventas = db.session.query(
        func.sum(Venta.cantidad * Venta.precio)
    ).join(Producto).filter(
        Producto.categoria.in_(categorias),
        func.date(Venta.fecha) >= desde,
        func.date(Venta.fecha) <= hasta
    ).scalar() or 0

    # Total salida (diario) del período
    total_salida = db.session.query(
        func.sum(Ganancia.total)
    ).filter(
        Ganancia.tipo == tipo,
        Ganancia.fecha >= desde,
        Ganancia.fecha <= hasta
    ).scalar() or 0

    diferencia = total_entrada_cambio - float(total_salida)

    return jsonify({
        "tipo": tipo,
        "total_ventas": round(float(total_ventas), 2),
        "entrada_hucha": round(entrada_hucha, 2),
        "entrada_monedas": round(entrada_monedas, 2),
        "entrada_billetes": round(entrada_billetes, 2),
        "tarjeta": round(tarjeta, 2),
        "entrada_total": round(entrada_total, 2),
        "cambio": round(cambio, 2),
        "total_entrada_cambio": round(total_entrada_cambio, 2),
        "total_salida": round(float(total_salida), 2),
        "diferencia": round(diferencia, 2),
        "num_registros": len(entradas),
    })