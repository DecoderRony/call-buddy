import Button from "@/components/ui/Button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import callService from "@/lib/callService";
import { useCallStore } from "@/lib/callStore";
import { FormEvent, useState } from "react";
import { FaKeyboard } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

function JoinCall() {
  const navigate = useNavigate();
  const [callId, setCallId] = useState<string>("");
  const setParticipantName = useCallStore((state) => state.setParticipantName);
  const [userName, setUserName] = useState("");

  const joinCall = async (e: FormEvent) => {
    try {
      e.preventDefault();
      if (await callService.callExists(callId)) {
        setParticipantName(userName.trim());
        navigate(`/call/${callId}`);
      } else {
        // TODO: Handle UI
        console.log("Call does not exist");
      }
    } catch (err) {
      // TODO: Handle UI
      console.log("Error joining call. Please try again later", err);
    }
  };

  return (
    <div className="flex gap-3">
      <Input
        value={callId}
        type="text"
        placeholder="Enter Call Id"
        onChange={(e) => setCallId(e.target.value)}
        icon={<FaKeyboard size="1.5em" />}
        variant="dark"
      />
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setUserName("");
          }
        }}
      >
        {!callId.trim() ? (
          <Button variant="text" disabled>
            Join
          </Button>
        ) : (
          <DialogTrigger asChild>
            <Button variant="text">Join</Button>
          </DialogTrigger>
        )}
        <DialogContent showCloseIcon={false} className="sm:max-w-[425px]">
          <h3 className="text-2xl text-neutral-900 font-semibold">
            Join an existing call
          </h3>
          <form onSubmit={joinCall} className="flex flex-col gap-4">
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
              <Button type="submit" disabled={!userName.trim()}>
                Join Call
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default JoinCall;
