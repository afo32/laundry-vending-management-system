import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import VentasPorDia from "./pages/reportes/VentasPorDia";
import VentasPorDiaLavadoras from "./pages/reportes/VentasPorDiaLavadoras";
import VentasPorDiaVending from "./pages/reportes/VentasPorDiaVending";
import VentasPorMaquinaLavadoras from "./pages/reportes/VentasPorMaquinaLavadoras";
import VentasPorMaquinaVending from "./pages/reportes/VentasPorMaquinaVending";
import MaquinaDetalle from "./pages/reportes/MaquinaDetalle";
import VentasPorProducto from "./pages/reportes/VentasPorProducto";
import VentasPorProductoLavadoras from "./pages/reportes/VentasPorProductoLavadoras";
import VentasPorProductoVending from "./pages/reportes/VentasPorProductoVending";
import ProductoDetalle from "./pages/reportes/ProductoDetalle";
import ComprasPorMes from "./pages/reportes/ComprasPorMes";
import ComprasPorMesLavadoras from "./pages/reportes/ComprasPorMesLavadoras";
import ComprasPorMesVending from "./pages/reportes/ComprasPorMesVending";
import Gastos from "./pages/reportes/Gastos";
import GastoNuevo from "./pages/reportes/GastoNuevo";
import GastoEditar from "./pages/reportes/GastoEditar";
import VentaNueva from "./pages/ventas/VentaNueva";
import CompraNueva from "./pages/compras/CompraNueva";
import Inventario from "./pages/inventario/Inventario";
import InventarioLavadoras from "./pages/inventario/InventarioLavadoras";
import InventarioVending from "./pages/inventario/InventarioVending";
import InventarioEditar from "./pages/inventario/InventarioEditar";
import InventarioNuevo from "./pages/inventario/InventarioNuevo";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Reportes */}
        <Route
          path="/reportes/ventas-dia"
          element={
            <PrivateRoute>
              <VentasPorDia />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/ventas-dia/lavadoras"
          element={
            <PrivateRoute>
              <VentasPorDiaLavadoras />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/ventas-dia/vending"
          element={
            <PrivateRoute>
              <VentasPorDiaVending />
            </PrivateRoute>
          }
        />

        <Route
          path="/reportes/ventas-maquina/lavadoras"
          element={
            <PrivateRoute>
              <VentasPorMaquinaLavadoras />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/ventas-maquina/lavadoras/:id"
          element={
            <PrivateRoute>
              <MaquinaDetalle />
            </PrivateRoute>
          }
        />

        <Route
          path="/reportes/ventas-maquina/vending"
          element={
            <PrivateRoute>
              <VentasPorMaquinaVending />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/ventas-maquina/vending/:id"
          element={
            <PrivateRoute>
              <MaquinaDetalle />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/ventas-producto"
          element={
            <PrivateRoute>
              <VentasPorProducto />
            </PrivateRoute>
          }
        />

        <Route
          path="/reportes/ventas-producto/lavadoras"
          element={
            <PrivateRoute>
              <VentasPorProductoLavadoras />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/ventas-producto/lavadoras/:id"
          element={
            <PrivateRoute>
              <ProductoDetalle />
            </PrivateRoute>
          }
        />

        <Route
          path="/reportes/ventas-producto/vending"
          element={
            <PrivateRoute>
              <VentasPorProductoVending />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/ventas-producto/vending/:id"
          element={
            <PrivateRoute>
              <ProductoDetalle />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/compras-mes"
          element={
            <PrivateRoute>
              <ComprasPorMes />
            </PrivateRoute>
          }
        />

        <Route
          path="/reportes/compras-mes/lavadoras"
          element={
            <PrivateRoute>
              <ComprasPorMesLavadoras />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/compras-mes/vending"
          element={
            <PrivateRoute>
              <ComprasPorMesVending />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/gastos"
          element={
            <PrivateRoute>
              <Gastos />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/gastos/nuevo"
          element={
            <PrivateRoute>
              <GastoNuevo />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/gastos/:id/editar"
          element={
            <PrivateRoute>
              <GastoEditar />
            </PrivateRoute>
          }
        />
        <Route
          path="/ventas/nueva"
          element={
            <PrivateRoute>
              <VentaNueva />
            </PrivateRoute>
          }
        />
        <Route
          path="/compras/nueva"
          element={
            <PrivateRoute>
              <CompraNueva />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario"
          element={
            <PrivateRoute>
              <Inventario />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/lavadoras"
          element={
            <PrivateRoute>
              <InventarioLavadoras />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/vending"
          element={
            <PrivateRoute>
              <InventarioVending />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/editar/:id"
          element={
            <PrivateRoute>
              <InventarioEditar />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/nuevo"
          element={
            <PrivateRoute>
              <InventarioNuevo />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
