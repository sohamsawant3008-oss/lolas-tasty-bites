import json
import os
import sqlite3
from pathlib import Path

from flask import Flask, jsonify, render_template, request, session

app = Flask(__name__, static_folder='static', template_folder='.')
if os.environ.get('FLASK_ENV') == 'production':
    missing_secrets = [name for name in ('SECRET_KEY', 'ADMIN_PASSWORD') if not os.environ.get(name)]
    if missing_secrets:
        raise RuntimeError(f"Missing required production environment variables: {', '.join(missing_secrets)}")

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'lolas-tasty-bites-secret-key-change-me')
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') == 'production'
app.config['SESSION_COOKIE_HTTPONLY'] = True
DB_PATH = Path(__file__).with_name('orders.db')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'lolas123')


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            delivery_mode TEXT NOT NULL,
            address TEXT,
            note TEXT,
            payment TEXT NOT NULL,
            utr TEXT,
            total INTEGER NOT NULL,
            items TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    conn.close()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/health')
def health():
    return jsonify({'status': 'ok'}), 200


@app.route('/admin')
def admin():
    if not session.get('admin_logged_in'):
        return render_template('admin.html', logged_in=False)
    return render_template('admin.html', logged_in=True)


@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    payload = request.get_json(silent=True) or {}
    password = str(payload.get('password', '')).strip()

    if password != ADMIN_PASSWORD:
        return jsonify({'error': 'Unauthorized'}), 401

    session['admin_logged_in'] = True
    return jsonify({'success': True})


@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin_logged_in', None)
    return jsonify({'success': True})


@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json(silent=True) or {}

    required_fields = ['name', 'phone', 'items', 'total', 'payment']
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400

    name = str(data.get('name', '')).strip()
    phone = str(data.get('phone', '')).strip()
    delivery_mode = str(data.get('delivery_mode', 'Pickup')).strip() or 'Pickup'
    address = str(data.get('address', '')).strip()
    note = str(data.get('note', '')).strip()
    payment = str(data.get('payment', '')).strip()
    utr = str(data.get('utr', '')).strip()

    try:
        total = int(data.get('total'))
    except (TypeError, ValueError):
        return jsonify({'error': 'Total must be a number.'}), 400

    items_json = json.dumps(data.get('items', []))

    conn = get_db_connection()
    cursor = conn.execute(
        """
        INSERT INTO orders (name, phone, delivery_mode, address, note, payment, utr, total, items)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (name, phone, delivery_mode, address, note, payment, utr or None, total, items_json),
    )
    conn.commit()
    order_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'success': True,
        'message': 'Order saved successfully.',
        'order_id': order_id,
    }), 201


@app.route('/api/orders', methods=['GET'])
def get_orders():
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db_connection()
    rows = conn.execute(
        'SELECT * FROM orders ORDER BY id DESC'
    ).fetchall()
    conn.close()

    orders = []
    for row in rows:
        orders.append({
            'id': row['id'],
            'name': row['name'],
            'phone': row['phone'],
            'delivery_mode': row['delivery_mode'],
            'address': row['address'],
            'note': row['note'],
            'payment': row['payment'],
            'utr': row['utr'],
            'total': row['total'],
            'items': json.loads(row['items'] or '[]'),
            'status': row['status'],
            'created_at': row['created_at'],
        })

    return jsonify(orders)


@app.route('/api/admin/orders/<int:order_id>/status', methods=['POST'])
def update_order_status(order_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401

    payload = request.get_json(silent=True) or {}
    new_status = payload.get('status', '').strip()

    if new_status not in {'Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered'}:
        return jsonify({'error': 'Invalid status value'}), 400

    conn = get_db_connection()
    conn.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        (new_status, order_id)
    )
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'status': new_status})


init_db()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5000'))
    debug = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host='0.0.0.0', port=port, debug=debug)
