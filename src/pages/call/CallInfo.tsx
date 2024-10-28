import { MdContentCopy } from "react-icons/md";
import { useCallStore } from "../../lib/callStore";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { FaCheck } from "react-icons/fa6";

function CallInfo() {
  const callId = useCallStore((state) => state.callId);
  const callName = useCallStore((state) => state.callName);

  const [isIdCopied, setIsIdCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  if (!callId) {
    return null;
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(callId);
    setIsIdCopied(true);
    setTimeout(() => {
      setIsIdCopied(false);
    }, 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsLinkCopied(true);
    setTimeout(() => {
      setIsLinkCopied(false);
    }, 2000);
  };

  return (
    <div className="pl-0 sm:pl-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
      <span className="text-xl sm:text-3xl font-semibold">{callName}</span>
      <div className="border-neutral-500 border-b sm:border-r-2 sm:h-[70%]"></div>
      <div className="flex flex-row gap-3 sm:gap-5 justify-between">
        <div className="text-neutral-500 flex flex-col sm:w-full">
          <span className="text-sm sm:text-base font-semibold">{callId}</span>
          <span className="text-xs">
            Share this Id with your friends to invite them to the call
          </span>
        </div>
        <div className="flex gap-3">
          {/* copy button(rounded variant) for devices > sm */}
          <Button variant="rounded" onClick={handleCopyId} disabled={isIdCopied} className="block max-sm:hidden">
            {isIdCopied ? <FaCheck /> : <MdContentCopy />}
          </Button>

          {/* copy button(text variant) from sm devices */}
          <Button variant="text" onClick={handleCopyId} disabled={isIdCopied} className="block sm:hidden">
            {isIdCopied ? <FaCheck className="text-purple-500"/> : <MdContentCopy className="text-gray-500" />}
          </Button>

          {/* copy link button for devices > sm */}
          <Button
            className="rounded-full w-28 max-sm:hidden block"
            onClick={handleCopyLink}
            disabled={isLinkCopied}
          >
            {isLinkCopied ? "Copied!" : "Copy link"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CallInfo;
