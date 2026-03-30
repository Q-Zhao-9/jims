import { Link } from "react-router-dom";

export function PleaseSignIn({ message }: { message?: string }) {
  return (
    <p className="filter-banner" role="status">
      {message ?? "Sign in to load your data."}{" "}
      <Link to="/sign-in" className="inline-link">
        Sign in
      </Link>
    </p>
  );
}
