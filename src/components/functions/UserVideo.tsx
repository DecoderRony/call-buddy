import React, { ReactNode } from "react";
import { FaMicrophoneSlash, FaVideoSlash } from "react-icons/fa6";
import Video from "../ui/Video";
import Audio from "../ui/Audio";
import InfoIcon from "../ui/InfoIcon";
import InfoText from "../ui/InfoText";

function getInitials(name: string | null) {
  if (!name) return "";
  const words = name.split(" ");
  if (words.length > 2) words.splice(2, words.length - 2);

  let initials = "";
  for (const word of words) {
    initials += word.charAt(0).toUpperCase();
  }
  return initials;
}

interface UserOneStreamProps extends React.HTMLAttributes<HTMLVideoElement> {
  stream: MediaStream | null;
}

interface UserTwoStreamProps extends React.HTMLAttributes<HTMLVideoElement> {
  audioStream: MediaStream | null;
  videoStream: MediaStream | null;
}

interface UserVideoOtherProps {
  name: string | null;
  isMicEnabled: boolean;
  isCamEnabled: boolean;
  width?: number;
  height?: number;
  videoClassName?: string;
  backgroundColor?: "lighter" | "light" | "dark" | "darker";
  optionsComponent?: ReactNode;
  muted?: boolean;
}

type UserVideoProps =
  | (UserOneStreamProps & UserVideoOtherProps)
  | (UserTwoStreamProps & UserVideoOtherProps);

function UserVideo({
  name,
  width,
  height,
  isMicEnabled,
  isCamEnabled,
  className,
  backgroundColor,
  videoClassName,
  optionsComponent,
  muted = false,
  ...rest
}: Readonly<UserVideoProps>) {
  let stream: MediaStream | null;
  if ("stream" in rest && rest.stream) {
    stream = rest.stream;
  } else {
    stream = new MediaStream();
    if ("audioStream" in rest && rest.audioStream) {
      stream.addTrack(rest.audioStream.getAudioTracks()[0]);
    }
    if ("videoStream" in rest && rest.videoStream) {
      stream.addTrack(rest.videoStream.getVideoTracks()[0]);
    }
  }

  const backgroundClass = {
    lighter: "bg-zinc-600",
    light: "bg-zinc-700",
    dark: "bg-gray-700",
    darker: "bg-neutral-800",
  }[backgroundColor ?? "lighter"];

  console.log("rerendering user video");
  return (
    <div
      className={
        `relative mx-auto container w-full h-full rounded-lg overflow-hidden shadow-2xl ` +
        className
      }
    >
      {isCamEnabled ? (
        <Video
          stream={stream}
          className={videoClassName}
          width={width}
          height={height}
          muted={muted}
        />
      ) : (
        <div
          className={`h-full w-full flex justify-center items-center ${backgroundClass} `}
        >
          <div className="max-h-36 h-2/5 md:h-1/2 flex justify-center items-center aspect-square rounded-full bg-zinc-300">
            <div className="text-[300%] font-semibold text-neutral-600">
              {getInitials(name)}
            </div>
          </div>
          {isMicEnabled && <Audio stream={stream} muted={muted} />}
        </div>
      )}
      {(!isMicEnabled || !isCamEnabled) && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex justify-center items-center gap-1 sm:gap-3 max-sm:text-xs">
          {!isMicEnabled && <InfoIcon icon={<FaMicrophoneSlash />} />}
          {!isCamEnabled && <InfoIcon icon={<FaVideoSlash />} />}
        </div>
      )}
      {name && (
        <div className="absolute bottom-2 left-2 max-w-[85%] sm:bottom-4 sm:left-4 max-sm:text-xs">
          <InfoText text={name} />
        </div>
      )}
      {optionsComponent && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          {optionsComponent}
        </div>
      )}
    </div>
  );
}

export default UserVideo;
