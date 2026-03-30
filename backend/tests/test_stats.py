def test_dashboard_stats_empty_pipeline(client) -> None:
    assert (
        client.post(
            "/api/v1/auth/register",
            json={"email": "stats@example.com", "password": "password12"},
        ).status_code
        == 200
    )
    r = client.get("/api/v1/stats/dashboard")
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 0
    assert data["interview_conversion_rate"] is None
    assert data["by_status"]["Saved"] == 0


def test_stats_require_auth(client) -> None:
    assert client.get("/api/v1/stats/dashboard").status_code == 401
