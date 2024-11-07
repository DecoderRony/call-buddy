import React, { useEffect, useRef, useState } from "react";

interface VideoProps extends React.HTMLAttributes<HTMLVideoElement> {
  stream?: MediaStream | null;
  audioStream?: MediaStream | null;
  videoStream?: MediaStream | null;
  width?: number;
  height?: number;
  videoClassName?: string;
}

function Video({
  stream,
  audioStream,
  videoStream,
  width,
  height,
  className,
  videoClassName,
  ...rest
}: Readonly<VideoProps>) {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSizeClass, setVideoSizeClass] = useState("");

  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
      } else {
        const stream = new MediaStream();
        if (audioStream) stream.addTrack(audioStream.getAudioTracks()[0]);
        if (videoStream) stream.addTrack(videoStream.getVideoTracks()[0]);
        videoRef.current.srcObject = stream;
      }
    }
  }, [audioStream, videoStream, stream]);

  useEffect(() => {
    const adjustVideoSize = () => {
      if (!videoRef.current || !videoContainerRef.current) {
        return;
      }

      const videoAspect =
        videoRef.current.videoWidth / videoRef.current.videoHeight;
      const containerAspect =
        videoContainerRef.current.clientWidth /
        videoContainerRef.current.clientHeight;

      // Video is wider than container - set height to match container
      if (videoAspect > containerAspect) {
        setVideoSizeClass("w-auto h-full");
      }
      // Video is taller than container - set width to match container
      else {
        setVideoSizeClass("w-full h-auto");
      }
    };

    if (videoContainerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === videoContainerRef.current) {
            adjustVideoSize();
          }
        }
      });

      resizeObserver.observe(videoContainerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  const widthClass = width ? `max-w-[${width}px]` : "w-full";
  const heightClass = height ? `max-h-[${height}px]` : "h-full";

  return (
    <div
      ref={videoContainerRef}
      className={
        `relative mx-auto container bg-black h-full rounded-md overflow-hidden ${widthClass} ${heightClass} flex justify-center items-center ` +
        className
      }
    >
      <video
        ref={videoRef}
        playsInline
        autoPlay
        className={`w-auto object-cover ${videoSizeClass} ${videoClassName}`}
        {...rest}
      />
    </div>
  );
}

export default Video;
