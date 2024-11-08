import { Spinner } from "@/components/ui/Spinner";
import callService from "@/lib/callService";
import { useEffect, useState } from "react";

type Status = "loading" | "error" | "success";

function ParticipantsDetails() {
  const [status, setStatus] = useState<Status>("loading");
  const [participantsInCall, setParticipantsInCall] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      const participants = await callService.getCallParticipants();
      setTimeout(() => {
        if (!Array.isArray(participants)) {
          setStatus("error");
        } else {
          setStatus("success");
          setParticipantsInCall(participants);
        }
      }, 1000);
    };

    init();
  }, []);

  let content;
  if (status === "loading") {
    content = <Spinner className="text-neutral-400" />;
  } else if (status === "error") {
    content = "Could not get participants details";
  } else if (participantsInCall.length === 0) {
    content = "No participant(s) in the call.";
  } else {
    content = `There are already ${participantsInCall.length} participants in the call`;
  }

  return (
    // h-12 is added to fix height change during shift from loading to content
    <div className="flex items-center h-12 text-neutral-400">{content}</div>
  );
}

export default ParticipantsDetails;
