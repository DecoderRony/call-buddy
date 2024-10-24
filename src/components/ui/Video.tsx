import React, { useEffect, useRef } from "react";

interface VideoProps extends React.HTMLAttributes<HTMLVideoElement> {
  stream: MediaStream | null;
  width?: number;
  height?: number;
  videoClassName?: string;
}

function Video({
  stream,
  width,
  height,
  className,
  videoClassName,
  ...rest
}: Readonly<VideoProps>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const widthClass = width ? `max-w-[${width}px]` : "w-full";
  const heightClass = height ? `max-h-[${height}px]` : "h-full";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={
        `relative mx-auto container bg-zinc-700 h-full rounded-md overflow-hidden ${widthClass} ${heightClass} flex justify-center items-center ` +
        className
      }
    >
      <video
        ref={videoRef}
        autoPlay
        className={"h-full w-full object-cover " + videoClassName}
        {...rest}
      />
    </div>
  );
}

export default Video;
