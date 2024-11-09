import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { AiOutlineRotateRight } from "react-icons/ai";

function LandscapeNotice() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent
        onEscapeKeyDown={(event: KeyboardEvent) => event.preventDefault()}
        className="flex justify-center items-center p-20"
      >
        <AlertDialogHeader>
          <div className="text-center w-full">
            <AiOutlineRotateRight
              size="8rem"
              className="text-gray-500 w-full"
            />
            <AlertDialogTitle className="text-2xl text-neutral-900 font-semibold">
              Layout not supported
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-900 text-sm">
              Please rotate your device to enjoy the best experience with the
              application.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LandscapeNotice;
