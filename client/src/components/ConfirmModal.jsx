import { AnimatePresence, motion } from "framer-motion";

export default function ConfirmModal({ open, message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            className="w-full max-w-md rounded-[28px] border border-black/5 bg-[#fffaf0] p-6 shadow-card backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-ma-gold">Confirm Transaction</p>
            <p className="mt-4 text-lg leading-7 text-ma-black">{message}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={onConfirm}
                className="flex-1 rounded-full border border-black bg-black px-4 py-3 font-semibold text-ma-gold"
              >
                Confirm
              </button>
              <button
                onClick={onCancel}
                className="flex-1 rounded-full border border-black/10 bg-white px-4 py-3 text-ma-black"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
