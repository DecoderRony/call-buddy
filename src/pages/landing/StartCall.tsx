import Button from "@/components/ui/Button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import { firestore } from "@/config/firebase";
import { useCallStore } from "@/lib/callStore";
import { addDoc, collection } from "firebase/firestore";
import { FormEvent, useState } from "react";
import { MdVideoCall } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function StartCall() {
  const navigate = useNavigate();
  const setParticipantName = useCallStore((state) => state.setParticipantName);
  const [userName, setUserName] = useState("");
  const [callName, setCallName] = useState("");

  const startCall = async (e: FormEvent) => {
    try {
      e.preventDefault();
      const callsCollection = collection(firestore, "calls");
      const callDocument = await addDoc(callsCollection, {
        name: callName,
        createdAt: Date.now(),
      });
      setParticipantName(userName.trim());
      navigate(`/call/${callDocument.id}`);
    } catch (e) {
      // TODO: handle UI
      console.log("cannot start call");
    }
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setCallName("");
          setUserName("");
        }
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
          <div className="flex flex-col gap-2">
            <label htmlFor="user-name" className="text-neutral-900 text-sm">
              What should we call you?
            </label>
            <Input
              className="w-full"
              id="user-name"
              variant="light"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div id="footer" className="flex justify-center mt-2">
            <Button
              type="submit"
              disabled={!callName.trim() || !userName.trim()}
            >
              Start Call
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default StartCall;
