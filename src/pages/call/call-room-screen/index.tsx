import CallControl from "./CallControl";
import ParticipantsVideos from "./ParticipantsVideos";
import SelfVideo from "./SelfVideo";

function CallRoomScreen() {
  return (
    <div className="h-full overflow-hidden">
      <ParticipantsVideos />
      <SelfVideo />
      <div className="absolute h-auto w-full bottom-16 left-0">
        <CallControl />
      </div>
    </div>
  );
}

export default CallRoomScreen;
