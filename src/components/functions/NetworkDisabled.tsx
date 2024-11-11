import { MdWifiOff } from "react-icons/md";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

const NetworkDisabled = () => {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent
        onEscapeKeyDown={(event: KeyboardEvent) => event.preventDefault()}
        className="flex justify-center items-center p-10 md:p-20 !w-4/5"
      >
        <AlertDialogHeader>
          <div className="text-center w-full">
            <MdWifiOff size="8rem" className="text-gray-500 w-full" />
            <AlertDialogTitle className="text-xl md:text-2xl text-neutral-900 font-semibold">
              You’re Offline
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-900 text-xs md:text-sm">
              Please check your internet connection. We'll resume our services once you are online.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NetworkDisabled;
