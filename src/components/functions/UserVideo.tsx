import React, { ReactNode, useEffect, useRef } from "react";
import { FaMicrophoneSlash, FaVideoSlash } from "react-icons/fa6";
import Video from "../ui/Video";

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

interface InfoIconProps {
  icon: ReactNode;
}

function InfoIcon({ icon }: Readonly<InfoIconProps>) {
  return (
    <div className="rounded-full bg-[rgba(0,0,0,0.4)] flex justify-center items-center p-2">
      {icon}
    </div>
  );
}

interface InfoTextProps {
  text: string;
}

function InfoText({ text }: Readonly<InfoTextProps>) {
  return (
    <div className="rounded-lg bg-[rgba(0,0,0,0.4)] flex justify-center items-center p-1 px-3">
      {text}
    </div>
  );
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
  ...rest
}: Readonly<UserVideoProps>) {
  const widthClass = width ? `w-[${width}px]` : "w-full";
  const heightClass = height ? `h-[${height}px]` : "h-full";

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

  return (
    <div
      className={
        `relative mx-auto container h-full rounded-lg overflow-hidden ${widthClass} ${heightClass} shadow-2xl ` +
        className
      }
    >
      {isCamEnabled ? (
        <Video stream={stream} className={videoClassName} />
      ) : (
        <div
          className={`h-full w-full flex justify-center items-center ${backgroundClass} `}
        >
          <div className="max-h-36 h-1/2 flex justify-center items-center aspect-square rounded-full bg-zinc-300">
            <div className="text-6xl font-semibold text-neutral-600">
              {getInitials(name)}
            </div>
          </div>
        </div>
      )}
      {(!isMicEnabled || !isCamEnabled) && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex justify-center items-center gap-1 sm:gap-3 max-sm:text-xs">
          {!isMicEnabled && <InfoIcon icon={<FaMicrophoneSlash />} />}
          {!isCamEnabled && <InfoIcon icon={<FaVideoSlash />} />}
        </div>
      )}
      {name && (
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 max-sm:text-xs">
          <InfoText text={name} />
        </div>
      )}
    </div>
  );
}

export default UserVideo;
