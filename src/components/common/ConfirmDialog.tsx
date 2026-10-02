import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  requireTextMatch?: string; // e.g. "RESET" or "TUTUP"
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDanger = false,
  onConfirm,
  onCancel,
  requireTextMatch,
}) => {
  const [typedInput, setTypedInput] = React.useState('');

  if (!isOpen) return null;

  const isConfirmDisabled = requireTextMatch ? typedInput.trim() !== requireTextMatch : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{message}</p>
          </div>
        </div>

        {requireTextMatch && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ketik kata <span className="font-mono text-rose-600 font-bold">"{requireTextMatch}"</span> untuk konfirmasi:
            </label>
            <input
              type="text"
              value={typedInput}
              onChange={e => setTypedInput(e.target.value)}
              placeholder={`Ketik ${requireTextMatch}`}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              if (!isConfirmDisabled) {
                onConfirm();
                setTypedInput('');
              }
            }}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
