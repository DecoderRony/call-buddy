import UserVideo from "@/components/functions/UserVideo";
import { useCallStore } from "@/lib/callStore";
import { useRef } from "react";

function ParticipantsVideos() {
  const participants = useCallStore((state) => state.participants);
  const noOfParticipants = Object.keys(participants).length;
  const parentVideoContainerRef = useRef<HTMLDivElement>(null);
  // let videoHeight = 0;
  // let videoWidth = 0;

  // let gridClasses;
  // if (Object.keys(participants).length === 1) {
  //   gridClasses = "grid grid-cols-1 grid-rows-1";
  // } else if (Object.keys(participants).length === 2) {
  //   gridClasses = "grid grid-cols-2 grid-rows-1";
  // } else {
  //   const rows = Math.ceil(Object.keys(participants).length / 2);
  //   gridClasses = `grid grid-cols-2 grid-rows-[${rows}]`;
  //   if (parentVideoContainerRef.current?.offsetWidth) {
  //     videoWidth = parentVideoContainerRef.current?.offsetWidth / 2;
  //   }

  //   if (parentVideoContainerRef.current?.offsetHeight) {
  //     // calculating container height wrt to (total container height - (number of rows * gap space))
  //     const containerHeight =
  //       parentVideoContainerRef.current.offsetHeight -
  //       (rows < 1 ? 0 : rows - 1) * 38;
  //     videoHeight = containerHeight / rows;
  //     console.log(">>Container height: ", videoHeight);
  //   }
  // }

  return (
    <div
  ref={parentVideoContainerRef}
  className={`h-full pt-8 pb-3 px-2 sm:px-16 gap-4 grid justify-center items-center ${
    noOfParticipants < 2 ? 'grid-cols-1' : noOfParticipants === 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-2'
  }`}
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
