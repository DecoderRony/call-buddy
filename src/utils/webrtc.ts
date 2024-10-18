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

const createDummyAudioTrack = () => {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator(); // Create an oscillator (tone generator)
  const destination = audioContext.createMediaStreamDestination(); // Create a destination for the audio
  oscillator.connect(destination); // Connect the oscillator to the destination
  oscillator.start(); // Start generating the silent signal
  oscillator.stop(audioContext.currentTime + 0.01); // Stop the oscillator immediately, creating a silent track
  return destination.stream.getAudioTracks()[0]; // Return the audio track from the destination stream
};

const createDummyVideoTrack = () => {
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
