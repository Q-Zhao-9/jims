import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders the status label", () => {
    render(<StatusBadge status="Interview" />);
    expect(screen.getByText("Interview")).toBeInTheDocument();
  });

  it("exposes status for assistive tech", () => {
    render(<StatusBadge status="Offer" />);
    expect(screen.getByRole("status", { name: /offer/i })).toBeInTheDocument();
  });
});
