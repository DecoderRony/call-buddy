import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CallInfo from "./CallInfo";
import callService from "@/lib/callService";
import { showToast } from "@/components/functions/Toast";
import CallStarterScreen from "./CallStarterScreen";
import CallRoomScreen from "./CallRoomScreen";
import { useCallStore } from "@/lib/callStore";
import Loading from "@/components/ui/Loading";

function CallPage() {
  const navigate = useNavigate();
  const { callId } = useParams();

  const setParticipantName = useCallStore((state) => state.setParticipantName);
  const [callExists, setCallExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isInCall, setIsInCall] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!callId) {
        showToast({
          title: "Error joining call",
          description:
            "Looks like something went wrong. Please try again later.",
          isError: true,
        });
        navigate("/");
        return;
      }

      try {
        const callExists = await callService.callExists(callId);
        if (callExists) {
          setCallExists(true);
          setLoading(false);
        } else {
          showToast({
            title: "Uh Oh!",
            description:
              "Looks like no such call exists. Please make sure if you've got the correct link to the call.",
            isError: true,
          });
          setLoading(false);
          navigate("/");
        }
      } catch (err) {
        showToast({
          title: "Error joining call",
          description:
            "Looks like something went wrong. Please try again later.",
          isError: true,
        });
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
        await callService.joinCall(callId);
        setIsInCall(true);
        setLoading(false);
      }, 1000);
    } catch (e) {
      showToast({
        title: "Error joining call",
        description: "Looks like something went wrong. Please try again later.",
        isError: true,
      });
      navigate("/");
    }
  };

  if (loading || !callId) {
    return <Loading />;
  }

  return (
    <div className="h-dvh flex flex-col p-5 relative">
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
