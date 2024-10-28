import CamControl from "@/components/functions/CamControl";
import MicControl from "@/components/functions/MicControl";
import { FaPhoneSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import callService from "../../lib/callService";
import { useState } from "react";
import Loading from "@/components/ui/Loading";

function CallControl() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <Loading text="Leaving call" />
  }

  return (
    <div className="flex justify-center gap-4">
      <MicControl />
      <CamControl />

      {/* End call control */}
      <Button
        variant="rounded"
        className="h-16 w-16 bg-red-800 hover:bg-red-700"
        onClick={() => {
          setLoading(true);
          setTimeout(() => {
            navigate("/");
            callService.endCall();
            setLoading(false);
          }, 1000);
        }}
      >
        <FaPhoneSlash />
      </Button>
    </div>
  );
}

export default CallControl;
