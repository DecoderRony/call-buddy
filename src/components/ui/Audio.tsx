import React, { useLayoutEffect, useRef } from "react";

interface AudioProps extends React.HTMLAttributes<HTMLAudioElement> {
  stream?: MediaStream | null;
  audioClassName?: string;
  muted?: boolean;
}

function Audio({
  stream,
  className,
  audioClassName,
  muted = false,
  ...rest
}: Readonly<AudioProps>) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useLayoutEffect(() => {
    // set muted
    if (audioRef.current) {
      audioRef.current.muted = muted;
      audioRef.current.defaultMuted = muted;
    }
  }, [muted]);

  useLayoutEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      className={`hidden ${audioClassName}`}
      {...rest}
    />
  );
}

export default Audio;
