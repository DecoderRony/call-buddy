import Video from "@/components/ui/Video";
import callService from "@/lib/callService";
import { useCallStore } from "@/lib/callStore";
import { useEffect } from "react";

function SelfVideo() {
  const participantId = useCallStore((state) => state.participantId);
  const participantName = useCallStore((state) => state.participantName);
  const localStream = useCallStore((state) => state.localStream);
  const isMicEnabled = useCallStore((state) => state.isMicEnabled);
  const isCamEnabled = useCallStore((state) => state.isCamEnabled);
  const setHasMediaAccess = useCallStore((state) => state.setHasMediaAccess);

  // If joined call, then ask for media access
  useEffect(() => {
    if (!localStream && participantId) {
      getLocalStream();
    }
  }, [participantId]);

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      callService.updateLocalStream(stream);
      callService.setIsMicEnabled(true);
      callService.setIsCamEnabled(true);
      setHasMediaAccess(true);
    } catch (error) {
      console.log("Could not get media access", error);
    }
  };

  return (
    <div className="absolute h-[30%] w-[25%] bottom-5 right-5">
      <Video
        name={participantName}
        stream={localStream}
        isMicEnabled={isMicEnabled}
        isCamEnabled={isCamEnabled}
      />
    </div>
  );
}

export default SelfVideo;
