import os

directorio = "src"
url_vieja = "http://127.0.0.1:5000"

archivos_modificados = 0

for root, dirs, files in os.walk(directorio):
    for archivo in files:
        if archivo.endswith(".jsx") or archivo.endswith(".js"):
            ruta = os.path.join(root, archivo)
            with open(ruta, "r", encoding="utf-8") as f:
                contenido = f.read()

            if url_vieja in contenido:
                # Reemplazar URLs entre comillas dobles
                nuevo = contenido.replace(
                    f'"{url_vieja}',
                    '`${import.meta.env.VITE_API_URL}'
                )
                # Reemplazar URLs entre comillas simples
                nuevo = nuevo.replace(
                    f"'{url_vieja}",
                    '`${import.meta.env.VITE_API_URL}'
                )
                # Reemplazar URLs entre backticks
                nuevo = nuevo.replace(
                    f"`{url_vieja}",
                    '`${import.meta.env.VITE_API_URL}'
                )

                with open(ruta, "w", encoding="utf-8") as f:
                    f.write(nuevo)
                print(f"Modificado: {ruta}")
                archivos_modificados += 1

print(f"\nTotal archivos modificados: {archivos_modificados}")