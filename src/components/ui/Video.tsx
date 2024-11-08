import { isMobileBrowser } from "@/lib/utils";
import React, { useLayoutEffect, useRef, useState } from "react";

interface ContainerRect {
  width: number;
  height: number;
  top?: number;
  left?: number;
}

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

  const [containerRect, setContainerRect] = useState<ContainerRect>();
  const [videoHeightStyle, setVideoHeightStyle] = useState<any>();
  const [videoWidthStyle, setVideoWidthStyle] = useState<any>();

  const adjustVideoSize = (stream: MediaStream) => {
    if (!videoRef.current || !containerRect) {
      return;
    }

    const { width: videoWidth, height: videoHeight } = stream
      .getVideoTracks()[0]
      .getSettings();

    // If stream details not available
    if (!videoWidth || !videoHeight) {
      // potrait stream
      if (isMobileBrowser()) {
        setVideoHeightStyle("auto");
        setVideoWidthStyle(containerRect.width);
      }
      // landscape stream
      else {
        setVideoHeightStyle(containerRect.height);
        setVideoWidthStyle("auto");
      }
    }
    // adjust size based on stream and container aspect
    else {
      const videoAspect = videoWidth / videoHeight;
      const containerAspect = containerRect.width / containerRect.height;

      // Video is wider than container - set height to match container
      if (videoAspect > containerAspect) {
        setVideoHeightStyle(containerRect.height);
        setVideoWidthStyle("auto");
      }
      // Video is taller than container - set width to match container
      else {
        setVideoHeightStyle("auto");
        setVideoWidthStyle(containerRect.width);
      }
    }
  };

  useLayoutEffect(() => {
    if (videoRef.current) {
      let combinedStream: MediaStream;
      if (stream) {
        combinedStream = stream;
      } else {
        const stream = new MediaStream();
        if (audioStream) stream.addTrack(audioStream.getAudioTracks()[0]);
        if (videoStream) stream.addTrack(videoStream.getVideoTracks()[0]);
        combinedStream = stream;
      }

      adjustVideoSize(combinedStream);
      videoRef.current.srcObject = combinedStream;
    }
  }, [audioStream, videoStream, stream]);

  useLayoutEffect(() => {
    // If height and width given use it
    if (height && width) {
      setContainerRect({
        width: width,
        height: height,
      });
      return;
    }

    // Find out height and width
    if (videoContainerRef.current) {
      const { width: containerWidth, height: containerHeight } =
        videoContainerRef.current.getBoundingClientRect();
      setContainerRect({
        width: containerWidth,
        height: containerHeight,
      });
    }
  }, []);

  return (
    <div
      ref={videoContainerRef}
      style={{
        height: height ?? "100%",
        width: width ?? "auto",
      }}
      className={
        `relative mx-auto container bg-black rounded-lg overflow-hidden flex justify-center items-center ` +
        className
      }
    >
      <video
        ref={videoRef}
        playsInline
        autoPlay
        style={{
          height: videoHeightStyle,
          width: videoWidthStyle,
        }}
        className={`object-cover ${videoClassName}`}
        {...rest}
      />
    </div>
  );
}

export default Video;
