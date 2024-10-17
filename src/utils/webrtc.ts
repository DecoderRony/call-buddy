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