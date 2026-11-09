from app import create_app
from app.database import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    with db.engine.connect() as conn:
        conn.execute(text("ALTER TABLE mermas ADD COLUMN IF NOT EXISTS origen VARCHAR(20) DEFAULT 'manual'"))
        conn.commit()
    print("Listo")