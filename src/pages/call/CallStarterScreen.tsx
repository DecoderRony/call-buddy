import CamControl from "@/components/functions/CamControl";
import MicControl from "@/components/functions/MicControl";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Video from "@/components/ui/Video";
import { useCallStore } from "@/lib/callStore";
import { useState } from "react";

interface CallStarterScreenProps {
  handleJoin: () => void;
}

function CallStarterScreen({ handleJoin }: Readonly<CallStarterScreenProps>) {
  const localStream = useCallStore((state) => state.localStream);
  const [userName, setUserName] = useState("");

  return (
    <div className="h-full px-16 flex flex-col justify-center">
      <div className="flex justify-between items-center">
        <div className="flex-grow h-full w-full flex justify-center items-center mr-10">
          <div id="video-container" className="max-w-[72%] max-h-[90%]">
            <Video stream={localStream} />
          </div>
        </div>
        <div className="flex-grow h-full w-full">
          <div className="h-full flex flex-col gap-6 justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-2xl font-semibold">
                What should we call you?
              </h3>
              <Input
                variant="dark"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="flex gap-6">
              <MicControl />
              <CamControl />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20 flex justify-center items-center">
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
}

export default CallStarterScreen;
