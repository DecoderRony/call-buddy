import { useCallStore } from "@/lib/callStore";
import React, { useLayoutEffect, useState } from "react";
import Button from "../ui/Button";
import { MdNoiseAware, MdNoiseControlOff } from "react-icons/md";

function NoiseSupressionControl() {
  const audioStream = useCallStore((state) => state.audioStream);
  const [isNoiseSupActive, setIsNoiseSupActive] = useState(true);

  useLayoutEffect(() => {
    if (!audioStream?.getAudioTracks()[0]) return;

    const isNoiseSupActive = audioStream
      .getAudioTracks()[0]
      .getSettings().noiseSuppression;

    setIsNoiseSupActive(isNoiseSupActive || false);
  }, [audioStream]);

  const toggleNoiseSuppression = () => {
    if (!audioStream?.getAudioTracks()[0]) return;

    audioStream.getAudioTracks()[0].applyConstraints({
      noiseSuppression: !isNoiseSupActive,
    });
    setIsNoiseSupActive(!isNoiseSupActive);
  };

  const hasNoiseSuppression =
    navigator.mediaDevices.getSupportedConstraints().noiseSuppression;

  if (!audioStream || !hasNoiseSuppression) {
    return (
      <Button disabled variant="rounded" className="w-16 h-16 bg-zinc-500">
        <MdNoiseControlOff size={"1.3rem"} className="text-zinc-100" />
      </Button>
    );
  }

  return (
    <Button
      onClick={toggleNoiseSuppression}
      variant="rounded"
      className={
        isNoiseSupActive
          ? "w-16 h-16 bg-zinc-100 hover:bg-zinc-200"
          : "w-16 h-16 bg-zinc-800 hover:bg-zinc-600"
      }
    >
      {isNoiseSupActive ? (
        <MdNoiseAware size={"1.3rem"} className="text-zinc-800" />
      ) : (
        <MdNoiseControlOff size={"1.3rem"} />
      )}
    </Button>
  );
}

export default NoiseSupressionControl;
