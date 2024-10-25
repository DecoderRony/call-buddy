import { FaExclamation, FaVideo, FaVideoSlash } from "react-icons/fa6";
import Button from "../ui/Button";
import { useCallStore } from "@/lib/callStore";
import callService from "@/lib/callService";
import { showToast } from "./Toast";
import { getToast } from "@/lib/utils";

function CamControl() {
  const videoStream = useCallStore((state) => state.videoStream);
  const isCamEnabled = useCallStore((state) => state.isCamEnabled);

  const toggleCam = async () => {
    const response = await callService.toggleCam();
    if (response?.status === "error") {
      showToast(getToast("DESCRIPTION_ERROR", response.message));
    }
  };

  const handleGetStream = async () => {
    const response = await callService.getVideoStream();
    if (response?.error) {
      response.type === "ACCESS_DENIED"
        ? showToast(getToast("CAMERA_ACCESS_DENIED"))
        : showToast(getToast("CAMERA_NOT_FOUND"));
    }
  };

  if (!videoStream) {
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
          <FaVideoSlash className="text-red-800" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={toggleCam}
      variant="rounded"
      className={
        isCamEnabled
          ? "w-16 h-16 bg-zinc-800 hover:bg-zinc-600"
          : "w-16 h-16 bg-red-100 hover:bg-red-200"
      }
    >
      {isCamEnabled ? <FaVideo /> : <FaVideoSlash className="text-red-800" />}
    </Button>
  );
}

export default CamControl;
