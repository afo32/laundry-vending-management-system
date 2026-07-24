from flask import Blueprint, request, jsonify
from app.database import db
from app.models.ingreso_tarjeta import IngresoTarjeta
from app.models.ganancia import Ganancia
from app.utils.auth_required import auth_required
from sqlalchemy import func
import calendar

trimestral_bp = Blueprint("trimestral", __name__, url_prefix="/trimestral")

MESES_NOMBRE = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

@trimestral_bp.route("", methods=["GET"])
@auth_required
def obtener_trimestral():
    año = request.args.get("año", type=int)
    if not año:
        return jsonify({"error": "año es obligatorio"}), 400

    meses_data = []
    for mes in range(1, 13):
        ultimo_dia = calendar.monthrange(año, mes)[1]
        desde = f"{año}-{str(mes).zfill(2)}-01"
        hasta = f"{año}-{str(mes).zfill(2)}-{ultimo_dia}"

        efectivo = db.session.query(func.sum(Ganancia.total)).filter(
            Ganancia.fecha >= desde,
            Ganancia.fecha <= hasta
        ).scalar() or 0

        tarjeta_row = IngresoTarjeta.query.filter_by(mes=mes, año=año).first()
        tarjeta = tarjeta_row.monto if tarjeta_row else 0
        efectivo_h = tarjeta_row.efectivo_h if tarjeta_row else 0

        meses_data.append({
            "mes": mes,
            "nombre": MESES_NOMBRE[mes - 1],
            "efectivo": round(float(efectivo), 2),
            "efectivo_h": round(float(efectivo_h), 2),
            "tarjeta": round(float(tarjeta), 2),
            "total": round(float(efectivo) + float(efectivo_h) + float(tarjeta), 2),
        })

    # Agrupar en trimestres
    trimestres = []
    for t in range(4):
        meses_trim = meses_data[t * 3:(t * 3) + 3]
        trimestres.append({
            "numero": t + 1,
            "meses": meses_trim,
            "total_efectivo": round(sum(m["efectivo"] for m in meses_trim), 2),
            "total_efectivo_h": round(sum(m["efectivo_h"] for m in meses_trim), 2),
            "total_tarjeta": round(sum(m["tarjeta"] for m in meses_trim), 2),
            "total": round(sum(m["total"] for m in meses_trim), 2),
        })

    return jsonify({"año": año, "trimestres": trimestres})


@trimestral_bp.route("/tarjeta", methods=["POST"])
@auth_required
def guardar_tarjeta():
    data = request.get_json()
    mes = data.get("mes")
    año = data.get("año")
    monto = data.get("monto", 0)
    efectivo_h = data.get("efectivo_h", None)

    if not mes or not año:
        return jsonify({"error": "mes y año son obligatorios"}), 400

    row = IngresoTarjeta.query.filter_by(mes=mes, año=año).first()
    if not row:
        row = IngresoTarjeta()
        row.mes = mes
        row.año = año
        db.session.add(row)

    row.monto = float(monto)
    if efectivo_h is not None:
        row.efectivo_h = float(efectivo_h)

    db.session.commit()
    return jsonify({"message": "Guardado"}), 201