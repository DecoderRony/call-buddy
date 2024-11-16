import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const stunServers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

export const getRTCPeerConnection = () => {
  return new RTCPeerConnection(stunServers);
};

export const createDummyAudioTrack = () => {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator(); // Create an oscillator (tone generator)
  const destination = audioContext.createMediaStreamDestination(); // Create a destination for the audio
  oscillator.connect(destination); // Connect the oscillator to the destination
  oscillator.start(); // Start generating the silent signal
  oscillator.stop(audioContext.currentTime + 0.01); // Stop the oscillator immediately, creating a silent track
  return destination.stream.getAudioTracks()[0]; // Return the audio track from the destination stream
};

export const createDummyVideoTrack = () => {
  const canvas = document.createElement("canvas"); // Create a canvas element
  canvas.width = 640; // Set width
  canvas.height = 480; // Set height

  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "black"; // Set the color to black (you can change this if needed)
    context.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with the black color
  }

  const stream = canvas.captureStream(); // Capture the canvas as a video stream
  return stream.getVideoTracks()[0]; // Return the video track from the stream
};

export const createDummyMediaStream = () => {
  const dummyStream = new MediaStream();

  // Add the dummy audio and video tracks to the stream
  const dummyAudioTrack = createDummyAudioTrack();
  const dummyVideoTrack = createDummyVideoTrack();

  dummyStream.addTrack(dummyAudioTrack);
  dummyStream.addTrack(dummyVideoTrack);

  return dummyStream;
};

export const removeUndefinedFields = (obj: Record<string, any>) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ToastType =
  | "TITLE"
  | "TITLE_ERROR"
  | "DESCRIPTION"
  | "DESCRIPTION_ERROR"
  | "UNABLE_TO_CREATE_CALL"
  | "UNABLE_TO_JOIN_CALL"
  | "INVALID_CALL_ID"
  | "INVALID_CALL_LINK"
  | "CAMERA_ACCESS_DENIED"
  | "CAMERA_NOT_FOUND"
  | "MICROPHONE_ACCESS_DENIED"
  | "MICROPHONE_NOT_FOUND"
  | "PROVIDE_NAME";

export const getToast = (type?: ToastType, content?: string) => {
  switch (type) {
    case "TITLE":
      return {
        title: content ?? "",
      };
    case "TITLE_ERROR":
      return {
        title: content ?? "",
        isError: true,
      };
    case "DESCRIPTION":
      return {
        title: "Something went wrong",
        description: content,
      };
    case "DESCRIPTION_ERROR":
      return {
        title: "Something went wrong",
        description: content,
        isError: true,
      };
    case "UNABLE_TO_CREATE_CALL":
      return {
        title: "Error creating call",
        description:
          "Looks like something went wrong while creating a call for you. Please try again later.",
        isError: true,
      };
    case "UNABLE_TO_JOIN_CALL":
      return {
        title: "Something went wrong",
        description: content ?? "Unable to join call. Please try again later.",
        isError: true,
      };
    case "INVALID_CALL_ID":
      return {
        title: "Uh Oh!",
        description:
          "Looks like no call exists with this Call Id. Please check if you've got the Call Id right.",
        isError: true,
      };
    case "INVALID_CALL_LINK":
      return {
        title: "Uh Oh!",
        description:
          "Looks like no such call exists. Please make sure if you've got the correct link to the call.",
        isError: true,
      };
    case "CAMERA_ACCESS_DENIED":
      return {
        title: "Camera access denied",
        description:
          "Please provide camera access if you want others to see you in the call",
        isError: true,
      };
    case "CAMERA_NOT_FOUND":
      return {
        title: "No camera device found",
        description: "You won't be able to share your video in the call",
        isError: true,
      };
    case "MICROPHONE_ACCESS_DENIED":
      return {
        title: "Microphone access denied",
        description:
          "Please provide microphone access if you want to speak in the call",
        isError: true,
      };
    case "MICROPHONE_NOT_FOUND":
      return {
        title: "No microphone device found",
        description: "You won't be able to speak  in the call",
        isError: true,
      };
    case "PROVIDE_NAME":
      return {
        title: "Please provide a name",
        isError: true,
      };
    default:
      return {
        title: "Something went wrong",
        isError: true,
      };
  }
};
