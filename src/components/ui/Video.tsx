import React, {
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { useResizeDetector } from "react-resize-detector";

interface VideoProps extends React.HTMLAttributes<HTMLVideoElement> {
  stream?: MediaStream | null;
  audioStream?: MediaStream | null;
  videoStream?: MediaStream | null;
  width?: number;
  height?: number;
  videoClassName?: string;
  muted?: boolean;
}

function Video({
  stream,
  audioStream,
  videoStream,
  width,
  height,
  className,
  videoClassName,
  muted = false,
  ...rest
}: Readonly<VideoProps>) {
  const { ref: videoContainerRef } = useResizeDetector({
    refreshMode: "debounce",
    refreshRate: 200,
    onResize: () => {
      adjustVideoSize();
    },
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoHeightStyle, setVideoHeightStyle] = useState<any>();
  const [videoWidthStyle, setVideoWidthStyle] = useState<any>();

  const adjustVideoSize = () => {
    const containerRect = videoContainerRef.current?.getBoundingClientRect();
    if (!videoRef.current || !containerRect) {
      return;
    }

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;

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

  useLayoutEffect(() => {
    // set muted
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.defaultMuted = muted;
    }
  }, []);

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

      adjustVideoSize();
      videoRef.current.srcObject = combinedStream;
    }
  }, [audioStream, videoStream, stream]);

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
        onResize={() => adjustVideoSize()}
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
