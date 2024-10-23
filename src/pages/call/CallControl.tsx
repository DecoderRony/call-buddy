import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useCallStore } from "../../lib/callStore";
import Button from "../../components/Button";
import callService from "../../lib/callService";

function CallControl() {
  const navigate = useNavigate();

  const localStream = useCallStore((state) => state.localStream);
  const isMicEnabled = useCallStore((state) => state.isMicEnabled);
  const isCamEnabled = useCallStore((state) => state.isCamEnabled);

  const toggleMic = async () => {
    if (localStream) {
      // Get the audio track from the local stream
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled; // Toggle mute/unmute
        callService.setIsMicEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleCam = async () => {
    if (localStream) {
      // Get the video track from the local stream
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled; // Toggle mute/unmute
        callService.setIsCamEnabled(videoTrack.enabled);
      }
    }
  };

  return (
    <div className="flex justify-center">
      <Button
        onClick={toggleMic}
        variant="rounded"
        className={
          isMicEnabled
            ? "w-16 h-16 bg-zinc-800 hover:bg-zinc-600"
            : "w-16 h-16 bg-red-100 hover:bg-red-200"
        }
      >
        {isMicEnabled ? (
          <FaMicrophone />
        ) : (
          <FaMicrophoneSlash className="text-red-800" />
        )}
      </Button>

      <Button
        onClick={toggleCam}
        variant="rounded"
        className={`ml-2 ${
          isCamEnabled
            ? "w-16 h-16 bg-zinc-800 hover:bg-zinc-600"
            : "w-16 h-16 bg-red-100 hover:bg-red-200"
        }`}
      >
        {isCamEnabled ? <FaVideo /> : <FaVideoSlash className="text-red-800" />}
      </Button>

      <Button
        variant="rounded"
        className="h-16 w-16 ml-2 bg-red-800 hover:bg-red-700"
        onClick={() => {
          callService.endCall();
          navigate("/");
        }}
      >
        <FaPhoneSlash />
      </Button>
    </div>
  );
}

export default CallControl;
