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
        className="flex justify-center items-center p-10 md:p-20 !w4/5"
      >
        <AlertDialogHeader>
          <div className="text-center w-full">
            <AiOutlineRotateRight
              size="8rem"
              className="text-gray-500 w-full"
            />
            <AlertDialogTitle className="text-xl md:text-2xl text-neutral-900 font-semibold">
              Layout not supported
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-900 text-xs md:text-sm">
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
