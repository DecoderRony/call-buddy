import { showToast } from "@/components/functions/Toast";
import Loading from "@/components/ui/Loading";
import callService from "@/lib/callService";
import { useCallStore } from "@/lib/callStore";
import { getToast } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CallInfo from "./CallInfo";
import CallRoomScreen from "./CallRoomScreen";
import CallStarterScreen from "./CallStarterScreen";

function CallPage() {
  const navigate = useNavigate();
  const { callId } = useParams();

  const isInCall = useCallStore((state) => state.isInCall);
  const setParticipantName = useCallStore((state) => state.setParticipantName);

  const [loading, setLoading] = useState(true);
  const [callExists, setCallExists] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!callId) {
        showToast(getToast("UNABLE_TO_JOIN_CALL"));
        navigate("/");
        return;
      }

      try {
        const isCallExists = await callService.callExists(callId);
        if (isCallExists) {
          setTimeout(async () => {
            setLoading(false);
            setCallExists(true);
          }, 1000);
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

  if (loading && callExists) {
    return <Loading text="Joining call" />;
  }

  if (loading) {
    return <Loading text="Please wait. Getting call details" />;
  }

  return (
    <div className="h-dvh flex flex-col px-3 sm:px-5 py-8 relative">
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
