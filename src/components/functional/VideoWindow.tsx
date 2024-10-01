import { useRef } from "react";

interface VideoWindowProps {
  src: MediaStream | null;
}

function VideoWindow({ src }: Readonly<VideoWindowProps>) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (videoRef.current) {
    videoRef.current.srcObject = src;
  }

  return (
    <div className="">
      <video
        ref={videoRef}
        className="h-full w-full bg-black rounded-lg"
        muted
        autoPlay
      />
    </div>
  );
}

export default VideoWindow;
