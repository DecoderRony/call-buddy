import { showToast } from "@/components/functions/Toast";
import Button from "@/components/ui/Button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import callService from "@/lib/callService";
import { FormEvent, useState } from "react";
import { MdVideoCall } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function StartCall() {
  const navigate = useNavigate();
  const [callName, setCallName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const startCall = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const callId = await callService.createCall(callName);
      navigate(`/call/${callId}`);
    } catch (e) {
      setIsDialogOpen(false);
      setCallName("");
      showToast({
        title: "Error creating call",
        description: "Looks like something went wrong. Please try again later.",
        isError: true,
      });
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          setCallName("");
        }
        setIsDialogOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <MdVideoCall size="1.5em" /> &nbsp; Start a call
        </Button>
      </DialogTrigger>
      <DialogContent showCloseIcon={false} className="sm:max-w-[425px]">
        <h3 className="text-2xl text-neutral-900 font-semibold">
          Start a new Call
        </h3>
        <form onSubmit={startCall} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="call-name" className="text-neutral-900 text-sm">
              Provide a name for your call so that your friends know what this
              call is about
            </label>
            <Input
              className="w-full"
              id="call-name"
              variant="light"
              placeholder="Enter call name"
              value={callName}
              onChange={(e) => setCallName(e.target.value)}
            />
          </div>
          <div id="footer" className="flex justify-center mt-2">
            <Button type="submit" disabled={!callName.trim()}>
              Start Call
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default StartCall;
