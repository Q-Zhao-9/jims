from app.core.security import hash_password, verify_password


def test_hash_and_verify_round_trip() -> None:
    h = hash_password("correct horse battery staple")
    assert verify_password("correct horse battery staple", h)
    assert not verify_password("wrong", h)
