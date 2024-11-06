import UserVideo from "@/components/functions/UserVideo";
import { useCallStore } from "@/lib/callStore";
import { useRef } from "react";

function ParticipantsVideos() {
  const participants = useCallStore((state) => state.participants);
  const noOfParticipants = Object.keys(participants).length;
  const parentVideoContainerRef = useRef<HTMLDivElement>(null);

  let gridClasses;
  if (noOfParticipants < 2) {
    gridClasses = "grid-cols-1";
  } else if (noOfParticipants === 2) {
    gridClasses = "grid-cols-1 lg:grid-cols-2";
  } else {
    gridClasses = "grid-cols-2";
  }

  return (
    <div
      ref={parentVideoContainerRef}
      className={`h-5/6 sm:h-full pt-8 pb-3 px-5 sm:px-16 gap-4 grid justify-center items-center ${gridClasses}`}
    >
      {Object.keys(participants).map((participantId) => (
        <UserVideo
          stream={participants[participantId].stream}
          key={participantId}
          name={participants[participantId].name}
          isMicEnabled={participants[participantId].isMicEnabled}
          isCamEnabled={participants[participantId].isCamEnabled}
          backgroundColor="light"
          className="w-full" // Adjusts each video width based on screen size
        />
      ))}
    </div>
  );
}

export default ParticipantsVideos;
