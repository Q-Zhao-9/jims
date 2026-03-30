def _register(client) -> None:
    assert (
        client.post(
            "/api/v1/auth/register",
            json={"email": "e@example.com", "password": "password12"},
        ).status_code
        == 200
    )


def test_create_list_update_delete_employer(client) -> None:
    _register(client)

    created = client.post(
        "/api/v1/employers",
        json={
            "name": "Acme Corp",
            "website_url": "https://acme.example",
            "notes": "Notes here",
        },
    )
    assert created.status_code == 201
    eid = created.json()["id"]
    assert created.json()["name"] == "Acme Corp"

    listed = client.get("/api/v1/employers")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    one = client.get(f"/api/v1/employers/{eid}")
    assert one.status_code == 200
    assert one.json()["name"] == "Acme Corp"

    patched = client.patch(
        f"/api/v1/employers/{eid}",
        json={"name": "Acme Updated"},
    )
    assert patched.status_code == 200
    assert patched.json()["name"] == "Acme Updated"

    assert client.delete(f"/api/v1/employers/{eid}").status_code == 204
    assert client.get(f"/api/v1/employers/{eid}").status_code == 404


def test_delete_employer_blocked_when_applications_exist(client) -> None:
    _register(client)
    emp = client.post(
        "/api/v1/employers",
        json={"name": "Has Apps", "website_url": None, "notes": None},
    )
    assert emp.status_code == 201
    eid = emp.json()["id"]
    app = client.post(
        "/api/v1/applications",
        json={"employer_id": eid, "role": "Engineer", "status": "Saved"},
    )
    assert app.status_code == 201
    r = client.delete(f"/api/v1/employers/{eid}")
    assert r.status_code == 409
    assert "application" in r.json()["detail"].lower()


def test_employers_require_auth(client) -> None:
    assert client.get("/api/v1/employers").status_code == 401
