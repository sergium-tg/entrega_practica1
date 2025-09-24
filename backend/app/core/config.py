import sqlite3
from pathlib import Path

# ==== CONFIGURACIONES DE CORS ====
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

# ==== CONFIGURACIÓN DE BASE DE DATOS ====
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_PATH = BASE_DIR / "db" / "database.db"

def get_connection():
    """Devuelve una conexión a la base de datos SQLite."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
