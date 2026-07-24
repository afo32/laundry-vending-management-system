import os
import re

directorio = "src"
archivos_modificados = 0

for root, dirs, files in os.walk(directorio):
    for archivo in files:
        if archivo.endswith(".jsx") or archivo.endswith(".js"):
            ruta = os.path.join(root, archivo)
            with open(ruta, "r", encoding="utf-8") as f:
                contenido = f.read()

            # Buscar backtick abierto con VITE_API_URL pero cerrado con comilla doble o simple
            nuevo = re.sub(
                r'`(\$\{import\.meta\.env\.VITE_API_URL\}[^`"\']*)"',
                r'`\1`',
                contenido
            )
            nuevo = re.sub(
                r"`(\$\{import\.meta\.env\.VITE_API_URL\}[^`\"']*)'",
                r'`\1`',
                nuevo
            )

            if nuevo != contenido:
                with open(ruta, "w", encoding="utf-8") as f:
                    f.write(nuevo)
                print(f"Corregido: {ruta}")
                archivos_modificados += 1

print(f"\nTotal archivos corregidos: {archivos_modificados}")
