# Lolas Tasty Bites Full-Stack Website

## Run locally

1. Install requirements:
   `py -m pip install -r requirements.txt`
2. Start the backend:
   `py app.py`
3. Open in browser:
   `http://localhost:5000`
4. Admin dashboard:
   `http://localhost:5000/admin`

## Features

- Menu and cart checkout
- Order submission to backend
- SQLite database for order storage
- Admin page to view all orders
- WhatsApp order message generation
- UPI QR payment flow

## Deploy to Render

Create a web service from this repository using `render.yaml`. Set `SECRET_KEY` to a long random value and `ADMIN_PASSWORD` to a strong password in the Render dashboard before deploying. Production startup fails if either secret is missing.
