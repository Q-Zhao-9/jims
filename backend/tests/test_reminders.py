from datetime import datetime, timezone


def test_create_reminder(client) -> None:
    assert (
        client.post(
            "/api/v1/auth/register",
            json={"email": "rem@example.com", "password": "password12"},
        ).status_code
        == 200
    )
    due = datetime(2026, 5, 1, 12, 0, tzinfo=timezone.utc)
    r = client.post(
        "/api/v1/reminders",
        json={
            "title": "Follow up",
            "due_at": due.isoformat(),
            "channel": "in_app",
            "application_id": None,
        },
    )
    assert r.status_code == 201
    assert r.json()["title"] == "Follow up"

    listed = client.get("/api/v1/reminders")
    assert listed.status_code == 200
    assert len(listed.json()) == 1


def test_reminders_require_auth(client) -> None:
    assert client.get("/api/v1/reminders").status_code == 401
