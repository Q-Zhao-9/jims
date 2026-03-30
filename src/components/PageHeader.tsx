import type { ReactNode } from "react";

export function PageHeader({
  title,
  lede,
  ledeWide,
  actions,
}: {
  title: string;
  lede?: string;
  /** Use full content width for intro text (default caps width for readability on other pages). */
  ledeWide?: boolean;
  actions?: ReactNode;
}) {
  return (
    <section className="page-head page-head--split">
      <div>
        <h1>{title}</h1>
        {lede ? (
          <p className={`lede${ledeWide ? " lede--wide" : ""}`}>{lede}</p>
        ) : null}
      </div>
      {actions ? <div className="page-head__actions">{actions}</div> : null}
    </section>
  );
}
