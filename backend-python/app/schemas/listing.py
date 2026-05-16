from datetime import datetime
from typing import Optional

from pydantic import Field
from sqlmodel import SQLModel


class ListingCreate(SQLModel):
    title: str = Field(max_length=255)
    description: Optional[str] = None
    category: str = Field(max_length=100)
    quantity: int = Field(ge=0)
    pickup_time: datetime
    image_url: Optional[str] = None
    ai_shelf_life: Optional[str] = Field(default=None, max_length=50)
    business_id: Optional[int] = None


class ListingUpdate(SQLModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(default=None, max_length=100)
    quantity: Optional[int] = Field(default=None, ge=0)
    pickup_time: Optional[datetime] = None
    image_url: Optional[str] = None
    ai_shelf_life: Optional[str] = Field(default=None, max_length=50)
    is_active: Optional[bool] = None


class ListingRead(SQLModel):
    id: int
    establishmentName: str
    title: str
    description: str = ""
    quantity: int
    pickupTime: str
    aiCategory: str
    aiShelfLife: str = ""
    imageUrl: str = ""
    isActive: bool = True
