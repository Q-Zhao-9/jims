import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";

type Tab = "sign-in" | "register";

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (tab === "sign-in") {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password);
      }
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Account"
        lede="Email and password authentication with session cookies to the JIMS API."
      />

      {error ? (
        <p className="filter-banner" role="alert">
          {error}
        </p>
      ) : null}

      <div className="auth-card panel">
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "sign-in"}
            className={`auth-tab${tab === "sign-in" ? " auth-tab--active" : ""}`}
            onClick={() => {
              setTab("sign-in");
              setError(null);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "register"}
            className={`auth-tab${tab === "register" ? " auth-tab--active" : ""}`}
            onClick={() => {
              setTab("register");
              setError(null);
            }}
          >
            Register
          </button>
        </div>

        <form className="auth-form" aria-label={tab === "sign-in" ? "Sign in" : "Register"} onSubmit={onSubmit}>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="field-input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={pending}
            />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="field-input"
              type="password"
              autoComplete={tab === "sign-in" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={pending}
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
            {pending ? "Please wait…" : tab === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </>
  );
}
