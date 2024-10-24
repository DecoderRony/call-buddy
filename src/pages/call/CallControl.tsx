import CamControl from "@/components/functions/CamControl";
import MicControl from "@/components/functions/MicControl";
import { FaPhoneSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import callService from "../../lib/callService";

function CallControl() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center gap-4">
      <MicControl />
      <CamControl />

      {/* End call control */}
      <Button
        variant="rounded"
        className="h-16 w-16 bg-red-800 hover:bg-red-700"
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
