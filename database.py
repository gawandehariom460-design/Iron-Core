"""
database.py
-----------
This file handles EVERYTHING related to the SQLite database.

It contains three simple functions:
  1. init_db()             -> creates the database file and table (auto-runs at startup)
  2. insert_enquiry()      -> saves one demo contact-form enquiry
  3. fetch_all_enquiries() -> reads back every stored enquiry (useful for checking data)

IMPORTANT: Every SQL query below uses PARAMETERISED placeholders (?,?,?,...).
This is the safe way to work with user input - it prevents SQL injection attacks.
"""

import os
import sqlite3

# The database file will be created inside the project folder itself.
DATABASE_NAME = "gym_enquiries.db"
DATABASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), DATABASE_NAME)


def get_connection():
    """Open a new connection to the SQLite database and return it."""
    connection = sqlite3.connect(DATABASE_PATH)
    # row_factory lets us access columns by name (row["email"]) instead of index.
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    """
    Create the database file and the 'enquiries' table if they do not exist yet.
    This runs automatically when the Flask app starts, so the user never has to
    create the database by hand.
    """
    connection = get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS enquiries (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email     TEXT NOT NULL,
                phone     TEXT NOT NULL,
                program   TEXT NOT NULL,
                message   TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()
    finally:
        # Always close the connection, even if something went wrong.
        connection.close()


def insert_enquiry(full_name, email, phone, program, message):
    """
    Save one valid demo enquiry in the database.
    Returns the id of the newly inserted row.
    """
    connection = get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO enquiries (full_name, email, phone, program, message)
            VALUES (?, ?, ?, ?, ?)
            """,
            # The tuple below fills the five '?' placeholders above.
            (full_name, email, phone, program, message),
        )
        connection.commit()
        return cursor.lastrowid
    finally:
        connection.close()


def count_enquiries():
    """Return how many enquiries are stored (used for a quick sanity check)."""
    connection = get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM enquiries")
        return cursor.fetchone()[0]
    finally:
        connection.close()


def fetch_all_enquiries():
    """Return every stored enquiry, newest first. Handy for manual testing."""
    connection = get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM enquiries ORDER BY id DESC")
        return cursor.fetchall()
    finally:
        connection.close()
