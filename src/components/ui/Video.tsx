import React, { ReactElement, ReactNode, useEffect, useRef } from "react";
import { FaMicrophoneSlash, FaVideoSlash } from "react-icons/fa6";

interface VideoProps extends React.HTMLAttributes<HTMLVideoElement> {
  stream: MediaStream | null;
  isMicEnabled: boolean;
  isCamEnabled: boolean;
  width?: number;
  height?: number;
  videoClassName?: string;
}

interface InfoIconProps {
  icon: ReactNode;
}

function InfoIcon({ icon }: Readonly<InfoIconProps>) {
  return (
    <div className="rounded-full bg-[rgba(255,255,255,0.3)] flex justify-center items-center p-2">
      {icon}
    </div>
  );
}

function Video({
  stream,
  width,
  height,
  isMicEnabled,
  isCamEnabled,
  className,
  videoClassName,
  ...rest
}: Readonly<VideoProps>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const widthClass = width ? `w-[${width}px]` : "w-full";
  const heightClass = height ? `h-[${height}px]` : "h-full";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={
        `relative mx-auto container bg-zinc-700 h-full rounded-md overflow-hidden ${widthClass} ${heightClass} ` +
        className
      }
    >
      <video
        ref={videoRef}
        autoPlay
        className={"h-full w-full object-cover " + videoClassName}
        {...rest}
      />
      {(!isMicEnabled || !isCamEnabled) && (
        <div className="absolute top-4 left-4 flex justify-center items-center gap-3">
          {!isMicEnabled && <InfoIcon icon={<FaMicrophoneSlash />} />}
          {!isCamEnabled && <InfoIcon icon={<FaVideoSlash />} />}
        </div>
      )}
    </div>
  );
}

export default Video;
