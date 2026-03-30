def test_create_interview(client) -> None:
    assert (
        client.post(
            "/api/v1/auth/register",
            json={"email": "int@example.com", "password": "password12"},
        ).status_code
        == 200
    )
    emp = client.post(
        "/api/v1/employers",
        json={"name": "Co", "website_url": None, "notes": None},
    )
    employer_id = emp.json()["id"]
    app_row = client.post(
        "/api/v1/applications",
        json={"employer_id": employer_id, "role": "R", "status": "Interview"},
    )
    application_id = app_row.json()["id"]

    r = client.post(
        "/api/v1/interviews",
        json={
            "application_id": application_id,
            "interview_type": "Technical",
            "scheduled_at": "2026-04-01T15:00:00Z",
            "meeting_link": "https://meet.example/x",
            "interviewers": "A, B",
            "notes": "prep",
        },
    )
    assert r.status_code == 201
    assert r.json()["interview_type"] == "Technical"

    filtered = client.get(
        "/api/v1/interviews",
        params={"application_id": application_id},
    )
    assert filtered.status_code == 200
    assert len(filtered.json()) == 1


def test_interviews_require_auth(client) -> None:
    assert client.get("/api/v1/interviews").status_code == 401
