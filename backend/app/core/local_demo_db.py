"""
Local SQLite data store for a runnable development build.

This keeps the app usable without a MongoDB service. The production MongoDB
routes are still present, but the frontend can use these local endpoints during
development.
"""
from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

from app.core.config import settings


def _db_path() -> Path:
    path = Path(settings.LOCAL_DB_PATH)
    if not path.is_absolute():
        path = Path.cwd() / path
    return path


def _connect() -> sqlite3.Connection:
    connection = sqlite3.connect(_db_path())
    connection.row_factory = sqlite3.Row
    return connection


def _rows_to_dicts(rows: list[sqlite3.Row]) -> list[dict[str, Any]]:
    return [dict(row) for row in rows]


def _column_exists(connection: sqlite3.Connection, table_name: str, column_name: str) -> bool:
    rows = connection.execute(f"PRAGMA table_info({table_name})").fetchall()
    return any(row["name"] == column_name for row in rows)


def init_local_demo_db() -> None:
    path = _db_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    with _connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS shops (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                rating REAL NOT NULL,
                opening_time TEXT NOT NULL,
                closing_time TEXT NOT NULL,
                present INTEGER NOT NULL,
                status TEXT NOT NULL,
                approval_status TEXT NOT NULL,
                shopkeeper_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                orders_today INTEGER NOT NULL,
                revenue_today INTEGER NOT NULL,
                current_token INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                shop_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                price INTEGER NOT NULL,
                pending_price INTEGER,
                category TEXT NOT NULL,
                inventory INTEGER NOT NULL,
                prep_time INTEGER NOT NULL,
                available INTEGER NOT NULL,
                FOREIGN KEY (shop_id) REFERENCES shops(id)
            );

            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                token INTEGER NOT NULL,
                student_name TEXT NOT NULL,
                student_phone TEXT NOT NULL,
                shop_id TEXT NOT NULL,
                shop_name TEXT NOT NULL,
                items TEXT NOT NULL,
                total INTEGER NOT NULL,
                delivery_location TEXT NOT NULL,
                delivery_slot TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (shop_id) REFERENCES shops(id)
            );

            CREATE TABLE IF NOT EXISTS payments (
                id TEXT PRIMARY KEY,
                order_id TEXT NOT NULL,
                amount INTEGER NOT NULL,
                method TEXT NOT NULL,
                status TEXT NOT NULL,
                utr_number TEXT,
                screenshot_name TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id)
            );

            CREATE TABLE IF NOT EXISTS tickets (
                id TEXT PRIMARY KEY,
                ticket_number TEXT NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone_number TEXT NOT NULL,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                order_id TEXT,
                status TEXT,
                is_read INTEGER NOT NULL DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """
        )

        if not _column_exists(connection, "payments", "screenshot_name"):
            connection.execute("ALTER TABLE payments ADD COLUMN screenshot_name TEXT")

        shop_count = connection.execute("SELECT COUNT(*) FROM shops").fetchone()[0]
        if shop_count:
            return

        connection.executemany(
            """
            INSERT INTO shops (
                id, name, category, description, rating, opening_time,
                closing_time, present, status, approval_status, shopkeeper_name,
                phone, orders_today, revenue_today, current_token
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                ("1", "Pizza Palace", "Italian", "Campus pizzas, garlic breads, and quick combo meals.", 4.5, "12:00 AM", "11:59 PM", 1, "Open", "Approved", "Arun Kumar", "9876543210", 24, 12450, 23),
                ("2", "Burger Bay", "Fast Food", "Burgers, fries, rolls, and cold drinks for short breaks.", 4.2, "09:00 AM", "09:30 PM", 1, "Busy", "Approved", "Priya Menon", "9876543211", 18, 8560, 21),
                ("3", "Biryani House", "Indian", "Meals, biryani, snacks, and evening tiffin boxes.", 4.6, "11:00 AM", "11:00 PM", 0, "Closed", "Approved", "Naveen Shah", "9876543212", 12, 9320, 18),
                ("4", "Tea Point", "Cafe", "Tea, coffee, puffs, sandwiches, and study-time snacks.", 4.7, "07:30 AM", "08:00 PM", 1, "Open", "Pending Approval", "Meera Joseph", "9876543213", 0, 0, 18),
            ],
        )

        connection.executemany(
            """
            INSERT INTO products (
                id, shop_id, name, description, price, pending_price,
                category, inventory, prep_time, available
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                ("p1", "1", "Margherita Pizza", "Cheese pizza with tomato base.", 250, None, "Pizza", 18, 15, 1),
                ("p2", "1", "Garlic Bread", "Four pieces with herbed butter.", 100, 120, "Starters", 24, 8, 1),
                ("p3", "1", "Coke 250ml", "Chilled beverage.", 50, None, "Beverages", 40, 2, 1),
                ("p4", "2", "Classic Veg Burger", "Patty, cheese, lettuce, and house sauce.", 140, None, "Burgers", 20, 12, 1),
                ("p5", "2", "Masala Fries", "Crispy fries with campus masala.", 90, None, "Sides", 30, 7, 1),
                ("p6", "3", "Chicken Biryani", "Single portion with raita.", 220, None, "Meals", 0, 30, 0),
            ],
        )

        connection.executemany(
            """
            INSERT INTO orders (
                id, token, student_name, student_phone, shop_id, shop_name,
                items, total, delivery_location, delivery_slot, status, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                ("o1", 23, "Yokesh", "9876500001", "1", "Pizza Palace", "2x Margherita Pizza, 1x Coke", 590, "Hostel A Block 201", "Evening", "Pending Acceptance", "2026-06-11"),
                ("o2", 22, "Anitha", "9876500002", "1", "Pizza Palace", "1x Garlic Bread, 1x Coke", 180, "Library Gate", "Afternoon", "Preparing", "2026-06-11"),
                ("o3", 21, "Rahul", "9876500003", "2", "Burger Bay", "2x Classic Veg Burger", 310, "CSE Block", "Night", "Ready", "2026-06-11"),
                ("o4", 20, "Yokesh", "9876500001", "3", "Biryani House", "1x Chicken Biryani", 250, "Hostel A Block 201", "Afternoon", "Completed", "2026-06-10"),
            ],
        )


