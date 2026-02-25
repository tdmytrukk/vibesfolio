import { motion, AnimatePresence } from "framer-motion";

interface DeleteBuildDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteBuildDialog = ({ open, onClose, onConfirm }: DeleteBuildDialogProps) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-[30%] z-50 mx-auto max-w-sm card-glass p-6 text-center"
            role="alertdialog"
            aria-label="Delete build confirmation"
          >
            <h3 className="font-heading text-lg text-foreground mb-2">Delete this build?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This can't be undone. All notes will be deleted too.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-pill bg-secondary py-2.5 text-sm font-medium text-secondary-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-pill bg-destructive py-2.5 text-sm font-medium text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeleteBuildDialog;
