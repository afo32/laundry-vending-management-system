export default function ReportSelector({ onSelect }) {
  return (
    <div className="mb-3">
      <label className="form-label">Selecciona un reporte</label>
      <select
        className="form-select"
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">-- Elegir --</option>
        <option value="ventas-dia">Ventas por día</option>
        <option value="ventas-maquina">Ventas por máquina</option>
        <option value="ventas-producto">Ventas por producto</option>
        <option value="compras-mes">Compras por mes</option>
        <option value="gastos-categoria">Gastos por categoría</option>
        <option value="stock-bajo">Stock bajo</option>
        <option value="beneficio">Beneficio neto</option>
      </select>
    </div>
  );
}
