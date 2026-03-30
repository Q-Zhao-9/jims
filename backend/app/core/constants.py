APPLICATION_STATUS_VALUES = frozenset(
    {
        "Saved",
        "Applied",
        "OA",
        "Interview",
        "Final Round",
        "Offer",
        "Rejected",
        "Ghosted",
    }
)

DOCUMENT_KIND_VALUES = frozenset(
    {"resume", "cover_letter", "reference_letter", "other"}
)

WORK_MODE_VALUES = frozenset({"in_person", "remote", "hybrid"})

REMINDER_CHANNEL_VALUES = frozenset({"in_app", "email"})
