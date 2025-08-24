from pydantic import BaseModel, Field, validator

class BookBase(BaseModel):
    title: str = Field(..., min_length=1)
    author: str = Field(..., min_length=1)
    year: int = Field(..., ge=1500, le=2100)
    read: bool = False

    @validator("title", "author")
    def strip_and_check(cls, v):
        if not v.strip():
            raise ValueError("Campo vacío")
        return v.strip()

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    year: int | None = Field(None, ge=1500, le=2100)
    read: bool | None = None

class Book(BookBase):
    id: int