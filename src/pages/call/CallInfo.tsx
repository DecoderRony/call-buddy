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
    <div className="pl-5 flex items-center justify-between md:justify-start gap-5">
      <span className="text-3xl font-semibold">{callName}</span>
      <div className="hidden md:block border-neutral-500 border-r-2 h-full"></div>
      <div className="hidden md:flex flex-col text-neutral-500">
        <span className="text-base font-semibold">{callId}</span>
        <span className="text-xs">
          Share this Id with your friends to invite them to the call
        </span>
      </div>
      <div className="hidden md:flex gap-3">
        <Button variant="rounded" onClick={handleCopyId} disabled={isIdCopied}>
          {isIdCopied ? <FaCheck /> : <MdContentCopy />}
        </Button>
        <Button
          className="rounded-full w-28"
          onClick={handleCopyLink}
          disabled={isLinkCopied}
        >
          {isLinkCopied ? "Copied!" : "Copy link"}
        </Button>
      </div>
      <div className="flex md:hidden gap-3 pr-5">
        <Button variant="rounded" onClick={handleCopyLink} disabled={isLinkCopied}>
          {isLinkCopied ? <FaCheck /> : <MdContentCopy />}
        </Button>
      </div>
    </div>
  );
}

export default CallInfo;
