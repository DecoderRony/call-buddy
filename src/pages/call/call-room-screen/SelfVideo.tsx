import UserVideo from "@/components/functions/UserVideo";
import { useCallStore } from "@/lib/callStore";

function SelfVideo() {
  const participantName = useCallStore((state) => state.participantName);
  const audioStream = useCallStore((state) => state.audioStream);
  const videoStream = useCallStore((state) => state.videoStream);
  const isMicEnabled = useCallStore((state) => state.isMicEnabled);
  const isCamEnabled = useCallStore((state) => state.isCamEnabled);

  return (
    <div className="absolute h-[20%] w-[30%] sm:h-[30%] sm:w-[25%] bottom-44 lg:bottom-5 right-5">
      <UserVideo
        name={participantName}
        audioStream={audioStream}
        videoStream={videoStream}
        isMicEnabled={isMicEnabled}
        isCamEnabled={isCamEnabled}
        backgroundColor="lighter"
      />
    </div>
  );
}

export default SelfVideo;
