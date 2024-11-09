import CamControl from "@/components/functions/CamControl";
import MicControl from "@/components/functions/MicControl";
import Video from "@/components/ui/Video";
import { useCallStore } from "@/lib/callStore";
import { useLayoutEffect, useRef, useState } from "react";

interface ContainerRect {
  width: number;
  height: number;
  top: number;
  left: number;
}

function SelfVideoPreview() {
  const audioStream = useCallStore((state) => state.audioStream);
  const videoStream = useCallStore((state) => state.videoStream);
  const isCamEnabled = useCallStore((state) => state.isCamEnabled);

  const [containerRect, setContainerRect] = useState<ContainerRect>();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContainerResize = (entries: ResizeObserverEntry[]) => {
    for (let entry of entries) {
      const { width, height, top, left } = entry.contentRect;
      setContainerRect({ width, height, top, left });
    }
  };

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(handleContainerResize);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <Video
        audioStream={audioStream}
        videoStream={videoStream}
        height={containerRect?.height}
        width={containerRect?.width}
      />
      <div
        style={{ height: containerRect?.height, width: containerRect?.width }}
        className="absolute top-0 left-0 flex justify-center items-center text-center"
      >
        {!videoStream && (
          <span className="w-3/5 font-semibold">
            Please provide Camera access if you want others to see you in the
            call
          </span>
        )}
        {videoStream && !isCamEnabled && (
          <span className="w-4/5 font-semibold">Camera is turned off</span>
        )}
      </div>
      <div className="absolute w-full flex justify-center bottom-8 gap-6">
        <MicControl />
        <CamControl />
      </div>
    </div>
  );
}

export default SelfVideoPreview;
