"""
Brandr Waitlist — Flask Route
=============================
Drop this into your Brandr Flask app.

Options:
  A) Register as a Blueprint (recommended — see bottom of file)
  B) Add the route directly to your app factory

Form submissions are saved to the database using the WaitlistEntry model.
On failure, falls back to writing to waitlist_submissions.jsonl as a safety net.

Setup:
  1. Add `WaitlistEntry` model to your models (see below)
  2. Run `flask db migrate && flask db upgrade`
  3. Register the blueprint in your app factory:
       from .waitlist_route import waitlist_bp
       app.register_blueprint(waitlist_bp)
  4. Replace DISCORD_INVITE_URL with your real Discord link
  5. (Optional) wire up email notifications via your existing mailer
"""

import json
import logging
import os
from datetime import datetime, timezone

from flask import (
    Blueprint,
    flash,
    redirect,
    render_template,
    request,
    url_for,
)

logger = logging.getLogger(__name__)

# ── Replace with your real Discord invite link ────────────────────────────────
DISCORD_INVITE_URL = "https://discord.gg/PLACEHOLDER"

# ── Fallback file path (used if DB write fails) ───────────────────────────────
FALLBACK_FILE = os.path.join(
    os.path.dirname(__file__), "waitlist_submissions.jsonl"
)

# ═════════════════════════════════════════════════════════════════════════════
#  SQLAlchemy model — add to your existing models.py / db.py
#  (shown here for reference; do not import it from this file)
# ═════════════════════════════════════════════════════════════════════════════
"""
# models.py — add this:

from datetime import datetime, timezone
from your_app import db

class WaitlistEntry(db.Model):
    __tablename__ = 'waitlist_entries'

    id               = db.Column(db.Integer, primary_key=True)
    creator_name     = db.Column(db.String(200), nullable=False)
    email            = db.Column(db.String(200), nullable=False, index=True)
    main_platform    = db.Column(db.String(50))
    pages_accounts   = db.Column(db.String(500))
    creator_type     = db.Column(db.String(50))
    discord_username = db.Column(db.String(100))
    referral_code    = db.Column(db.String(100))
    submitted_at     = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    approved         = db.Column(db.Boolean, default=False)
    notes            = db.Column(db.Text)

    def __repr__(self):
        return f'<WaitlistEntry {self.email}>'
"""


# ═════════════════════════════════════════════════════════════════════════════
#  Blueprint
# ═════════════════════════════════════════════════════════════════════════════

waitlist_bp = Blueprint(
    "waitlist",
    __name__,
    template_folder="templates",
    url_prefix="",          # Routes: /waitlist
)


# ─────────────────────────────────────────────────────────────────────────────
#  Helper: save entry
# ─────────────────────────────────────────────────────────────────────────────

def _save_entry(data: dict) -> bool:
    """
    Attempt to save the waitlist entry to the database.
    Falls back to a JSONL file if the DB is unavailable.
    Returns True on success.
    """
    try:
        # ── Try database first ────────────────────────────────────────────────
        from your_app.models import WaitlistEntry  # adjust import path
        from your_app import db                     # adjust import path

        entry = WaitlistEntry(
            creator_name=data["creator_name"],
            email=data["email"],
            main_platform=data.get("main_platform"),
            pages_accounts=data.get("pages_accounts"),
            creator_type=data.get("creator_type"),
            discord_username=data.get("discord_username"),
            referral_code=data.get("referral_code"),
        )
        db.session.add(entry)
        db.session.commit()
        logger.info("Waitlist entry saved to DB: %s", data["email"])
        return True

    except Exception as db_err:
        logger.warning("DB save failed (%s), falling back to file.", db_err)

    # ── Fallback: JSONL file ──────────────────────────────────────────────────
    try:
        record = {**data, "submitted_at": datetime.now(timezone.utc).isoformat()}
        with open(FALLBACK_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
        logger.info("Waitlist entry saved to fallback file: %s", data["email"])
        return True
    except Exception as file_err:
        logger.error("Fallback file save also failed: %s", file_err)
        return False


def _is_duplicate(email: str) -> bool:
    """Check if this email is already on the waitlist."""
    try:
        from your_app.models import WaitlistEntry  # adjust import path
        return WaitlistEntry.query.filter_by(email=email.lower()).first() is not None
    except Exception:
        return False  # If DB check fails, allow the submission through


# ─────────────────────────────────────────────────────────────────────────────
#  Routes
# ─────────────────────────────────────────────────────────────────────────────

@waitlist_bp.route("/waitlist", methods=["GET"])
def show():
    """Render the waitlist page."""
    return render_template("waitlist.html")


@waitlist_bp.route("/waitlist", methods=["POST"])
def submit():
    """Handle waitlist form submission."""
    # ── Pull form data ────────────────────────────────────────────────────────
    creator_name     = request.form.get("creator_name", "").strip()
    email            = request.form.get("email", "").strip().lower()
    main_platform    = request.form.get("main_platform", "").strip()
    pages_accounts   = request.form.get("pages_accounts", "").strip()
    creator_type     = request.form.get("creator_type", "").strip()
    discord_username = request.form.get("discord_username", "").strip()
    referral_code    = request.form.get("referral_code", "").strip()

    # ── Validate required fields ──────────────────────────────────────────────
    errors = []

    if not creator_name:
        errors.append("Creator / Business Name is required.")

    if not email:
        errors.append("Email is required.")
    elif "@" not in email or "." not in email.split("@")[-1]:
        errors.append("Please enter a valid email address.")

    if errors:
        for err in errors:
            flash(err, "error")
        return render_template(
            "waitlist.html",
            form_data=request.form,
        ), 422

    # ── Duplicate check ───────────────────────────────────────────────────────
    if _is_duplicate(email):
        flash(
            "You're already on the waitlist — we'll be in touch soon.",
            "success",
        )
        return redirect(url_for("waitlist.show"))

    # ── Save entry ────────────────────────────────────────────────────────────
    data = {
        "creator_name":     creator_name,
        "email":            email,
        "main_platform":    main_platform or None,
        "pages_accounts":   pages_accounts or None,
        "creator_type":     creator_type or None,
        "discord_username": discord_username or None,
        "referral_code":    referral_code or None,
    }

    saved = _save_entry(data)

    # ── Optional: send notification email ─────────────────────────────────────
    # Uncomment and adapt to your mailer:
    #
    # try:
    #     from your_app.mail import send_waitlist_notification
    #     send_waitlist_notification(data)
    # except Exception as mail_err:
    #     logger.warning("Notification email failed: %s", mail_err)

    if saved:
        flash(
            "You're on the list! We'll review your application and reach out soon.",
            "success",
        )
    else:
        flash(
            "Something went wrong on our end. Please try again or email us directly.",
            "error",
        )

    return redirect(url_for("waitlist.show"))


# ═════════════════════════════════════════════════════════════════════════════
#  App factory registration (reference)
# ═════════════════════════════════════════════════════════════════════════════
"""
# In your create_app() factory:

from .waitlist_route import waitlist_bp
app.register_blueprint(waitlist_bp)
"""
