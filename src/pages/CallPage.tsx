import {
  CollectionReference,
  DocumentChange,
  DocumentReference,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { firestore } from "../config/firebase";
import { createDummyMediaStream, getRTCPeerConnection } from "../utils/webrtc";
import Button from "../components/ui/Button";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa6";
import { MdContentCopy } from "react-icons/md";


function CallPage() {
  const { callId } = useParams();
  const navigate = useNavigate();
  console.log("rendering");

  // states
  const [loading, setLoading] = useState(false);

  const [joinedCall, setJoinedCall] = useState<string>();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{
    [id: string]: MediaStream | null;
  }>({});

  const [participantDoc, setParticipantDoc] = useState<DocumentReference>();
  const [participants, setParticipants] = useState<{
    [id: string]: RTCPeerConnection;
  }>({});

  const [hasMediaAccess, setHasMediaAccess] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isCamEnabled, setIsCamEnabled] = useState(false);

  const [micEnabledParticipants, setMicEnabledParticipants] = useState<{
    [id: string]: boolean;
  }>({});
  const [camEnabledParticipants, setCamEnabledParticipants] = useState<{
    [id: string]: boolean;
  }>({});

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [id: string]: HTMLVideoElement }>({}); // Store refs for each remote participant's video
  // store parent container ref that holds all remote video elements
  const parentVideoContainerRef = useRef<HTMLDivElement>(null);

  let videoHeight = 0;
  let videoWidth = 0;

  // console.log("participants", participants);
  // console.log("remote video refs", remoteVideoRefs);

  // Get the local media stream
  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      // TODO: change in firebase as well
      setIsMicEnabled(true);
      setIsCamEnabled(true);
      setHasMediaAccess(true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.log("Could not get media access", error);
    }
  };

  // Add tracks from local stream to peer connection
  const pushLocalStreamToConnection = (peerConnection: RTCPeerConnection) => {
    const stream = localStream || createDummyMediaStream();

    if (peerConnection.getSenders().length !== 0) {
      console.log("3a/3b. replacing local stream in connection", stream);
      peerConnection.getSenders().forEach((sender) => {
        if (sender.track?.kind === "audio" || sender.track?.kind === "video") {
          stream.getTracks().forEach((track) => {
            if (track.kind === sender.track?.kind) {
              console.log("3aa/3ba. replacing with track successfull");
              sender.replaceTrack(track);
            }
          });
        }
      });
    } else {
      console.log("3a/3b. adding local stream to connection", stream);
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });
    }
  };

  // Add listener for tracks from peer connection to remote video ref for given participant
  const listenForRemoteTracks = (
    peerConnection: RTCPeerConnection,
    participantId: string
  ) => {
    console.log("4a/4b. listening for remote tracks from", participantId);
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      console.log(
        "13a/12b. Remote description and answer candidates set. Remote tracks avialable: ",
        remoteStream,
        "setting in remote video ref: ",
        remoteVideoRefs.current[participantId]
      );
      if (remoteVideoRefs.current[participantId]) {
        remoteVideoRefs.current[participantId].srcObject = remoteStream;
      }
      setRemoteStreams({
        ...remoteStreams,
        [participantId]: remoteStream,
      });
    };
  };

  const watchOffers = (participantDoc: DocumentReference) => {
    const participantOffers = collection(participantDoc, "offers");
    onSnapshot(participantOffers, (snapshot) => {
      snapshot
        .docChanges()
        // don't process self document
        .filter(
          (otherParticipant) => otherParticipant.doc.id !== participantDoc.id
        )
        // don't process participants we already have a connection for
        .filter((otherParticipant) => !participants[otherParticipant.doc.id])
        .forEach(async (otherParticipant) => {
          const otherParticipantId = otherParticipant.doc.id;

          const peerConnection = getRTCPeerConnection();
          setParticipants((prevParticipants) => ({
            ...prevParticipants,
            [otherParticipantId]: peerConnection,
          }));

          console.log(
            "2b. Found offer from other participant: ",
            otherParticipantId,
            "creating connection with the participant: ",
            peerConnection,
            "updated participants object",
            participants
          );

          pushLocalStreamToConnection(peerConnection);
          listenForRemoteTracks(peerConnection, otherParticipantId);

          const answerDoc = doc(participantDoc, "answers", otherParticipantId);
          const answerCandidates = collection(answerDoc, "candidates");

          console.log(
            "5b. Added listener for local ice candidates. When ready save to DB in offer candidates"
          );
          peerConnection.onicecandidate = async (event) => {
            console.log("8b. adding answer candidates", event);
            if (event.candidate) {
              await addDoc(answerCandidates, event.candidate.toJSON());
            }
          };

          const offerDoc = otherParticipant.doc.ref;
          const offerData = otherParticipant.doc.data();
          const offerCandidates = collection(offerDoc, "candidates");

          if (offerData.description) {
            console.log(
              "6b. Setting remote description",
              offerData.description
            );
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(offerData.description)
            );

            const answerDescription = await peerConnection.createAnswer();
            console.log(
              "7b. Created answer. Setting local description. Ice candidates should be emitted after this",
              answerDescription
            );
            await peerConnection.setLocalDescription(answerDescription);
            const answer = {
              sdp: answerDescription.sdp,
              type: answerDescription.type,
            };
            console.log(
              "9b. saving answer to self doc in answers for other participant: ",
              otherParticipantId,
              answer
            );
            await setDoc(answerDoc, { description: answer }, { merge: true });

            onSnapshot(offerCandidates, (snapshot) => {
              snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                  console.log(
                    "10b. recived offer candidates. Adding to connection",
                    change.doc.data()
                  );
                  const candidate = new RTCIceCandidate(change.doc.data());
                  peerConnection.addIceCandidate(candidate);
                }
              });
            });
          }
        });
    });
  };

  const handleParticipantLeft = (participantId: string) => {
    console.log("handle participant left ran");
    // Close the peer connection for the participant who left
    if (participants[participantId]) {
      participants[participantId].close();
      delete participants[participantId];
    }

    // Remove the remote stream associated with the participant
    setRemoteStreams((prevStreams) => {
      const updatedStreams = { ...prevStreams };
      delete updatedStreams[participantId]; // Remove the stream from the state
      console.log("updated remote streams are: ", updatedStreams);
      return updatedStreams;
    });
  };

  const handleParticipantJoined = async (
    otherParticipant: DocumentChange,
    participantDoc: DocumentReference
  ) => {
    console.log("handle participant joined ran");
    const otherParticipantId = otherParticipant.doc.id;

    const peerConnection = getRTCPeerConnection();
    setParticipants((prevParticipants) => ({
      ...prevParticipants,
      [otherParticipantId]: peerConnection,
    }));

    console.log(
      "2a. creating connection with other participant: ",
      otherParticipantId,
      "with peer connection: ",
      peerConnection,
      "updated participants object: ",
      participants
    );

    pushLocalStreamToConnection(peerConnection);
    listenForRemoteTracks(peerConnection, otherParticipantId);

    const offerDoc = doc(otherParticipant.doc.ref, "offers", participantDoc.id);
    const offerCandidates = collection(offerDoc, "candidates");

    console.log(
      "5a. Added listener for local ice candidates. When ready save to DB in offer candidates"
    );
    peerConnection.onicecandidate = (event) => {
      console.log("7a. adding offer candidates ", event);
      if (event.candidate) {
        addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    const offerDescription = await peerConnection.createOffer();
    console.log(
      "6a. Setting local description. Ice candidates should be emitted after this"
    );
    await peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
    console.log("8a. Adding offer in other participants doc: ", offer);
    await setDoc(offerDoc, { description: offer }, { merge: true });

    const answerDoc = doc(
      otherParticipant.doc.ref,
      "answers",
      participantDoc.id
    );
    const answerCandidates = collection(answerDoc, "candidates");

    onSnapshot(answerDoc, (snapshot) => {
      const answerData = snapshot.data();
      console.log("9a. got answer data: ", answerData);
      if (answerData?.description) {
        console.log(
          "10a. setting remote description: ",
          answerData.description
        );
        peerConnection.setRemoteDescription(
          new RTCSessionDescription(answerData.description)
        );
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log(
            "11a. recived answer candidate. Adding to connection: ",
            change.doc.data()
          );
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(candidate);
        }
      });
    });
  };

  const watchParticipants = (
    participantsCollection: CollectionReference,
    participantDoc: DocumentReference,
    participantNo: number
  ) => {
    onSnapshot(participantsCollection, (snapshot) => {
      snapshot.docChanges().forEach(async (otherParticipant) => {
        const otherParticipantId = otherParticipant.doc.id;
        const otherParticipantData = otherParticipant.doc.data();

        const isSelfDocumentInChange = otherParticipantId === participantDoc.id;
        const isNewParticpant = otherParticipantData.number > participantNo;
        const connectionAlreadyExists = participants[otherParticipantId];

        // Handle media status changes
        setMicEnabledParticipants((prevMuted) => ({
          ...prevMuted,
          [otherParticipantId]: otherParticipantData.isMicEnabled, // Track mute status for each participant
        }));

        setCamEnabledParticipants((prevMuted) => ({
          ...prevMuted,
          [otherParticipantId]: otherParticipantData.isCamEnabled, // Track mute status for each participant
        }));

        if (otherParticipant.type === "removed") {
          handleParticipantLeft(otherParticipantId);
        }

        if (
          !isSelfDocumentInChange &&
          isNewParticpant &&
          !connectionAlreadyExists
        ) {
          console.log(
            "calling handle participant joined",
            otherParticipantId,
            participants
          );
          handleParticipantJoined(otherParticipant, participantDoc);
        }
      });
    });
  };

  const joinCall = async (callDocument: DocumentReference) => {
    const participantsCollection = collection(callDocument, "participants");
    let participantNo: number | null = null;
    let participantDoc: DocumentReference | null = null;

    try {
      const countSnapshot = await getCountFromServer(participantsCollection);
      participantNo = countSnapshot.data().count + 1;
      participantDoc = await addDoc(participantsCollection, {
        number: participantNo,
        isMicEnabled: isMicEnabled,
        isCamEnabled: isCamEnabled,
      });
      setParticipantDoc(participantDoc);
    } catch (err) {
      console.log("Could not join the call. Please try again later");
    }

    if (participantNo && participantDoc) {
      watchOffers(participantDoc);
      watchParticipants(participantsCollection, participantDoc, participantNo);
    }
  };

  const cleanupOnUnload = () => {
    leaveCall();
  };

  useEffect(() => {
    const init = async () => {
      // Get media access
      if (!localStream) {
        getLocalStream();
      }

      // join call
      if (callId) {
        if (joinedCall) {
          console.log("Already in a call. Cannot join another call");
          return;
        }

        try {
          const callDoc = doc(firestore, "calls", callId);
          const callSnap = await getDoc(callDoc);

          if (callSnap.exists()) {
            joinCall(callDoc);
            setJoinedCall(callId);
          } else {
            console.log("Call with given callId does not exist");
          }
        } catch (err) {
          console.log("Error joining call", err);
        }
      }
    };

    init();
    window.addEventListener("beforeunload", cleanupOnUnload);

    return () => {
      (async () => {
        console.log("unmounting");
        await leaveCall();
        window.removeEventListener("beforeunload", cleanupOnUnload);
      })();
    };
  }, []);

  useEffect(() => {
    // console.log(
    //   "local stream or participants changed. Adding stream to those participants",
    //   localStream,
    //   participants
    // );
    Object.keys(participants).forEach((participantId) => {
      const peerConnection = participants[participantId];
      pushLocalStreamToConnection(peerConnection);
    });
  }, [localStream, participants]);

  let gridClasses;
  if (Object.keys(participants).length === 1) {
    gridClasses = "grid grid-cols-1 grid-rows-1";
  } else if (Object.keys(participants).length === 2) {
    gridClasses = "grid grid-cols-2 grid-rows-1";
  } else {
    const rows = Math.ceil(Object.keys(participants).length / 2);
    gridClasses = `grid grid-cols-2 grid-rows-[${rows}]`;
    if(parentVideoContainerRef.current?.offsetWidth){
      videoWidth = parentVideoContainerRef.current?.offsetWidth / 2
    }

    if(parentVideoContainerRef.current?.offsetHeight){
      // calculating container height wrt to (total container height - (number of rows * gap space))
      const containerHeight = parentVideoContainerRef.current.offsetHeight - ((rows < 1 ? 0 : rows - 1) * 12);
      videoHeight = containerHeight / rows;
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const toggleMic = async () => {
    if (localStream) {
      // Get the audio track from the local stream
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled; // Toggle mute/unmute
        setIsMicEnabled(audioTrack.enabled); // Update mute state
        if (participantDoc) {
          await updateDoc(participantDoc, {
            isMicEnabled: audioTrack.enabled, // Update the 'muted' field in Firebase
          });
        }
      }
    }
  };

  const toggleCam = async () => {
    if (localStream) {
      // Get the video track from the local stream
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled; // Toggle mute/unmute
        setIsCamEnabled(videoTrack.enabled); // Update mute state
        if (participantDoc) {
          await updateDoc(participantDoc, {
            isCamEnabled: videoTrack.enabled, // Update the 'muted' field in Firebase
          });
        }
      }
    }
  };

  const leaveCall = async () => {
    // 1. Stop local media tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop(); // Stop each audio/video track
      });
    }

    // 2. Close all peer connections
    Object.keys(participants).forEach((participantId) => {
      if (participants[participantId]) {
        participants[participantId].close(); // Close the peer connection
      }
    });
    setParticipants({});

    // 3. remove the user's document from the participants collection
    console.log("deleting document");
    if (participantDoc) {
      await deleteDoc(participantDoc); // Remove your participant entry from Firebase
    }

    // 4. Reset the state and UI
    setLocalStream(null);
    setRemoteStreams({});
    setJoinedCall(undefined);
    setMicEnabledParticipants({});
    setCamEnabledParticipants({});
  };

  return (
    <div className="h-dvh flex flex-col p-5 relative">
      <div className="pl-5 flex flex-col">
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold">{callId}</span>
          <span className="text-sm text-gray-300 font-extralight cursor-pointer">
            <MdContentCopy />
          </span>
        </div>
        <span className="text-xs">
          Share this Id with your friends to invite them to the call
        </span>
      </div>

      <div className="h-full overflow-hidden">
        <div ref={parentVideoContainerRef} className={"h-full pt-8 pb-3 px-16 gap-3 " + gridClasses}>
          {Object.keys(participants).map((participantId) => (
            <div
              key={participantId}
              className={"mx-auto container bg-zinc-700 h-full rounded-md overflow-hidden " + `w-[${videoWidth}px] h-[${videoHeight}px]`}
            >
              <video
                ref={(el) => (remoteVideoRefs.current[participantId] = el!)}
                autoPlay
                className="h-full w-full object-cover"
              />
              {!micEnabledParticipants[participantId] && <span>muted</span>}
              {!camEnabledParticipants[participantId] && <span>video off</span>}
            </div>
          ))}
        </div>

        <div className="absolute h-[30%] w-[25%] bottom-5 right-5">
          <div className="bg-zinc-500 h-full w-full rounded-md overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="absolute h-12 w-full bottom-16 left-0 flex justify-center">
          <Button
            onClick={toggleMic}
            variant="rounded"
            className={
              isMicEnabled
                ? "w-16 h-16 bg-zinc-800 hover:bg-zinc-600"
                : "w-16 h-16 bg-red-100 hover:bg-red-200"
            }
          >
            {isMicEnabled ? (
              <FaMicrophone />
            ) : (
              <FaMicrophoneSlash className="text-red-800" />
            )}
          </Button>

          <Button
            onClick={toggleCam}
            variant="rounded"
            className={`ml-2 ${
              isCamEnabled
                ? "w-16 h-16 bg-zinc-800 hover:bg-zinc-600"
                : "w-16 h-16 bg-red-100 hover:bg-red-200"
            }`}
          >
            {isCamEnabled ? (
              <FaVideo />
            ) : (
              <FaVideoSlash className="text-red-800" />
            )}
          </Button>

          <Button
            variant="rounded"
            className="h-16 w-16 ml-2 bg-red-800 hover:bg-red-700"
            onClick={() => {
              leaveCall();
              navigate("/");
            }}
          >
            <FaPhoneSlash />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CallPage;
