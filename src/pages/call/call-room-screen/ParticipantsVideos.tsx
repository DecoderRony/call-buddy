import UserVideo from "@/components/functions/UserVideo";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InfoIcon from "@/components/ui/InfoIcon";
import { useCallStore } from "@/lib/callStore";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { useRef, useState } from "react";
import { HiDotsVertical } from "react-icons/hi";

function ParticipantsVideos() {
  const participants = useCallStore((state) => state.participants);
  const noOfParticipants = Object.keys(participants).length;
  const parentVideoContainerRef = useRef<HTMLDivElement>(null);
  const [mutedParticipants, setMutedParticipants] = useState<
    Record<string, boolean>
  >(
    Object.keys(participants).reduce(
      (finalObj, participantId) => ({ ...finalObj, [participantId]: false }),
      {}
    )
  );

  const toggleMute = (participantId: string) => {
    setTimeout(() => {
      setMutedParticipants((prev) => ({
        ...prev,
        [participantId]: !prev[participantId],
      }));
    }, 100);
  };

  let gridClasses;
  if (noOfParticipants < 2) {
    gridClasses = "grid grid-cols-1 auto-rows-fr justify-center items-center";
  } else if (noOfParticipants === 2) {
    gridClasses =
      "grid grid-cols-1 lg:grid-cols-2 auto-rows-fr justify-center items-center";
  } else {
    gridClasses =
      "grid grid-cols-2 auto-rows-fr justify-center justify-items-center items-center";
  }
  console.log("rerendering");
  return (
    <div
      ref={parentVideoContainerRef}
      className={`h-5/6 sm:h-full pt-8 pb-3 px-5 sm:px-16 gap-4 ${gridClasses}`}
    >
      {noOfParticipants === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-semibold text-center text-neutral-400">
          There's no one else here. Invite your friends to join!
        </div>
      )}
      {Object.keys(participants).map((participantId) => (
        <UserVideo
          stream={participants[participantId].stream}
          key={participantId}
          name={participants[participantId].name}
          isMicEnabled={participants[participantId].isMicEnabled}
          isCamEnabled={participants[participantId].isCamEnabled}
          backgroundColor="light"
          className="w-full" // Adjusts each video width based on screen size
          muted={mutedParticipants[participantId]}
          optionsComponent={
            <DropdownMenu>
              <DropdownMenuTrigger>
                <InfoIcon icon={<HiDotsVertical />}></InfoIcon>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => toggleMute(participantId)}>
                  {mutedParticipants[participantId] ? "Unmute" : "Mute"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
      ))}
    </div>
  );
}

export default ParticipantsVideos;
