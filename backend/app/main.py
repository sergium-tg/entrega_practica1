from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import books

app = FastAPI(title="Library API")

# CORS (para que React pueda llamar a la API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(books.router, prefix="/books", tags=["books"])