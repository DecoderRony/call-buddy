import Button from "@/components/ui/Button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import { firestore } from "@/config/firebase";
import { addDoc, collection } from "firebase/firestore";
import { FormEvent, useState } from "react";
import { MdVideoCall } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function StartCall() {
  const navigate = useNavigate();
  const [callName, setCallName] = useState("");

  const startCall = async (e: FormEvent) => {
    e.preventDefault();
    const callsCollection = collection(firestore, "calls");
    const callDocument = await addDoc(callsCollection, { name: callName });
    navigate(`/call/${callDocument.id}`);
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) setCallName("");
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
          <label htmlFor="call-name" className="text-neutral-900 text-sm">
            Provide a name for your call so that your friends know what this
            call is about
          </label>
          <Input
            className="w-full"
            id="call-name"
            variant="light"
            value={callName}
            onChange={(e) => setCallName(e.target.value)}
          />
          <div id="footer" className="flex justify-center mt-2">
            <Button type="submit" disabled={!callName}>
              Start Call
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default StartCall;
