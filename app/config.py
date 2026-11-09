import os


class Config:
    uri = os.environ.get("DATABASE_URL")

    if uri:
        # Railway a veces entrega postgres://, que SQLAlchemy rechaza
        if uri.startswith("postgres://"):
            uri = uri.replace("postgres://", "postgresql://", 1)
    else:
        # Solo para desarrollo local: define LOCAL_DATABASE_URL en tu PC
        uri = os.environ.get("LOCAL_DATABASE_URL")

    SQLALCHEMY_DATABASE_URI = uri
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")