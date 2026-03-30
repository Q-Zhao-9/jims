def test_upload_list_delete_document(client) -> None:
    assert (
        client.post(
            "/api/v1/auth/register",
            json={"email": "doc@example.com", "password": "password12"},
        ).status_code
        == 200
    )
    emp = client.post(
        "/api/v1/employers",
        json={"name": "DocCo", "website_url": None, "notes": None},
    )
    employer_id = emp.json()["id"]
    app_row = client.post(
        "/api/v1/applications",
        json={"employer_id": employer_id, "role": "R", "status": "Saved"},
    )
    application_id = app_row.json()["id"]

    files = {"file": ("cv.pdf", b"%PDF-1.4 test", "application/pdf")}
    data = {"kind": "resume", "label": "Main CV", "application_id": str(application_id)}
    up = client.post("/api/v1/documents", files=files, data=data)
    assert up.status_code == 201, up.text
    doc_id = up.json()["id"]

    listed = client.get("/api/v1/documents")
    assert len(listed.json()) == 1

    dl = client.get(f"/api/v1/documents/{doc_id}/file")
    assert dl.status_code == 200
    assert dl.content.startswith(b"%PDF")

    assert client.delete(f"/api/v1/documents/{doc_id}").status_code == 204
    assert client.get(f"/api/v1/documents/{doc_id}/file").status_code == 404


def test_documents_require_auth(client) -> None:
    assert client.get("/api/v1/documents").status_code == 401
