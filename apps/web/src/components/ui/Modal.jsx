import { useEffect, useRef } from 'react';
import { LuX } from 'react-icons/lu';
import { Button, IconButton } from './Button';

const SIZES = { md: 'max-w-md', lg: 'max-w-xl' };

/** Built on <dialog>, which gives focus trapping and Escape-to-close for free. */
export function Modal({ open, title, description, size = 'md', onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={`bg-surface text-ink border-line m-auto w-[calc(100%-2rem)] ${SIZES[size]} rounded-xl border p-0 shadow-xl`}
    >
      {open && (
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">{title}</h2>
              {description && <p className="text-ink-2 mt-0.5 text-sm">{description}</p>}
            </div>
            <IconButton label="Close" onClick={onClose}>
              <LuX className="size-4" />
            </IconButton>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-ink-2 text-sm">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
