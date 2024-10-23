import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useCallStore } from "../../lib/callStore";
import CallControl from "./CallControl";
import CallInfo from "./CallInfo";
import Video from "../../components/ui/Video";
import callService from "../../lib/callService";

function CallPage() {
  const { callId } = useParams();

  // Fetch gloal states and actions from store
  const joinedCall = useCallStore((state) => state.callId);
  const setJoinedCall = useCallStore((state) => state.setCallId);
  const participantId = useCallStore((state) => state.participantId);
  const participants = useCallStore((state) => state.participants);
  const localStream = useCallStore((state) => state.localStream);
  const isMicEnabled = useCallStore((state) => state.isMicEnabled);
  const isCamEnabled = useCallStore((state) => state.isCamEnabled);
  const setHasMediaAccess = useCallStore((state) => state.setHasMediaAccess);

  // UI states
  const [loading, setLoading] = useState(false);

  const parentVideoContainerRef = useRef<HTMLDivElement>(null);
  let videoHeight = 0;
  let videoWidth = 0;

  console.log("rendering");
  console.log("participants", participants);

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      callService.updateLocalStream(stream);
      callService.setIsMicEnabled(true);
      callService.setIsCamEnabled(true);
      setHasMediaAccess(true);
    } catch (error) {
      console.log("Could not get media access", error);
    }
  };

  // const cleanupOnUnload = () => {
  //   console.log("cleaning up on unload");
  //   callService.endCall();
  // };

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
            setJoinedCall(callId);
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

  useEffect(() => {
    if (!localStream && participantId) {
      getLocalStream();
    }
  }, [participantId]);

  let gridClasses;
  if (Object.keys(participants).length === 1) {
    gridClasses = "grid grid-cols-1 grid-rows-1";
  } else if (Object.keys(participants).length === 2) {
    gridClasses = "grid grid-cols-2 grid-rows-1";
  } else {
    const rows = Math.ceil(Object.keys(participants).length / 2);
    gridClasses = `grid grid-cols-2 grid-rows-[${rows}]`;
    if (parentVideoContainerRef.current?.offsetWidth) {
      videoWidth = parentVideoContainerRef.current?.offsetWidth / 2;
    }

    if (parentVideoContainerRef.current?.offsetHeight) {
      // calculating container height wrt to (total container height - (number of rows * gap space))
      const containerHeight =
        parentVideoContainerRef.current.offsetHeight -
        (rows < 1 ? 0 : rows - 1) * 12;
      videoHeight = containerHeight / rows;
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-dvh flex flex-col p-5 relative">
      <CallInfo />

      <div className="h-full overflow-hidden">
        <div
          ref={parentVideoContainerRef}
          className={"h-full pt-8 pb-3 px-16 gap-3 " + gridClasses}
        >
          {Object.keys(participants).map((participantId) => (
            <Video
              stream={participants[participantId].stream}
              key={participantId}
              height={videoHeight}
              width={videoWidth}
              isMicEnabled={participants[participantId].isMicEnabled}
              isCamEnabled={participants[participantId].isCamEnabled}
            />
          ))}
        </div>

        <div className="absolute h-[30%] w-[25%] bottom-5 right-5">
          <Video
            stream={localStream}
            isMicEnabled={isMicEnabled}
            isCamEnabled={isCamEnabled}
          />
        </div>

        <div className="absolute h-12 w-full bottom-16 left-0">
          <CallControl />
        </div>
      </div>
    </div>
  );
}

export default CallPage;
