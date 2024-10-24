import React, { ReactNode, useEffect, useRef } from "react";
import { FaMicrophoneSlash, FaVideoSlash } from "react-icons/fa6";

interface InfoIconProps {
  icon: ReactNode;
}

function InfoIcon({ icon }: Readonly<InfoIconProps>) {
  return (
    <div className="rounded-full bg-[rgba(0,0,0,0.4)] flex justify-center items-center p-2">
      {icon}
    </div>
  );
}

interface InfoTextProps {
  text: string;
}

function InfoText({ text }: Readonly<InfoTextProps>) {
  return (
    <div className="rounded-lg bg-[rgba(0,0,0,0.4)] flex justify-center items-center p-1 px-3">
      {text}
    </div>
  );
}

interface UserVideoProps extends React.HTMLAttributes<HTMLVideoElement> {
  name: string | null;
  stream: MediaStream | null;
  isMicEnabled: boolean;
  isCamEnabled: boolean;
  width?: number;
  height?: number;
  videoClassName?: string;
}

function UserVideo({
  name,
  stream,
  width,
  height,
  isMicEnabled,
  isCamEnabled,
  className,
  videoClassName,
  ...rest
}: Readonly<UserVideoProps>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const widthClass = width ? `w-[${width}px]` : "w-full";
  const heightClass = height ? `h-[${height}px]` : "h-full";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    console.log("stream", stream);
  }, [stream, isCamEnabled]);
  console.log("rerendering video");

  return (
    <div
      className={
        `relative mx-auto container bg-zinc-700 h-full rounded-md overflow-hidden ${widthClass} ${heightClass} ` +
        className
      }
    >
      {isCamEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          className={"h-full w-full object-cover " + videoClassName}
          {...rest}
        />
      ) : (
        <div className="h-full w-full bg-zinc-700" />
      )}
      {(!isMicEnabled || !isCamEnabled) && (
        <div className="absolute top-4 left-4 flex justify-center items-center gap-3">
          {!isMicEnabled && <InfoIcon icon={<FaMicrophoneSlash />} />}
          {!isCamEnabled && <InfoIcon icon={<FaVideoSlash />} />}
        </div>
      )}
      {name && (
        <div className="absolute bottom-4 left-4">
          <InfoText text={name} />
        </div>
      )}
    </div>
  );
}

export default UserVideo;
