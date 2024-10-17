import {
  DocumentSnapshot,
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { firestore } from "../config/firebase";
import { peerConnection } from "../config/store";
import {FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash} from "react-icons/fa6";
import Button from "../components/ui/Button";

function CallPage() {
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [callInput, setCallInput] = useState<string>("");
  const [isMicEnable, setIsMicEnable] = useState(true);
  const [isCamEnable, setIsCamEnable] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const pushLocalStreamToConnection = () => {
    // push tracks from local stream to peer connection
    if (localStream) {
      console.log("local stream available", localStream);
      localStream.getTracks().forEach((track) => {
        console.log("adding tracks to connection", track);
        peerConnection.addTrack(track, localStream);
      });
    }
  };

  // Setup peer connection, add listener for remote stream
  useEffect(() => {
    // pull tracks from remote stream, add to video stream
    peerConnection.ontrack = (event) => {
      console.log("Recieved stream from network", event);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setRemoteStream(event.streams[0]);
    };

    console.log("Connection setup successfull", peerConnection);
  }, []);

  const getMediaStreams = async () => {
    try {
      // set local stream from device input
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // set new remote stream
      const newRemoteStream = new MediaStream();
      setRemoteStream(newRemoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = newRemoteStream;
      }
    } catch (err) {
      console.error("Could not get media streams", err);
    }
  };

  const createCall = async () => {
    pushLocalStreamToConnection();

    // Reference firestore collection
    const callDocument = await addDoc(collection(firestore, "calls"), {});
    const answerCandidates = collection(callDocument, "answerCandidates");
    const offerCandidates = collection(callDocument, "offerCandidates");

    // Add reference in call field
    setCallInput(callDocument.id);

    // Get candidates for caller, save to db
    peerConnection.onicecandidate = (event) => {
      console.log("adding offer candidate", event.candidate);
      if (event.candidate) {
        addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    // Create offer, save to db
    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);
    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
    await updateDoc(callDocument, { offer });

    // Listen for remote answer
    onSnapshot(
      callDocument,
      async (snapshot: DocumentSnapshot): Promise<void> => {
        const data = snapshot.data();
        if (!peerConnection.currentRemoteDescription && data?.answer) {
          const answerDescription = data.answer;
          console.log(
            "Found answer on call. Setting remote connection",
            data,
            answerDescription
          );
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answerDescription)
          );
          console.log("remote stream", remoteStream);
        }
      }
    );

    // When answered, add candidates to peer connection
    onSnapshot(answerCandidates, (snapshot) => {
      console.log(
        "Recieved changes in answer candidate. Setting ice candidates in peer connection"
      );
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("adding ice candidate", change.doc.data());
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(candidate);
        }
      });
    });
  };

  const answerCall = async () => {
    pushLocalStreamToConnection();

    // listen to call document
    const callId = callInput;
    const callDocument = doc(firestore, "calls", callId);
    const answerCandidates = collection(callDocument, "answerCandidates");
    const offerCandidates = collection(callDocument, "offerCandidates");

    // Get candidates for callee, save to db
    peerConnection.onicecandidate = (event) => {
      console.log("adding answer candidate", event.candidate);
      if (event.candidate) {
        addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    // Get call data
    const callData = (await getDoc(callDocument)).data();

    if (callData?.offer) {
      // Set remote description to offer description
      const offerDescription = callData.offer;
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offerDescription)
      );

      // Create answer
      const answerDescription = await peerConnection.createAnswer();
      peerConnection.setLocalDescription(answerDescription);

      const answer = {
        sdp: answerDescription.sdp,
        type: answerDescription.type,
      };
      await updateDoc(callDocument, { answer });

      // After answering, add candidates to peer connections
      onSnapshot(offerCandidates, (snapshot) => {
        console.log(
          "Recieved changes in offer candidate. Setting ice candidates in peer connection"
        );
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            console.log("adding ice candidate", change.doc.data());
            const candidate = new RTCIceCandidate(change.doc.data());
            peerConnection.addIceCandidate(candidate);
          }
        });
      });
    }
  };

  return <div className="h-dvh relative">
    <div className="h-full">
      <div className="h-[90%] py-3">
        <div className="bg-zinc-700 h-full mx-36 rounded-md">
          client video
        </div>
      </div>

      <div className="w-[40%] h-[30%] absolute py-3 bottom-[12%] right-[1%]">
        <div className="bg-zinc-500 h-full mx-36 rounded-md">
          client video
        </div>
      </div>

      <div className="h-[10%] flex justify-center py-3">
        <Button onClick={() => setIsMicEnable((prev) => !prev)} variant="rounded" className={isMicEnable ? 'bg-zinc-800 hover:bg-zinc-600' : 'bg-red-100 hover:bg-red-200'}>
          {isMicEnable ? <FaMicrophone /> : <FaMicrophoneSlash className="text-red-800" />}
        </Button>

        <Button onClick={() => setIsCamEnable((prev) => !prev)} variant="rounded" className={`ml-2 ${isCamEnable ? 'bg-zinc-800 hover:bg-zinc-600' : 'bg-red-100 hover:bg-red-200'}`}>
          {isCamEnable ? <FaVideo /> : <FaVideoSlash className="text-red-800" />}
        </Button>

        <Button className="ml-2 rounded-3xl bg-red-800 hover:bg-red-700">
          <FaPhoneSlash />
        </Button>
      </div>
    </div>
  </div>;
}

export default CallPage;
