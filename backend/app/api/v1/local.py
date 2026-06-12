"""
Local runnable API routes backed by SQLite.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.core.config import settings
from app.core import local_demo_db, local_mongo_db

router = APIRouter()


def _use_mongo() -> bool:
    return not settings.USE_LOCAL_DB and not settings.USE_TURSO_DB


@router.get("/status")
async def database_status():
    if _use_mongo():
        return {
            "connected": True,
            "mode": "mongo",
            "database": "MongoDB Atlas",
            "persistent": True,
            "message": "MongoDB is active for production data.",
        }
    if settings.USE_TURSO_DB:
        return {
            "connected": True,
            "mode": "turso",
            "database": "Turso/libSQL",
            "persistent": True,
            "message": "Turso is active. Business data is stored in a persistent cloud database.",
        }
    return {
        "connected": True,
        "mode": "demo",
        "database": "SQLite demo database",
        "persistent": False,
        "message": "Demo database is active. Data can reset after redeploy or server restart.",
    }


class LocalSessionCreate(BaseModel):
    email: EmailStr
    name: str
    role: str


class LocalShopUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    description: str | None = None
    opening_time: str | None = None
    closing_time: str | None = None
    present: bool | None = None
    status: str | None = None
    approval_status: str | None = None
    shopkeeper_name: str | None = None
    phone: str | None = None


class LocalProductCreate(BaseModel):
    shop_id: str
    name: str
    description: str = ""
    price: int
    category: str
    inventory: int = 0
    prep_time: int = 10
    available: bool = True


class LocalProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: int | None = None
    pending_price: int | None = None
    category: str | None = None
    inventory: int | None = None
    prep_time: int | None = None
    available: bool | None = None


class LocalOrderStatusUpdate(BaseModel):
    status: str


class LocalOrderItem(BaseModel):
    product_id: str
    quantity: int


class LocalOrderCreate(BaseModel):
    shop_id: str
    items: list[LocalOrderItem]
    student_name: str = "Student"
    student_phone: str = ""
    delivery_location: str
    delivery_slot: str


class LocalPaymentCreate(BaseModel):
    order_id: str
    amount: int
    method: str
    utr_number: str | None = None
    screenshot_name: str | None = None


class LocalPaymentStatusUpdate(BaseModel):
    status: str


class LocalTicketCreate(BaseModel):
    name: str
    email: EmailStr
    phone_number: str
    category: str
    title: str
    description: str


@router.get("/summary")
async def summary():
    if _use_mongo():
        return await local_mongo_db.get_summary()
    return local_demo_db.get_summary()


@router.post("/sessions")
async def create_session(data: LocalSessionCreate):
    if _use_mongo():
        return await local_mongo_db.save_session(data.email, data.name, data.role)
    return local_demo_db.save_session(data.email, data.name, data.role)


@router.get("/shops")
async def shops():
    if _use_mongo():
        return await local_mongo_db.list_shops()
    return local_demo_db.list_shops()


@router.patch("/shops/{shop_id}")
async def patch_shop(shop_id: str, data: LocalShopUpdate):
    if _use_mongo():
        shop = await local_mongo_db.update_shop(shop_id, data.model_dump(exclude_unset=True))
    else:
        shop = local_demo_db.update_shop(shop_id, data.model_dump(exclude_unset=True))
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return shop


@router.get("/shops/{shop_id}")
async def shop(shop_id: str):
    result = await local_mongo_db.get_shop(shop_id) if _use_mongo() else local_demo_db.get_shop(shop_id)
    if not result:
        raise HTTPException(status_code=404, detail="Shop not found")
    return result


@router.get("/products")
async def products(shop_id: str | None = None):
    if _use_mongo():
        return await local_mongo_db.list_products(shop_id)
    return local_demo_db.list_products(shop_id)


@router.post("/products")
async def add_product(data: LocalProductCreate):
    if _use_mongo():
        return await local_mongo_db.create_product(data.model_dump())
    return local_demo_db.create_product(data.model_dump())


@router.patch("/products/{product_id}")
async def patch_product(product_id: str, data: LocalProductUpdate):
    if _use_mongo():
        product = await local_mongo_db.update_product(product_id, data.model_dump(exclude_unset=True))
    else:
        product = local_demo_db.update_product(product_id, data.model_dump(exclude_unset=True))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/orders")
async def orders():
    if _use_mongo():
        return await local_mongo_db.list_orders()
    return local_demo_db.list_orders()


@router.get("/orders/{order_id}")
async def order(order_id: str):
    result = await local_mongo_db.get_order(order_id) if _use_mongo() else local_demo_db.get_order(order_id)
    if not result:
        raise HTTPException(status_code=404, detail="Order not found")
    return result


@router.post("/orders")
async def add_order(data: LocalOrderCreate):
    if _use_mongo():
        order = await local_mongo_db.create_order(data.model_dump())
    else:
        order = local_demo_db.create_order(data.model_dump())
    if not order:
        raise HTTPException(status_code=400, detail="Unable to create order")
    return order


@router.patch("/orders/{order_id}/status")
async def patch_order_status(order_id: str, data: LocalOrderStatusUpdate):
    if _use_mongo():
        order = await local_mongo_db.update_order_status(order_id, data.status)
    else:
        order = local_demo_db.update_order_status(order_id, data.status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/payments")
async def payments():
    if _use_mongo():
        return await local_mongo_db.list_payments()
    return local_demo_db.list_payments()


@router.post("/payments")
async def add_payment(data: LocalPaymentCreate):
    if _use_mongo():
        payment = await local_mongo_db.create_payment(
            data.order_id,
            data.amount,
            data.method,
            data.utr_number,
            data.screenshot_name,
        )
    else:
        payment = local_demo_db.create_payment(
            data.order_id,
            data.amount,
            data.method,
            data.utr_number,
            data.screenshot_name,
        )
    if not payment:
        raise HTTPException(status_code=400, detail="Unable to create payment")
    return payment


@router.patch("/payments/{payment_id}/status")
async def patch_payment_status(payment_id: str, data: LocalPaymentStatusUpdate):
    if _use_mongo():
        payment = await local_mongo_db.update_payment_status(payment_id, data.status)
    else:
        payment = local_demo_db.update_payment_status(payment_id, data.status)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.get("/tickets")
async def tickets():
    if _use_mongo():
        return await local_mongo_db.list_tickets()
    return local_demo_db.list_tickets()


@router.post("/tickets")
async def add_ticket(data: LocalTicketCreate):
    if _use_mongo():
        return await local_mongo_db.create_ticket(data.model_dump())
    return local_demo_db.create_ticket(data.model_dump())


@router.get("/notifications")
async def notifications():
    if _use_mongo():
        return await local_mongo_db.list_notifications()
    return local_demo_db.list_notifications()
