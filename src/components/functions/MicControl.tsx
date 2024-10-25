import {
  FaExclamation,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa6";
import Button from "../ui/Button";
import { useCallStore } from "@/lib/callStore";
import callService from "@/lib/callService";
import { showToast } from "./Toast";
import { getToast } from "@/lib/utils";

function MicControl() {
  const audioStream = useCallStore((state) => state.audioStream);
  const isMicEnabled = useCallStore((state) => state.isMicEnabled);

  const toggleMic = async () => {
    const response = await callService.toggleMic();
    if (response?.status === "error") {
      showToast(getToast("DESCRIPTION_ERROR", response.message));
    }
  };

  const handleGetStream = async () => {
    const response = await callService.getAudioStream();
    if (response?.error) {
      response.type === "ACCESS_DENIED"
        ? showToast(getToast("MICROPHONE_ACCESS_DENIED"))
        : showToast(getToast("MICROPHONE_NOT_FOUND"));
    }
  };

  if (!audioStream) {
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
