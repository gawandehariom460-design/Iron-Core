"""
app.py
------
Flask web application for the "IronCore Fitness" Gym & Fitness Landing Page.

How to run it:
    1. pip install -r requirements.txt
    2. python app.py
    3. Open http://127.0.0.1:5000 in your browser.

The SQLite database is created automatically the first time the app starts,
so there is no need to create it manually.
"""

import re

from flask import Flask, jsonify, render_template, request

from database import fetch_all_enquiries, init_db, insert_enquiry

# Create the Flask application object.
app = Flask(__name__)

# ---------------------------------------------------------------------------
# Start-up: create the database file + table if they don't exist yet.
# ---------------------------------------------------------------------------
init_db()

# ---------------------------------------------------------------------------
# Allowed programs - must match the <select> options in the contact form.
# ---------------------------------------------------------------------------
VALID_PROGRAMS = ["Strength Training", "Weight Loss", "Personal Training", "Cardio Fitness"]

# Regular expressions used for simple server-side validation.
EMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
PHONE_REGEX = re.compile(r"^[0-9+\-\s()]{7,15}$")


# ---------------------------------------------------------------------------
# Helper: validate the submitted form data. Returns (clean_data, errors).
# clean_data is a dict of trimmed values; errors is a dict of error messages.
# ---------------------------------------------------------------------------
def validate_enquiry(form):
    """Validate every field of the contact form on the server side."""
    # .strip() removes accidental spaces at the start/end of the input.
    full_name = form.get("full_name", "").strip()
    email = form.get("email", "").strip()
    phone = form.get("phone", "").strip()
    program = form.get("program", "").strip()
    message = form.get("message", "").strip()

    errors = {}

    # --- Full name ---
    if not full_name:
        errors["full_name"] = "Please enter your full name."
    elif len(full_name) < 3:
        errors["full_name"] = "Full name must be at least 3 characters long."
    elif len(full_name) > 80:
        errors["full_name"] = "Full name must be less than 80 characters."

    # --- Email ---
    if not email:
        errors["email"] = "Please enter your email address."
    elif not EMAIL_REGEX.match(email):
        errors["email"] = "Please enter a valid email address (e.g. name@example.com)."
    elif len(email) > 120:
        errors["email"] = "Email address is too long."

    # --- Phone ---
    if not phone:
        errors["phone"] = "Please enter your phone number."
    elif not PHONE_REGEX.match(phone):
        errors["phone"] = "Phone number may only contain digits, spaces, +, - and ()."

    # --- Program ---
    if not program:
        errors["program"] = "Please choose a fitness program."
    elif program not in VALID_PROGRAMS:
        errors["program"] = "Please choose one of our listed programs."

    # --- Message ---
    if not message:
        errors["message"] = "Please write a short message."
    elif len(message) < 10:
        errors["message"] = "Message must be at least 10 characters long."
    elif len(message) > 1000:
        errors["message"] = "Message must be less than 1000 characters."

    clean_data = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "program": program,
        "message": message,
    }
    return clean_data, errors


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def home():
    """Render the single-page landing page."""
    return render_template("index.html")


@app.route("/api/contact", methods=["POST"])
def contact():
    """
    Receive the contact form submitted from the browser (as JSON),
    validate it on the server, and save valid demo enquiries in SQLite.

    Returns a JSON object:
        success -> True/False
        message -> friendly text for the user
        errors  -> dictionary of field-name -> error message (only on failure)
    """
    # The form is sent as JSON, so request.get_json() reads it safely.
    data = request.get_json(silent=True) or {}

    clean_data, errors = validate_enquiry(data)

    # 1) If validation failed, send the errors back to the browser.
    if errors:
        return jsonify(success=False, message="Please fix the highlighted errors.", errors=errors), 400

    # 2) Everything is valid - try to store it in the database.
    try:
        new_id = insert_enquiry(
            clean_data["full_name"],
            clean_data["email"],
            clean_data["phone"],
            clean_data["program"],
            clean_data["message"],
        )
    except Exception:
        # Never leak database details to the visitor.
        return jsonify(
            success=False,
            message="Sorry, we could not save your enquiry right now. Please try again later.",
        ), 500

    # 3) Tell the browser everything went fine.
    return jsonify(
        success=True,
        message="Thank you! Your demo enquiry has been received. Our team will contact you soon.",
        enquiry_id=new_id,
    ), 201


@app.route("/api/enquiries", methods=["GET"])
def list_enquiries():
    """
    Tiny read-only helper for TESTING ONLY.
    It returns every stored demo enquiry as JSON so you can confirm that
    submissions really are saved in SQLite.
    """
    rows = fetch_all_enquiries()
    return jsonify([dict(row) for row in rows])


# ---------------------------------------------------------------------------
# Start the development server when this file is run directly.
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("IronCore Fitness is running at http://127.0.0.1:5000")
    app.run(debug=True, host="127.0.0.1", port=5000)
