import { MdContentCopy } from "react-icons/md";
import { useCallStore } from "../../lib/callStore";

function CallInfo() {
  const callId = useCallStore((state) => state.callId);

  return (
    <div className="pl-5 flex flex-col">
      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold">{callId}</span>
        <span className="text-sm text-gray-300 font-extralight cursor-pointer">
          <MdContentCopy />
        </span>
      </div>
      <span className="text-xs">
        Share this Id with your friends to invite them to the call
      </span>
    </div>
  );
}

export default CallInfo;
