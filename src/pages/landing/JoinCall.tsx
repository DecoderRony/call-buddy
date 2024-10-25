import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import callService from "@/lib/callService";
import { useState } from "react";
import { FaKeyboard } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/components/functions/Toast";
import { getToast } from "@/lib/utils";

function JoinCall() {
  const navigate = useNavigate();
  const [callId, setCallId] = useState<string>("");

  const joinCall = async () => {
    try {
      if (await callService.callExists(callId)) {
        navigate(`/call/${callId}`);
      } else {
        showToast(getToast("INVALID_CALL_ID"));
      }
    } catch (err) {
      showToast(getToast("UNABLE_TO_JOIN_CALL"));
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
