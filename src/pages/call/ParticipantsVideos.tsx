import Video from "@/components/ui/Video";
import { useCallStore } from "@/lib/callStore";
import { useRef } from "react";

function ParticipantsVideos() {
  const participants = useCallStore((state) => state.participants);

  const parentVideoContainerRef = useRef<HTMLDivElement>(null);
  let videoHeight = 0;
  let videoWidth = 0;

  let gridClasses;
  if (Object.keys(participants).length === 1) {
    gridClasses = "grid grid-cols-1 grid-rows-1";
  } else if (Object.keys(participants).length === 2) {
    gridClasses = "grid grid-cols-2 grid-rows-1";
  } else {
    const rows = Math.ceil(Object.keys(participants).length / 2);
    gridClasses = `grid grid-cols-2 grid-rows-[${rows}]`;
    if (parentVideoContainerRef.current?.offsetWidth) {
      videoWidth = parentVideoContainerRef.current?.offsetWidth / 2;
    }

    if (parentVideoContainerRef.current?.offsetHeight) {
      // calculating container height wrt to (total container height - (number of rows * gap space))
      const containerHeight =
        parentVideoContainerRef.current.offsetHeight -
        (rows < 1 ? 0 : rows - 1) * 12;
      videoHeight = containerHeight / rows;
    }
  }

  return (
    <div
      ref={parentVideoContainerRef}
      className={"h-full pt-8 pb-3 px-16 gap-3 " + gridClasses}
    >
      {Object.keys(participants).map((participantId) => (
        <Video
          stream={participants[participantId].stream}
          key={participantId}
          height={videoHeight}
          width={videoWidth}
          name={participants[participantId].name}
          isMicEnabled={participants[participantId].isMicEnabled}
          isCamEnabled={participants[participantId].isCamEnabled}
        />
      ))}
    </div>
  );
}

export default ParticipantsVideos;
