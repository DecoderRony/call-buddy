import CamControl from "@/components/functions/CamControl";
import MicControl from "@/components/functions/MicControl";
import { showToast } from "@/components/functions/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import Video from "@/components/ui/Video";
import callService from "@/lib/callService";
import { useCallStore } from "@/lib/callStore";
import { getToast } from "@/lib/utils";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

type Status = "loading" | "error" | "success";

interface ParticipantsDetailsProps {
  participantsInCall: string[];
  status: Status;
}

const ParticipantsDetails = ({
  participantsInCall,
  status,
}: ParticipantsDetailsProps) => {
  let content;
  if (status === "loading") {
    content = <Spinner className="text-neutral-400" />;
  } else if (status === "error") {
    content = "Could not get participants details";
  } else if (participantsInCall.length === 0) {
    content = "No participant(s) in the call.";
  } else {
    content =
      `There are already ${participantsInCall.length} participants in the call`;
  }

  return (
    <span className="hidden lg:inline text-neutral-400">
      {content}
    </span>
  );
};

interface CallStarterScreenProps {
  handleJoin: (userName: string) => void;
}

function CallStarterScreen({ handleJoin }: Readonly<CallStarterScreenProps>) {
  const audioStream = useCallStore((state) => state.audioStream);
  const videoStream = useCallStore((state) => state.videoStream);
  const [userName, setUserName] = useState("");
  const [participantsStatus, setParticipantsStatus] =
    useState<Status>("loading");
  const [participantsInCall, setParticipantsInCall] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      // focus input element
      if (inputRef.current) {
        inputRef.current.focus();
      }

      // get participants details
      const participants = await callService.getCallParticipants();
      if (!Array.isArray(participants)) {
        setParticipantsStatus("error");
      } else {
        setParticipantsStatus("success");
        setParticipantsInCall(participants);
      }
    };

    init();
  }, []);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (userName.trim()) {
        handleJoin(userName);
      } else {
        showToast(getToast("PROVIDE_NAME"));
      }
    }
  };

  return (
    <div className="h-full w-full lg:w-3/5 md:mx-auto flex flex-col justify-center items-center gap-16 md:gap-28 lg:gap-16">
      <h2 className="hidden lg:block text-4xl font-bold">Set up your Call Details</h2>
      <div className="h-full md:h-1/2 w-full flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-28 mt-10 md:mt-0">
        <div className="relative h-full w-full md:w-2/3 lg:min-w-3/4 lg:w-3/4 lg:max-w-3/4 px-5 lg:px-0">
          <Video audioStream={audioStream} videoStream={videoStream} />
          <div className="relative w-full flex justify-center bottom-20 gap-6">
            <MicControl />
            <CamControl />
          </div>
        </div>
        <div className="flex w-full lg:w-1/4 lg:flex-col justify-center items-center text-center gap-10">
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-xl md:text-2xl font-medium">What should we call you?</h3>
            <Input
              ref={inputRef}
              onKeyDown={handleInputKeyDown}
              variant="dark"
              value={userName}
              className="text-center"
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="hidden lg:block lg:w-full lg:border-b border-zinc-700"></div>
          <ParticipantsDetails
            status={participantsStatus}
            participantsInCall={participantsInCall}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <span className="hidden lg:inline text-xl font-semibold">Ready to join?</span>
        <Button
          className="w-28"
          onClick={() => {
            if (userName.trim()) {
              handleJoin(userName);
            }
          }}
          disabled={!userName.trim()}
        >
          Join
        </Button>
      </div>
    </div>
  );
}

export default CallStarterScreen;
