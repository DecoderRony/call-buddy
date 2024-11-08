import { showToast } from "@/components/functions/Toast";
import Button from "@/components/ui/Button";
import { getToast } from "@/lib/utils";
import { useState } from "react";
import ParticipantsDetails from "./ParticipantsDetails";
import SelfVideoPreview from "./SelfVideoPreview";
import UserNameInput from "./UserNameInput";

interface CallStarterScreenProps {
  handleJoin: (userName: string) => void;
}

function CallStarterScreen({ handleJoin }: Readonly<CallStarterScreenProps>) {
  const [userName, setUserName] = useState("");

  const handleInputEnter = () => {
    if (userName.trim()) {
      handleJoin(userName);
    } else {
      showToast(getToast("PROVIDE_NAME"));
    }
  };

  return (
    <>
      {/* Mobile devices and tablet devices - till md */}
      <div className="lg:hidden flex flex-col justify-center items-center h-full w-full px-5 pt-8">
        <div className="flex-grow w-full md:w-2/3">
          <SelfVideoPreview />
        </div>
        <div className="my-5">
          <ParticipantsDetails />
        </div>
        {/* <div className="my-5 block w-3/5 border-b border-zinc-700"></div> */}
        <div className="mb-12">
          <UserNameInput
            userName={userName}
            onUserNameChange={(e) => setUserName(e.target.value)}
            onPressEnter={handleInputEnter}
          />
        </div>
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

      {/* Large devices - after md */}
      <div className="hidden lg:flex flex-col h-full w-3/5 xl:w-1/2 mx-auto justify-center items-center pt-8 gap-16">
        <h2 className="text-4xl font-bold">Set up your Call Details</h2>
        <div className="h-1/2 w-full flex flex-row items-center justify-center gap-28">
          <div className="relative h-full w-2/3">
            <SelfVideoPreview />
          </div>
          <div className="w-1/4 flex flex-col justify-center items-center text-center gap-10">
            <UserNameInput
              userName={userName}
              onUserNameChange={(e) => setUserName(e.target.value)}
              onPressEnter={handleInputEnter}
            />
            <div className="w-full border-b border-zinc-700"></div>
            <ParticipantsDetails />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <span className="text-xl font-semibold">Ready to join?</span>
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
    </>
  );
}

export default CallStarterScreen;
