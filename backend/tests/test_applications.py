import uuid


def _register(client) -> None:
    assert (
        client.post(
            "/api/v1/auth/register",
            json={"email": "app@example.com", "password": "password12"},
        ).status_code
        == 200
    )


def test_create_application_with_employer(client) -> None:
    _register(client)
    emp = client.post(
        "/api/v1/employers",
        json={"name": "Northwind", "website_url": None, "notes": None},
    )
    assert emp.status_code == 201
    employer_id = emp.json()["id"]

    r = client.post(
        "/api/v1/applications",
        json={
            "employer_id": employer_id,
            "role": "Engineer",
            "status": "Applied",
            "notes": "hello",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data["role"] == "Engineer"
    assert data["status"] == "Applied"
    assert data["document_ids"] == []
    assert data["employer_id"] == employer_id
    assert data["salary"] is None
    assert data["work_mode"] is None
    assert data["source_url"] is None


def test_create_application_salary_mode_url(client) -> None:
    _register(client)
    emp = client.post(
        "/api/v1/employers",
        json={"name": "Acme", "website_url": None, "notes": None},
    )
    assert emp.status_code == 201
    employer_id = emp.json()["id"]

    r = client.post(
        "/api/v1/applications",
        json={
            "employer_id": employer_id,
            "role": "Engineer",
            "salary": "$150k",
            "work_mode": "remote",
            "source_url": "https://jobs.example.com/123",
            "status": "Saved",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data["salary"] == "$150k"
    assert data["work_mode"] == "remote"
    assert data["source_url"] == "https://jobs.example.com/123"


def test_application_invalid_employer(client) -> None:
    _register(client)
    r = client.post(
        "/api/v1/applications",
        json={
            "employer_id": str(uuid.uuid4()),
            "role": "X",
            "status": "Saved",
        },
    )
    assert r.status_code == 422


def test_applications_require_auth(client) -> None:
    assert client.get("/api/v1/applications").status_code == 401
