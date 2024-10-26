import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CallInfo from "./CallInfo";
import callService from "@/lib/callService";
import { showToast } from "@/components/functions/Toast";
import CallStarterScreen from "./CallStarterScreen";
import CallRoomScreen from "./CallRoomScreen";
import { useCallStore } from "@/lib/callStore";
import Loading from "@/components/ui/Loading";
import { getToast } from "@/lib/utils";

function CallPage() {
  const navigate = useNavigate();
  const { callId } = useParams();

  const isInCall = useCallStore((state) => state.isInCall);
  const setParticipantName = useCallStore((state) => state.setParticipantName);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!callId) {
        showToast(getToast("UNABLE_TO_JOIN_CALL"));
        navigate("/");
        return;
      }

      try {
        const callExists = await callService.callExists(callId);
        if (callExists) {
          setLoading(false);
        } else {
          showToast(getToast("INVALID_CALL_LINK"));
          setLoading(false);
          navigate("/");
        }
      } catch (err) {
        showToast(getToast("UNABLE_TO_JOIN_CALL"));
        navigate("/");
      }
    };
    init();
    // window.addEventListener("beforeunload", cleanupOnUnload);

    return () => {
      console.log("Component unmounted. Leaving call");
      callService.endCall();
      // window.removeEventListener("beforeunload", cleanupOnUnload);
    };
  }, []);

  // const cleanupOnUnload = () => {
  //   console.log("cleaning up on unload");
  //   callService.endCall();
  // };

  const handleJoin = async (userName: string) => {
    try {
      if (!callId) {
        return;
      }

      setLoading(true);
      setTimeout(async () => {
        setParticipantName(userName);

        const callJoined = await callService.joinCall(callId);
        setLoading(false);

        if (callJoined.status === "error") {
          showToast(getToast("UNABLE_TO_JOIN_CALL", callJoined.message));
        }
      }, 1000);
    } catch (e) {
      showToast(getToast("UNABLE_TO_JOIN_CALL"));
      navigate("/");
    }
  };

  if (loading || !callId) {
    return <Loading />;
  }

  return (
    <div className="h-dvh flex flex-col px-5 py-8 relative">
      <CallInfo />
      {!isInCall ? (
        <CallStarterScreen handleJoin={handleJoin} />
      ) : (
        <CallRoomScreen />
      )}
    </div>
  );
}

export default CallPage;
