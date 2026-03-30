def test_register_then_me(client) -> None:
    r = client.post(
        "/api/v1/auth/register",
        json={"email": "user@example.com", "password": "password12"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == "user@example.com"
    assert "id" in body

    me = client.get("/api/v1/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "user@example.com"


def test_me_requires_session(client) -> None:
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 401


def test_login_after_logout(client) -> None:
    client.post(
        "/api/v1/auth/register",
        json={"email": "login@example.com", "password": "password12"},
    )
    assert client.post("/api/v1/auth/logout").status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 401

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "password12"},
    )
    assert login.status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 200


def test_register_duplicate_email(client) -> None:
    body = {"email": "dup@example.com", "password": "password12"}
    assert client.post("/api/v1/auth/register", json=body).status_code == 200
    dup = client.post("/api/v1/auth/register", json=body)
    assert dup.status_code == 409


def test_login_invalid_password(client) -> None:
    client.post(
        "/api/v1/auth/register",
        json={"email": "bad@example.com", "password": "password12"},
    )
    r = client.post(
        "/api/v1/auth/login",
        json={"email": "bad@example.com", "password": "wrongpassword"},
    )
    assert r.status_code == 401
