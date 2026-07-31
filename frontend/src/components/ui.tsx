import type { ReactNode } from 'react';

export function Alert({
  kind = 'error',
  children,
}: {
  kind?: 'error' | 'success';
  children: ReactNode;
}) {
  return <div className={`alert alert-${kind}`}>{children}</div>;
}

export function StateBlock({ children }: { children: ReactNode }) {
  return <div className="state-block panel">{children}</div>;
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return <StateBlock>{label}</StateBlock>;
}

export function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <StateBlock>
      <strong>{title}</strong>
      {detail ? <p>{detail}</p> : null}
    </StateBlock>
  );
}

export function Badge({
  value,
  kind,
}: {
  value: string;
  kind?: string;
}) {
  return <span className={`badge ${kind ? `badge-${kind}` : ''}`}>{value}</span>;
}
