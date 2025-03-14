import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User } from "@shared/schema";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  confirmVariant?: "destructive" | "default";
  isPending: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  confirmVariant = "default",
  isPending
}: ConfirmationModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isPending && !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={confirmVariant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
            disabled={isPending}
          >
            {isPending ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Helper functions to create confirmation dialogs for common actions
export const createBanConfirmation = (
  user: User,
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void,
  isPending: boolean
) => (
  <ConfirmationModal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Ban User"
    description={`Are you sure you want to ban ${user.name}? They will no longer be able to access the application.`}
    confirmText="Ban User"
    confirmVariant="destructive"
    isPending={isPending}
  />
);

export const createUnbanConfirmation = (
  user: User,
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void,
  isPending: boolean
) => (
  <ConfirmationModal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Unban User"
    description={`Are you sure you want to unban ${user.name}? They will regain access to the application.`}
    confirmText="Unban User"
    isPending={isPending}
  />
);
