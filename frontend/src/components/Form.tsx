import type { FormEvent, ReactNode } from 'react';

type FieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

export function Field({ label, error, children }: FieldProps) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error ? <span className="hint">{error}</span> : null}
    </div>
  );
}

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={busy ? () => undefined : onCancel}>
      <p style={{ margin: '0 0 1rem', color: 'var(--muted)' }}>{message}</p>
      <div className="modal-actions">
        <button
          className="btn btn-ghost"
          type="button"
          onClick={onCancel}
          disabled={busy}
        >
          {cancelLabel}
        </button>
        <button
          className="btn btn-danger"
          type="button"
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function preventSubmit(handler: () => void | Promise<void>) {
  return (e: FormEvent) => {
    e.preventDefault();
    void handler();
  };
}
