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

  const [combinedStream, setCombinedStream] = useState<MediaStream>();
  const [containerRect, setContainerRect] = useState<ContainerRect>();
  const [videoHeightStyle, setVideoHeightStyle] = useState<any>();
  const [videoWidthStyle, setVideoWidthStyle] = useState<any>();

  const adjustVideoSize = (videoWidth: number, videoHeight: number) => {
    if (!containerRect) {
      return;
    }

    // adjust size based on stream and container aspect
    const videoAspect = videoWidth / videoHeight;
    const containerAspect = containerRect.width / containerRect.height;

    if (videoAspect > containerAspect) {
      // Video is wider than container - set height to match container
      setVideoHeightStyle(containerRect.height);
      setVideoWidthStyle("auto");
    } else {
      // Video is taller than container - set width to match container
      setVideoHeightStyle("auto");
      setVideoWidthStyle(containerRect.width);
    }
  };

  const handleVideoResize = () => {
    adjustVideoSize(
      videoRef.current?.videoWidth ?? 0,
      videoRef.current?.videoHeight ?? 0
    );
  };

  const handleContainerResize = (entries: ResizeObserverEntry[]) => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      setContainerRect({
        width: width,
        height: height,
      });
    }
  };

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
    const resizeObserver = new ResizeObserver(handleContainerResize);
    if (videoContainerRef.current) {
      resizeObserver.observe(videoContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    if (stream) {
      setCombinedStream(stream);
    } else {
      const stream = new MediaStream();
      if (audioStream) stream.addTrack(audioStream.getAudioTracks()[0]);
      if (videoStream) stream.addTrack(videoStream.getVideoTracks()[0]);
      setCombinedStream(stream);
    }
  }, [audioStream, videoStream, stream]);

  useLayoutEffect(() => {
    if (videoRef.current && combinedStream) {
      adjustVideoSize(
        videoRef.current.videoWidth,
        videoRef.current.videoHeight
      );
      videoRef.current.srcObject = combinedStream;
    }
  }, [containerRect, combinedStream]);

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
        onResize={handleVideoResize}
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
