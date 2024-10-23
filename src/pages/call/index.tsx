import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import callService from "../../lib/callService";
import { useCallStore } from "../../lib/callStore";
import CallControl from "./CallControl";
import CallInfo from "./CallInfo";
import ParticipantsVideos from "./ParticipantsVideos";
import SelfVideo from "./SelfVideo";

function CallPage() {
  const { callId } = useParams();
  const joinedCall = useCallStore((state) => state.callId);
  const [loading, setLoading] = useState(false);

  // Initialize call.
  // This page should join call with the callId in URL param
  useEffect(() => {
    const init = async () => {
      // join call
      if (callId) {
        if (joinedCall) {
          // TODO: Handle UI
          console.log("Already in a call. Cannot join another call");
          return;
        }

        try {
          if (await callService.callExists(callId)) {
            callService.joinCall(callId);
          } else {
            // TODO: Handle UI
            console.log("Call with given callId does not exist");
          }
        } catch (err) {
          // TODO: Handle UI
          console.log("Error joining call. Please try again later", err);
        }
      }
    };

    init();
    // window.addEventListener("beforeunload", cleanupOnUnload);

    return () => {
      console.log("unmounting");
      callService.endCall();
      // window.removeEventListener("beforeunload", cleanupOnUnload);
    };
  }, []);

  // const cleanupOnUnload = () => {
  //   console.log("cleaning up on unload");
  //   callService.endCall();
  // };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-dvh flex flex-col p-5 relative">
      <CallInfo />
      <div className="h-full overflow-hidden">
        <ParticipantsVideos />
        <SelfVideo />
        <div className="absolute h-auto w-full bottom-16 left-0">
          <CallControl />
        </div>
      </div>
    </div>
  );
}

export default CallPage;
