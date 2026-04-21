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
import { Loader2, Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps<T = any> {
  open: boolean;
  record?: T | null;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  title?: string;
  description?: string | ((record?: T | null) => React.ReactNode);
  cancelText?: string;
  deleteText?: string;
  icon?: React.ReactNode;
}

function DeleteConfirmationDialog<T = any>({
  open,
  record,
  isLoading = false,
  onOpenChange,
  onDelete,
  title,
  description,
  cancelText = "Cancel",
  deleteText = "Delete",
  icon,
}: DeleteConfirmationDialogProps<T>) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title || "Delete Item"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {typeof description === "function"
              ? description(record)
              : description ||
                "Are you sure you want to delete this item? This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} disabled={isLoading}>
            {isLoading
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : icon || <Trash2 className="mr-2 h-4 w-4" />}
            {deleteText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteConfirmationDialog;