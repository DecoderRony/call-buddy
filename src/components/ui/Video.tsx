import React, { useEffect, useRef } from "react";

interface VideoProps extends React.HTMLAttributes<HTMLVideoElement> {
  audioStream: MediaStream | null;
  videoStream: MediaStream | null;
  width?: number;
  height?: number;
  videoClassName?: string;
}

function Video({
  audioStream,
  videoStream,
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
      const stream = new MediaStream();
      if (audioStream) stream.addTrack(audioStream.getAudioTracks()[0]);
      if (videoStream) stream.addTrack(videoStream.getVideoTracks()[0]);
      videoRef.current.srcObject = stream;
    }
  }, [audioStream, videoStream]);

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