def save_session(email: str, name: str, role: str) -> dict[str, Any]:
    with _connect() as connection:
        cursor = connection.execute(
            "INSERT INTO sessions (email, name, role) VALUES (?, ?, ?)",
            (email, name, role),
        )
        row = connection.execute(
            "SELECT id, email, name, role, created_at FROM sessions WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
        return dict(row)


def list_shops() -> list[dict[str, Any]]:
    with _connect() as connection:
        rows = connection.execute("SELECT * FROM shops ORDER BY rating DESC").fetchall()
        return _rows_to_dicts(rows)


def get_shop(shop_id: str) -> dict[str, Any] | None:
    with _connect() as connection:
        row = connection.execute("SELECT * FROM shops WHERE id = ?", (shop_id,)).fetchone()
        return dict(row) if row else None


def update_shop(shop_id: str, values: dict[str, Any]) -> dict[str, Any] | None:
    allowed_fields = {
        "name",
        "category",
        "description",
        "opening_time",
        "closing_time",
        "present",
        "status",
        "approval_status",
        "shopkeeper_name",
        "phone",
    }
    updates = {key: value for key, value in values.items() if key in allowed_fields and value is not None}
    if not updates:
        return get_shop(shop_id)

    if "present" in updates:
        updates["present"] = 1 if updates["present"] else 0

    assignments = ", ".join(f"{field} = ?" for field in updates)
    params = [*updates.values(), shop_id]
    with _connect() as connection:
        connection.execute(f"UPDATE shops SET {assignments} WHERE id = ?", params)
        row = connection.execute("SELECT * FROM shops WHERE id = ?", (shop_id,)).fetchone()
        return dict(row) if row else None


def list_products(shop_id: str | None = None) -> list[dict[str, Any]]:
    with _connect() as connection:
        if shop_id:
            rows = connection.execute(
                "SELECT * FROM products WHERE shop_id = ? ORDER BY category, name",
                (shop_id,),
            ).fetchall()
        else:
            rows = connection.execute("SELECT * FROM products ORDER BY category, name").fetchall()
        return _rows_to_dicts(rows)


def create_product(values: dict[str, Any]) -> dict[str, Any]:
    with _connect() as connection:
        product_id = values.get("id") or f"p{connection.execute('SELECT COUNT(*) FROM products').fetchone()[0] + 1}"
        connection.execute(
            """
            INSERT INTO products (
                id, shop_id, name, description, price, pending_price,
                category, inventory, prep_time, available
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                product_id,
                values["shop_id"],
                values["name"],
                values.get("description", ""),
                values["price"],
                values.get("pending_price"),
                values["category"],
                values.get("inventory", 0),
                values.get("prep_time", 10),
                1 if values.get("available", True) else 0,
            ),
        )
        row = connection.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
        return dict(row)


def update_product(product_id: str, values: dict[str, Any]) -> dict[str, Any] | None:
    allowed_fields = {
        "name",
        "description",
        "price",
        "pending_price",
        "category",
        "inventory",
        "prep_time",
        "available",
    }
    updates = {key: value for key, value in values.items() if key in allowed_fields and (value is not None or key == "pending_price")}
    if not updates:
        return get_product(product_id)

    if "available" in updates:
        updates["available"] = 1 if updates["available"] else 0

    assignments = ", ".join(f"{field} = ?" for field in updates)
    params = [*updates.values(), product_id]
    with _connect() as connection:
        connection.execute(f"UPDATE products SET {assignments} WHERE id = ?", params)
        row = connection.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
        return dict(row) if row else None


def get_product(product_id: str) -> dict[str, Any] | None:
    with _connect() as connection:
        row = connection.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
        return dict(row) if row else None


def list_orders() -> list[dict[str, Any]]:
    with _connect() as connection:
        rows = connection.execute("SELECT * FROM orders ORDER BY token DESC").fetchall()
        return _rows_to_dicts(rows)


def get_order(order_id: str) -> dict[str, Any] | None:
    with _connect() as connection:
        row = connection.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        return dict(row) if row else None


def update_order_status(order_id: str, status: str) -> dict[str, Any] | None:
    with _connect() as connection:
        connection.execute("UPDATE orders SET status = ? WHERE id = ?", (status, order_id))
        row = connection.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        if row:
            status_messages = {
                "Confirmed": "Your order has been confirmed.",
                "Preparing": "Your food is being prepared.",
                "Ready": "Your order is ready.",
                "Completed": "Order completed successfully.",
                "Cancelled": "Order cancelled.",
                "Failed": "Payment failed.",
                "Refunded": "Order refunded.",
            }
            create_notification(
                title="Order completed" if status == "Completed" else "Order status updated",
                message=f"Token {row['token']}: {status_messages.get(status, f'Order is now {status}.')}",
                order_id=order_id,
                status=status,
                connection=connection,
            )
        return dict(row) if row else None


def create_order(values: dict[str, Any]) -> dict[str, Any] | None:
    with _connect() as connection:
        shop = connection.execute("SELECT * FROM shops WHERE id = ?", (values["shop_id"],)).fetchone()
        if not shop:
            return None

        product_ids = [item["product_id"] for item in values["items"]]
        products_by_id = {}
        for product_id in product_ids:
            row = connection.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
            if row:
                products_by_id[product_id] = dict(row)

        subtotal = 0
        item_labels = []
        for item in values["items"]:
            product = products_by_id.get(item["product_id"])
            if not product:
                continue
            quantity = int(item["quantity"])
            subtotal += int(product["price"]) * quantity
            item_labels.append(f"{quantity}x {product['name']}")

        if not item_labels:
            return None

        tax = round(subtotal * 0.05)
        delivery_fee = 30
        total = subtotal + tax + delivery_fee
        next_token = connection.execute(
            "SELECT COALESCE(MAX(token), 17) + 1 FROM orders WHERE created_at = date('now')"
        ).fetchone()[0]
        today_key = connection.execute("SELECT strftime('%Y%m%d', 'now')").fetchone()[0]
        order_id = f"o{today_key}-{next_token}"

        connection.execute(
            """
            INSERT INTO orders (
                id, token, student_name, student_phone, shop_id, shop_name,
                items, total, delivery_location, delivery_slot, status, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'))
            """,
            (
                order_id,
                next_token,
                values.get("student_name", "Student"),
                values.get("student_phone", ""),
                values["shop_id"],
                shop["name"],
                ", ".join(item_labels),
                total,
                values["delivery_location"],
                values["delivery_slot"],
                "Pending Acceptance",
            ),
        )
        row = connection.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        if row:
            connection.execute(
                """
                UPDATE shops
                SET orders_today = orders_today + 1,
                    revenue_today = revenue_today + ?,
                    current_token = ?
                WHERE id = ?
                """,
                (total, next_token, values["shop_id"]),
            )
            create_notification(
                title="Order placed",
                message=f"Token {row['token']} is pending shop acceptance.",
                order_id=order_id,
                status=row["status"],
                connection=connection,
            )
            row = connection.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        return dict(row) if row else None


def create_payment(
    order_id: str,
    amount: int,
    method: str,
    utr_number: str | None = None,
    screenshot_name: str | None = None,
) -> dict[str, Any] | None:
    with _connect() as connection:
        order = connection.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        if not order:
            return None
        next_id = connection.execute("SELECT COUNT(*) + 1 FROM payments").fetchone()[0]
        payment_id = f"pay{next_id}"
        status = "Pending Verification" if method == "Manual UTR" else "Success"
        connection.execute(
            """
            INSERT INTO payments (id, order_id, amount, method, status, utr_number, screenshot_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (payment_id, order_id, amount, method, status, utr_number, screenshot_name),
        )
        row = connection.execute("SELECT * FROM payments WHERE id = ?", (payment_id,)).fetchone()
        return dict(row) if row else None


def list_payments() -> list[dict[str, Any]]:
    with _connect() as connection:
        rows = connection.execute("SELECT * FROM payments ORDER BY rowid DESC").fetchall()
        return _rows_to_dicts(rows)


def update_payment_status(payment_id: str, status: str) -> dict[str, Any] | None:
    with _connect() as connection:
        connection.execute("UPDATE payments SET status = ? WHERE id = ?", (status, payment_id))
        row = connection.execute("SELECT * FROM payments WHERE id = ?", (payment_id,)).fetchone()
        return dict(row) if row else None


def create_ticket(values: dict[str, Any]) -> dict[str, Any]:
    with _connect() as connection:
        next_id = connection.execute("SELECT COUNT(*) + 1 FROM tickets").fetchone()[0]
        ticket_id = f"t{next_id}"
        ticket_number = f"TKT-{1000 + next_id}"
        connection.execute(
            """
            INSERT INTO tickets (
                id, ticket_number, name, email, phone_number, category,
                title, description, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                ticket_id,
                ticket_number,
                values["name"],
                values["email"],
                values["phone_number"],
                values["category"],
                values["title"],
                values["description"],
                "Open",
            ),
        )
        row = connection.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,)).fetchone()
        return dict(row)


def list_tickets() -> list[dict[str, Any]]:
    with _connect() as connection:
        rows = connection.execute("SELECT * FROM tickets ORDER BY created_at DESC").fetchall()
        return _rows_to_dicts(rows)


def create_notification(
    title: str,
    message: str,
    order_id: str | None = None,
    status: str | None = None,
    connection: sqlite3.Connection | None = None,
) -> dict[str, Any] | None:
    owns_connection = connection is None
    active_connection = connection or _connect()
    try:
        next_id = active_connection.execute("SELECT COUNT(*) + 1 FROM notifications").fetchone()[0]
        notification_id = f"n{next_id}"
        active_connection.execute(
            """
            INSERT INTO notifications (id, title, message, order_id, status)
            VALUES (?, ?, ?, ?, ?)
            """,
            (notification_id, title, message, order_id, status),
        )
        row = active_connection.execute(
            "SELECT * FROM notifications WHERE id = ?",
            (notification_id,),
        ).fetchone()
        if owns_connection:
            active_connection.commit()
        return dict(row) if row else None
    finally:
        if owns_connection:
            active_connection.close()


def list_notifications() -> list[dict[str, Any]]:
    with _connect() as connection:
        rows = connection.execute("SELECT * FROM notifications ORDER BY rowid DESC LIMIT 20").fetchall()
        return _rows_to_dicts(rows)


def get_summary() -> dict[str, Any]:
    shops = list_shops()
    orders = list_orders()
    products = list_products()
    return {
        "shops": len(shops),
        "orderable_shops": len([
            shop for shop in shops
            if shop["approval_status"] == "Approved" and shop["present"] and shop["status"] == "Open"
        ]),
        "products": len(products),
        "active_orders": len([order for order in orders if order["status"] != "Completed"]),
        "revenue": sum(order["total"] for order in orders),
        "token_starts_at": 18,
    }
