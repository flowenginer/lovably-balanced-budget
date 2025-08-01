import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface DeleteRecurringDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteSingle: () => void;
  onDeleteAll: () => void;
  transactionDescription: string;
}

export const DeleteRecurringDialog = ({
  isOpen,
  onClose,
  onDeleteSingle,
  onDeleteAll,
  transactionDescription
}: DeleteRecurringDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir transação recorrente</AlertDialogTitle>
          <AlertDialogDescription>
            Esta é uma transação recorrente: "{transactionDescription}".
            <br /><br />
            Você deseja excluir apenas esta transação ou todas as transações recorrentes relacionadas?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <AlertDialogCancel onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDeleteSingle}
            className="bg-secondary hover:bg-secondary/80"
          >
            Apenas esta
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onDeleteAll}
            className="bg-destructive hover:bg-destructive/80"
          >
            Todas as recorrentes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};