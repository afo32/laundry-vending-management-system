from flask import Blueprint, request, jsonify
from app.database import db
from app.models import VentaDia
from app.routes.decorators import auth_required
from datetime import datetime
from app.models import Venta, Producto

ventas_dia_bp = Blueprint("ventas_dia", __name__, url_prefix="/ventas/dia")

@ventas_dia_bp.route("", methods=["POST"])
@auth_required
def crear_o_obtener_dia():
    data = request.get_json() or {}
    fecha_str = data.get("fecha")
    categoria = data.get("categoria")

    if not fecha_str or not categoria:
        return jsonify({"error": "fecha y categoria son obligatorias"}), 400

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "formato de fecha inválido, usa YYYY-MM-DD"}), 400

    dia = VentaDia.query.filter_by(fecha=fecha, categoria=categoria).first()
    if not dia:
        dia = VentaDia(fecha=fecha, categoria=categoria)
        db.session.add(dia)
        db.session.commit()

    return jsonify({
        "id": dia.id,
        "fecha": dia.fecha.isoformat(),
        "categoria": dia.categoria,
    }), 200


@ventas_dia_bp.route("", methods=["GET"])
@auth_required
def listar_dias():
    categoria = request.args.get("categoria")
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    query = VentaDia.query
    if categoria:
        query = query.filter_by(categoria=categoria)
    if desde:
        query = query.filter(VentaDia.fecha >= desde)
    if hasta:
        query = query.filter(VentaDia.fecha <= hasta)

    dias = query.order_by(VentaDia.fecha.desc()).all()

    return jsonify([
        {
            "id": d.id,
            "fecha": d.fecha.isoformat(),
            "categoria": d.categoria,
        }
        for d in dias
    ])

@ventas_dia_bp.route("/<int:dia_id>", methods=["GET"])
@auth_required
def detalle_dia(dia_id):
    dia = VentaDia.query.get_or_404(dia_id)
    ventas = (
        Venta.query
        .filter_by(dia_id=dia.id)
        .join(Producto, isouter=True)
        .add_columns(
            Venta.id,
            Venta.cantidad,
            Venta.precio,
            Venta.fecha,
            Producto.nombre.label("producto_nombre"),
            Producto.categoria.label("producto_categoria"),  # ← agregado
        )
        .all()
    )
    return jsonify({
        "id": dia.id,
        "fecha": dia.fecha.isoformat(),
        "categoria": dia.categoria,
        "ventas": [
            {
                "id": v.id,
                "cantidad": v.cantidad,
                "precio": v.precio,
                "fecha": v.fecha.strftime("%Y-%m-%d"),
                "producto_nombre": v.producto_nombre,
                "producto_categoria": v.producto_categoria,  # ← agregado
            }
            for v in ventas
        ]
    })

@ventas_dia_bp.route("/<int:dia_id>", methods=["DELETE"])
@auth_required
def eliminar_dia(dia_id):
    dia = VentaDia.query.get_or_404(dia_id)
    Venta.query.filter_by(dia_id=dia.id).delete()
    db.session.delete(dia)
    db.session.commit()
    return jsonify({"message": "Día eliminado correctamente"})