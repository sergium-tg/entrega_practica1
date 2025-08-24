from fastapi import APIRouter, HTTPException, Query, Response, status
from typing import List
from app.models.schemas import Book, BookCreate, BookUpdate

router = APIRouter()

# Base de datos en memoria
books_db: list[dict] = []
next_id = 1

# --- GET /books ---
@router.get("", response_model=List[Book])
def list_books(
    response: Response,
    q: str | None = Query(None),
    sort: str | None = Query(None, regex="^(title|author|year)$"),
    order: str = Query("asc", regex="^(asc|desc)$"),
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    results = books_db

    # Filtro búsqueda
    if q:
        q = q.lower()
        results = [b for b in results if q in b["title"].lower() or q in b["author"].lower()]

    # Orden
    if sort:
        results = sorted(results, key=lambda x: x[sort], reverse=(order == "desc"))

    total = len(results)
    response.headers["X-Total-Count"] = str(total)

    return results[offset: offset + limit]

# --- POST /books ---
@router.post("", response_model=Book, status_code=status.HTTP_201_CREATED)
def create_book(book: BookCreate, response: Response):
    global next_id

    # Duplicados: (title+author)
    for b in books_db:
        if b["title"].lower().strip() == book.title.lower().strip() and \
           b["author"].lower().strip() == book.author.lower().strip():
            raise HTTPException(status_code=409, detail="Duplicate book")

    new_book = book.dict()
    new_book["id"] = next_id
    next_id += 1
    books_db.append(new_book)

    response.headers["Location"] = f"/books/{new_book['id']}"
    return new_book

# --- GET /books/{id} ---
@router.get("/{book_id}", response_model=Book)
def get_book(book_id: int):
    for b in books_db:
        if b["id"] == book_id:
            return b
    raise HTTPException(status_code=404, detail="Book not found")

# --- PUT /books/{id} ---
@router.put("/{book_id}", response_model=Book)
def update_book(book_id: int, update: BookUpdate):
    for b in books_db:
        if b["id"] == book_id:
            data = update.dict(exclude_unset=True)

            # Verificar duplicado si cambia title/author
            new_title = data.get("title", b["title"])
            new_author = data.get("author", b["author"])
            for other in books_db:
                if other["id"] != book_id and \
                   other["title"].lower().strip() == new_title.lower().strip() and \
                   other["author"].lower().strip() == new_author.lower().strip():
                    raise HTTPException(status_code=409, detail="Duplicate book")

            b.update(data)
            return b
    raise HTTPException(status_code=404, detail="Book not found")

# --- DELETE /books/{id} ---
@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int):
    for i, b in enumerate(books_db):
        if b["id"] == book_id:
            books_db.pop(i)
            return
    raise HTTPException(status_code=404, detail="Book not found")

