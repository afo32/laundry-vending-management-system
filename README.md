Laundry & Vending Management System
A full‑stack management platform designed for small laundry and vending machine businesses.
The system includes product inventory, automatic product code generation, sales tracking, purchase tracking, authentication, and category/subcategory logic for vending products.

Built with:

Backend: Python, Flask, SQLAlchemy

Frontend: React, Bootstrap

Database: PostgreSQL / MySQL / SQLite (configurable)

🚀 Features
🧺 Laundry & Vending Inventory
Manage all products across two main categories:

Laundry

Vending

Vending products include subcategories:

Beverage

Candy

Parapharmacy

Smoking

Coffee

Each product stores:

Name

Category

Subcategory (if vending)

Stock

Price

Auto‑generated product code

🔤 Automatic Product Code Generation
The system generates product codes automatically based on:

Subcategory initials

Initials of the product name

Examples:

Product	Subcategory	Code
Coca Cola Can 330ml	Beverage	BCCL
Aros Fresa	Candy	CHAF
Durex Dame Placer	Parapharmacy	PDDP
OCB Filtro Slim	Smoking	FOFS


Codes contain no numbers, following the business logic defined in the original Excel system.

💰 Sales Module
Create new sales

Select product manually or search by product code

Automatic total calculation (computed, not stored)

Filter sales by:

Category

Product

Date

Machine (for vending)

Laundry sales do not require a product ID

Vending sales require a valid product ID (integer)

📦 Purchases Module
Register new purchases

Optional fields:

Supplier

Invoice number

Notes

Search products by code

Automatic stock updates (optional extension)

📊 Inventory Module
View inventory by category:

Laundry

Vending

Stock level indicators (low stock highlighted)

Edit stock directly

Add new products from inventory pages

🔐 Authentication
All backend routes are protected using JWT‑based authentication.
CORS is configured to allow React frontend requests.

🧱 Backend Structure
Código
app/
├── routes/
│    ├── productos.py
│    ├── ventas.py
│    ├── compras.py
│    ├── gastos.py
│    ├── inventario.py
│    ├── maquinas.py
│    ├── auth.py
│    └── reportes.py
├── models/
│    ├── productos.py
│    ├── ventas.py
│    ├── compras.py
│    └── gastos.py
├── utils/
│    └── auth_required.py
├── database.py
└── __init__.py   ← Blueprint registration
🔧 Blueprint Registration (Updated)
All report routes are now correctly registered under:

Código
/reportes/...
In app/__init__.py:

python
app.register_blueprint(reportes_bp, url_prefix="/reportes")
And all internal routes inside reportes.py were cleaned to remove duplicated prefixes.

🎨 Frontend Structure
Código
src/
├── pages/
│    ├── ventas/
│    │     └── VentaNueva.jsx
│    ├── compras/
│    │     └── CompraNueva.jsx
│    ├── inventario/
│    │     ├── Inventario.jsx
│    │     ├── InventarioLavadoras.jsx
│    │     ├── InventarioVending.jsx
│    │     └── InventarioNuevo.jsx
├── components/
│    └── BotonNuevoProducto.jsx
└── App.jsx
🔧 Frontend Fixes (Updated Today)
producto_id is now correctly sent:

Laundry: null

Vending: Number(productoId)

Sales creation no longer sends a total field

Report routes now call:

js
fetch(`http://127.0.0.1:5000/reportes/ventas-dia?categoria=${categoria}`)
📈 Reports Module (Updated)
/reportes/ventas-dia
Shows daily sales grouped by date

Laundry and vending handled separately:

Laundry → no product join

Vending → join with products table

Other report routes:
/reportes/ventas-maquina

/reportes/ventas-producto

/reportes/compras-mes

/reportes/gastos-categoria

/reportes/stock-bajo

/reportes/beneficio

All routes now work under the unified /reportes prefix.

🔍 Product Code Search
Both sales and purchases include a search bar:

Enter a product code (e.g., BCCL, CHAF, PDDP)

The system automatically selects the matching product

Errors are shown if the code does not exist

🛠️ Technologies Used
Backend
Python 3

Flask

SQLAlchemy

JWT Authentication

Frontend
React

Bootstrap

Fetch API

📌 Future Improvements
Barcode / QR scanning for product codes

Automatic stock updates from sales/purchases

Dashboard with charts

Import products directly from Excel

Multi‑user roles (admin, employee)

📄 License
This project is private and intended for personal business use.
