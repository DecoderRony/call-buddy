import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import callService from "@/lib/callService";
import { useState } from "react";
import { FaKeyboard } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/components/functions/Toast";

function JoinCall() {
  const navigate = useNavigate();
  const [callId, setCallId] = useState<string>("");

  const joinCall = async () => {
    try {
      if (await callService.callExists(callId)) {
        navigate(`/call/${callId}`);
      } else {
        showToast({
          title: "Uh Oh!",
          description:
            "Looks like no call exists with this Call Id. Please check if you've got the Call Id right.",
          isError: true,
        });
      }
    } catch (err) {
      showToast({
        title: "Error joining call",
        description: "Looks like something went wrong. Please try again later.",
        isError: true,
      });
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
      <Button onClick={joinCall} variant="text" disabled={!callId.trim()}>
        Join
      </Button>
    </div>
  );
}

export default JoinCall;
