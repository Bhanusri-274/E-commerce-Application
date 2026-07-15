import Modal from "../ui/Modal";
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", loading = false }) => (
  <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EF44441A]">
        <AlertTriangle size={24} className="text-[#EF4444]" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-[#0F172A]">{title}</h3>
      <p className="mt-2 text-sm text-[#64748B]">{message}</p>
      <div className="mt-6 flex w-full gap-3">
        <button onClick={onClose} className="btn-secondary flex-1 !py-2.5 text-sm">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 rounded-2xl bg-[#EF4444] py-2.5 text-sm font-semibold text-white transition hover:bg-[#DC2626] disabled:opacity-50"
        >
          {loading ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;
