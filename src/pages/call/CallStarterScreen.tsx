import CamControl from "@/components/functions/CamControl";
import MicControl from "@/components/functions/MicControl";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Video from "@/components/ui/Video";
import callService from "@/lib/callService";
import { useCallStore } from "@/lib/callStore";
import { useEffect, useState } from "react";

interface ParticipantsDetailsProps {
  participantsInCall: string[];
  participantsError: boolean;
}

const ParticipantsDetails = ({
  participantsError,
  participantsInCall,
}: ParticipantsDetailsProps) => {
  if (participantsError) {
    return (
      <span className="text-neutral-400">
        Could not get participants details
      </span>
    );
  }

  return participantsInCall.length === 0 ? (
    <span className="text-neutral-400">
      There are no currently no participants in the call. You'll bee first to
      join the call
    </span>
  ) : (
    <span className="text-neutral-400">
      There are already {participantsInCall.length} participants in the call
    </span>
  );
};

interface CallStarterScreenProps {
  handleJoin: () => void;
}

function CallStarterScreen({ handleJoin }: Readonly<CallStarterScreenProps>) {
  const localStream = useCallStore((state) => state.localStream);
  const [userName, setUserName] = useState("");
  const [participantsError, setParticipantsError] = useState(false);
  const [participantsInCall, setParticipantsInCall] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      const participants = await callService.getCallParticipants();
      if (!Array.isArray(participants)) {
        setParticipantsError(true);
      } else {
        setParticipantsInCall(participants);
      }
    };

    init();
  }, []);

  return (
    <div className="h-full w-3/5 mx-auto flex flex-col justify-center items-center gap-16">
      <h2 className="text-4xl font-bold">Set up your Call Details</h2>
      <div className="h-1/2 w-full flex items-center justify-center gap-28">
        <div className="relative h-full min-w-3/4">
          <Video stream={localStream} />
          <div className="absolute w-full flex justify-center bottom-5 gap-6">
            <MicControl />
            <CamControl />
          </div>
        </div>
        <div className="flex flex-col justify-center items-center text-center gap-16">
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-2xl font-medium">What should we call you?</h3>
            <Input
              variant="dark"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="w-full border-b border-zinc-600"></div>
          <ParticipantsDetails
            participantsError={participantsError}
            participantsInCall={participantsInCall}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xl font-semibold">Ready to join?</span>
        <Button
          className="w-28"
          onClick={handleJoin}
          disabled={!userName.trim()}
        >
          Join
        </Button>
      </div>
    </div>
  );

  // return (
  //   <div className="h-full mx-auto flex flex-col justify-center">
  //     <div className="flex justify-between items-center">
  //       <div className="flex-grow h-full w-full flex justify-center items-center mr-10">
  //         <div id="video-container" className="max-w-[72%] max-h-[90%]">
  //           <Video stream={localStream} />
  //         </div>
  //       </div>
  //       <div className="flex-grow h-full w-full">
  //         <div className="h-full flex flex-col gap-6 justify-center items-center">
  //           <div className="flex flex-col items-center gap-2">
  //             <h3 className="text-2xl font-semibold">
  //               What should we call you?
  //             </h3>
  //             <Input
  //               variant="dark"
  //               value={userName}
  //               onChange={(e) => setUserName(e.target.value)}
  //             />
  //           </div>
  //           <div className="flex gap-6">
  //             <MicControl />
  //             <CamControl />
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //     <div className="mt-20 flex justify-center items-center">
  //       <Button
  //         className="w-28"
  //         onClick={handleJoin}
  //         disabled={!userName.trim()}
  //       >
  //         Join
  //       </Button>
  //     </div>
  //   </div>
  // );
}

export default CallStarterScreen;
