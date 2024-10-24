import {
  FaExclamation,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa6";
import Button from "../ui/Button";
import { useCallStore } from "@/lib/callStore";
import callService from "@/lib/callService";
import { showToast } from "./Toast";

function MicControl() {
  const localStream = useCallStore((state) => state.localStream);
  const isMicEnabled = useCallStore((state) => state.isMicEnabled);

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

  const handleGetStream = async () => {
    const response = await callService.getLocalStream();
    if (response?.error) {
      if (response.type === "ACCESS_DENIED") {
        showToast({
          title: "Media access denied",
          description:
            "You won't be able to speak or share your video in the call",
          isError: true,
        });
      } else {
        showToast({
          title: "Meida devices not found",
          description:
            "You won't be able to speak or share your video in the call",
          isError: true,
        });
      }
    }
  };

  if (!localStream) {
    return (
      <div className="relative">
        <div className="absolute right-0 top-0 p-1 bg-yellow-500 rounded-full flex justify-center items-center">
          <FaExclamation size="0.8rem" className="text-gray-500" />
        </div>
        <Button
          onClick={handleGetStream}
          variant="rounded"
          className="w-16 h-16 bg-red-400 hover:bg-red-500"
        >
          <FaMicrophoneSlash className="text-red-800" />
        </Button>
      </div>
    );
  }

  return (
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
  );
}

export default MicControl;
