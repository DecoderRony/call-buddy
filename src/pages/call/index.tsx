import { showToast } from "@/components/functions/Toast";
import Loading from "@/components/ui/Loading";
import callService from "@/lib/callService";
import { useCallStore } from "@/lib/callStore";
import { getToast } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CallInfo from "./CallInfo";
import CallRoomScreen from "./call-room-screen";
import CallStarterScreen from "./call-starter-screen";
import logger from "@/lib/loggerService";
import Button from "@/components/ui/Button";

function CallPage() {
  const navigate = useNavigate();
  const { callId } = useParams();

  const isInCall = useCallStore((state) => state.isInCall);
  const setParticipantName = useCallStore((state) => state.setParticipantName);

  const [loading, setLoading] = useState(true);
  const [callExists, setCallExists] = useState(false);
  const [userLeaving, setUserLeaving] = useState(false);
  const [userNameBackup, setUserNameBackup] = useState<string>(); // required for call rejoin

  const setupCall = async () => {
    try {
      if (!callId) {
        return;
      }

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

  useEffect(() => {
    const init = async () => {
      if (!callId) {
        showToast(getToast("UNABLE_TO_JOIN_CALL"));
        navigate("/");
        return;
      }
      setupCall();
    };

    init();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      logger.debug("Call page component unmounted. Leaving call");
      callService.endCall();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    logger.debug("cleaning up on unload");
    e.preventDefault();

    const inCall = useCallStore.getState().isInCall;
    if (inCall) {
      callService.endCall();
      setUserLeaving(true);
    }
    return "";
  };

  const handleJoin = async (userName: string) => {
    try {
      if (!callId) {
        showToast(getToast("UNABLE_TO_JOIN_CALL"));
        navigate("/");
        return;
      }

      setLoading(true);
      setUserNameBackup(userName);
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

  if (userLeaving) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-center">
          It looks like you left the call.
        </p>
        <Button
          onClick={() => {
            setUserLeaving(false);
            if (userNameBackup) {
              setupCall();
              handleJoin(userNameBackup);
            } else {
              navigate("/");
            }
          }}
        >
          Rejoin
        </Button>
      </div>
    );
  }

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
