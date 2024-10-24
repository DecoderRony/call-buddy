import UserVideo from "@/components/functions/UserVideo";
import { useCallStore } from "@/lib/callStore";

function SelfVideo() {
  const participantName = useCallStore((state) => state.participantName);
  const localStream = useCallStore((state) => state.localStream);
  const isMicEnabled = useCallStore((state) => state.isMicEnabled);
  const isCamEnabled = useCallStore((state) => state.isCamEnabled);

  return (
    <div className="absolute h-[30%] w-[25%] bottom-5 right-5">
      <UserVideo
        name={participantName}
        stream={localStream}
        isMicEnabled={isMicEnabled}
        isCamEnabled={isCamEnabled}
      />
    </div>
  );
}

export default SelfVideo;
