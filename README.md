# IronCore Fitness — Gym & Fitness Landing Page

A beginner-friendly, responsive **Gym & Fitness Landing Page** built with
**HTML5, CSS3, Vanilla JavaScript, Python Flask and SQLite**.
No frontend frameworks (no React, no Bootstrap) — just clean, easy-to-read code.

> ⚠️ **Demo project only.** All statistics, trainer profiles, prices and contact
> details are fictional. No real payments, accounts or personal data are involved.

---

## 1. Project Structure

```
gym-fitness/
├── app.py                  # Flask routes (home page + contact API)
├── database.py             # SQLite setup, insert & read helpers
├── requirements.txt        # Python dependencies (only Flask)
├── gym_enquiries.db        # SQLite database (auto-created on first run)
├── templates/
│   └── index.html          # The single-page website (all sections)
└── static/
    ├── css/
    │   └── style.css       # Dark theme + responsive media queries
    ├── js/
    │   └── script.js       # Menu, smooth scroll, form validation & submit
    └── images/             # Gym & fitness photos
```

---

## 2. How to Run the Project (Windows)

Open **PowerShell** inside the `gym-fitness` folder and run these commands one by one:

```powershell
# 1. Create a virtual environment (only needed once)
python -m venv venv

# 2. Activate it
.\venv\Scripts\Activate.ps1

# 3. Install the only dependency (Flask)
pip install -r requirements.txt

# 4. Start the application
python app.py
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Then open your browser at: **http://127.0.0.1:5000**

The SQLite database file (`gym_enquiries.db`) and the `enquiries` table are
created **automatically** the first time the app starts — no manual setup needed.
Press `Ctrl + C` in the terminal to stop the server.

---

## 3. What to Test in the Browser

| # | Test | What should happen |
|---|------|--------------------|
| 1 | Open the homepage | Title *IronCore Fitness \| Gym & Fitness Landing Page* and the hero heading **BUILD YOUR STRONGER SELF** are visible |
| 2 | Click each nav link | Page scrolls smoothly to Home / About / Programs / Trainers / Membership / Contact |
| 3 | Shrink the window below 768 px | A hamburger button appears; tapping it slides the menu in; tapping a link or outside closes it |
| 4 | Click **Join This Program** on any program card | Page scrolls to Contact and the *Interested Program* dropdown is pre-selected |
| 5 | Click **Choose Plan** on a membership card | Page scrolls to Contact and the *Message* box is pre-filled with the plan name |
| 6 | Submit the form empty / with a bad email | Red field errors + a red banner appear (client-side validation) |
| 7 | Submit a valid enquiry | A green success banner appears, the form clears, and the record is saved in SQLite |

---

## 4. How to Verify Submissions Are Stored in SQLite

**Option A — quickest:** while the app is running, open
http://127.0.0.1:5000/api/enquiries in your browser. It returns every stored
enquiry as JSON.

**Option B — Python one-liner** (run inside the project folder):

```powershell
python -c "import database; [print(dict(r)) for r in database.fetch_all_enquiries()]"
```

**Option C — sqlite3 command line:**

```
sqlite3 gym_enquiries.db "SELECT id, full_name, email, program FROM enquiries;"
```

Example output after one demo submission:

```
1|Demo User|demo@example.com|Strength Training
```

To delete all stored enquiries, simply stop the app and delete `gym_enquiries.db` —
it will be recreated automatically on the next start.

---

## 5. Security & Code-Quality Notes

- All SQL uses **parameterised queries** (`?` placeholders) — no SQL injection.
- The contact form is validated **twice**: in JavaScript (fast feedback) and in
  Flask (`validate_enquiry()` in `app.py`) — never trust the browser alone.
- Database errors are caught and replaced with a friendly message; internals
  are never shown to visitors.
- Frontend (`static/`), backend (`app.py`) and database (`database.py`) logic
  are kept in separate files.
- Only fictional demonstration data is stored (name, email, phone, program,
  message) — nothing else, no secrets in the code.
