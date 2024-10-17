import {
  CollectionReference,
  DocumentReference,
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { firestore } from "../config/firebase";
import { getRTCPeerConnection } from "../utils/webrtc";
import Button from "../components/ui/Button";
import {
  FaCopy,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa6";
import { MdContentCopy } from "react-icons/md";

function CallPage() {
  const { callId } = useParams();
  console.log("rendering");

  // states
  const [loading, setLoading] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{
    [id: string]: MediaStream | null;
  }>({});
  const [participants, setParticipants] = useState<{
    [id: string]: RTCPeerConnection;
  }>({});
  const [isMicEnable, setIsMicEnable] = useState(true);
  const [isCamEnable, setIsCamEnable] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [id: string]: HTMLVideoElement }>({}); // Store refs for each remote participant's video

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
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices", error);
    }
  };

  // Add tracks from local stream to peer connection
  const pushLocalStreamToConnection = (peerConnection: RTCPeerConnection) => {
    if (localStream) {
      // console.log("3a/3b. adding local stream to connection", localStream);
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });
    }
  };

  // Add listener for tracks from peer connection to remote video ref for given participant
  const listenForRemoteTracks = (
    peerConnection: RTCPeerConnection,
    participantId: string
  ) => {
    // console.log("4a/4b. listening for remote tracks from", participantId);
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      // console.log(
      //   "13a/12b. Remote description and answer candidates set. Remote tracks avialable: ",
      //   remoteStream,
      //   "setting in remote video ref: ",
      //   remoteVideoRefs.current[participantId]
      // );
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

          // console.log(
          //   "2b. Found offer from other participant: ",
          //   otherParticipantId,
          //   "creating connection with the participant: ",
          //   peerConnection,
          //   "updated participants object",
          //   participants
          // );

          pushLocalStreamToConnection(peerConnection);
          listenForRemoteTracks(peerConnection, otherParticipantId);

          const answerDoc = doc(participantDoc, "answers", otherParticipantId);
          const answerCandidates = collection(answerDoc, "candidates");

          // console.log(
          //   "5b. Added listener for local ice candidates. When ready save to DB in offer candidates"
          // );
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
            // console.log(
            //   "6b. Setting remote description",
            //   offerData.description
            // );
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(offerData.description)
            );

            const answerDescription = await peerConnection.createAnswer();
            // console.log(
            //   "7b. Created answer. Setting local description. Ice candidates should be emitted after this",
            //   answerDescription
            // );
            await peerConnection.setLocalDescription(answerDescription);
            const answer = {
              sdp: answerDescription.sdp,
              type: answerDescription.type,
            };
            // console.log(
            //   "9b. saving answer to self doc in answers for other participant: ",
            //   otherParticipantId,
            //   answer
            // );
            await setDoc(answerDoc, { description: answer }, { merge: true });

            onSnapshot(offerCandidates, (snapshot) => {
              snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                  // console.log(
                  //   "10b. recived offer candidates. Adding to connection",
                  //   change.doc.data()
                  // );
                  const candidate = new RTCIceCandidate(change.doc.data());
                  peerConnection.addIceCandidate(candidate);
                }
              });
            });
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
      snapshot
        .docChanges()

        // don't create offer for self document
        .filter(
          (otherParticipant) => otherParticipant.doc.id !== participantDoc.id
        )

        // don't create offer for already present participants
        .filter(
          (otherParticipant) =>
            otherParticipant.doc.data().number > participantNo
        )

        // don't create offer for participants we already have a connection for
        .filter((otherParticipant) => !participants[otherParticipant.doc.id])

        // don't create offer for participants who have sent an offer
        .filter(async (otherParticipant) =>
          (
            await getDoc(
              doc(otherParticipant.doc.ref, "offers", otherParticipant.doc.id)
            )
          ).exists()
        )

        // create offer for other participant
        .forEach(async (otherParticipant) => {
          const otherParticipantId = otherParticipant.doc.id;

          const peerConnection = getRTCPeerConnection();
          setParticipants((prevParticipants) => ({
            ...prevParticipants,
            [otherParticipantId]: peerConnection,
          }));

          // console.log(
          //   "2a. creating connection with other participant: ",
          //   otherParticipantId,
          //   "with peer connection: ",
          //   peerConnection,
          //   "updated participants object: ",
          //   participants
          // );

          pushLocalStreamToConnection(peerConnection);
          listenForRemoteTracks(peerConnection, otherParticipantId);

          const offerDoc = doc(
            otherParticipant.doc.ref,
            "offers",
            participantDoc.id
          );
          const offerCandidates = collection(offerDoc, "candidates");

          // console.log(
          //   "5a. Added listener for local ice candidates. When ready save to DB in offer candidates"
          // );
          peerConnection.onicecandidate = (event) => {
            // console.log("7a. adding offer candidates ", event);
            if (event.candidate) {
              addDoc(offerCandidates, event.candidate.toJSON());
            }
          };

          const offerDescription = await peerConnection.createOffer();
          // console.log(
          //   "6a. Setting local description. Ice candidates should be emitted after this"
          // );
          await peerConnection.setLocalDescription(offerDescription);

          const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
          };
          // console.log("8a. Adding offer in other participants doc: ", offer);
          await setDoc(offerDoc, { description: offer }, { merge: true });

          const answerDoc = doc(
            otherParticipant.doc.ref,
            "answers",
            participantDoc.id
          );
          const answerCandidates = collection(answerDoc, "candidates");

          onSnapshot(answerDoc, (snapshot) => {
            const answerData = snapshot.data();
            // console.log("9a. got answer data: ", answerData);
            if (answerData?.description) {
              // console.log(
              //   "10a. setting remote description: ",
              //   answerData.description
              // );
              peerConnection.setRemoteDescription(
                new RTCSessionDescription(answerData.description)
              );
            }
          });

          onSnapshot(answerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                // console.log(
                //   "11a. recived answer candidate. Adding to connection: ",
                //   change.doc.data()
                // );
                const candidate = new RTCIceCandidate(change.doc.data());
                peerConnection.addIceCandidate(candidate);
              }
            });
          });
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
      });
    } catch (err) {
      console.log("Could not add user to the call. Please try again later");
    }

    if (participantNo && participantDoc) {
      watchOffers(participantDoc);
      watchParticipants(participantsCollection, participantDoc, participantNo);
    }
  };

  useEffect(() => {
    getLocalStream();
  }, []);

  useEffect(() => {
    if (localStream && callId) {
      const callDoc = doc(firestore, "calls", callId);
      joinCall(callDoc);
    }
  }, [localStream]);

  if (loading) {
    return <div>Loading...</div>;
  }

  let gridClasses;
  if (Object.keys(participants).length === 1) {
    gridClasses = "grid grid-cols-1 grid-rows-1";
  } else if (Object.keys(participants).length === 2) {
    gridClasses = "grid grid-cols-2 grid-rows-1";
  } else {
    gridClasses = "grid grid-cols-2 grid-rows-2";
  }

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

      <div className="flex-grow h-full">
        <div className={"h-full pt-8 pb-3 px-16 gap-3 " + gridClasses}>
          {Object.keys(participants).map((participantId) => (
            <div
              key={participantId}
              className="mx-auto container bg-zinc-700 h-full rounded-md overflow-hidden"
            >
              <video
                ref={(el) => (remoteVideoRefs.current[participantId] = el!)}
                autoPlay
                className="h-auto w-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="absolute h-[25%] w-[25%] bottom-5 right-5">
          <div className="bg-zinc-500 h-full w-full rounded-md overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              className="h-auto w-full object-cover"
            />
          </div>
        </div>

        <div className="absolute h-12 w-full bottom-16 left-0 flex justify-center">
          <Button
            onClick={() => setIsMicEnable((prev) => !prev)}
            variant="rounded"
            className={
              isMicEnable
                ? "w-16 h-16 bg-zinc-800 hover:bg-zinc-600"
                : "w-16 h-16 bg-red-100 hover:bg-red-200"
            }
          >
            {isMicEnable ? (
              <FaMicrophone />
            ) : (
              <FaMicrophoneSlash className="text-red-800" />
            )}
          </Button>

          <Button
            onClick={() => setIsCamEnable((prev) => !prev)}
            variant="rounded"
            className={`ml-2 ${
              isCamEnable
                ? "w-16 h-16 bg-zinc-800 hover:bg-zinc-600"
                : "w-16 h-16 bg-red-100 hover:bg-red-200"
            }`}
          >
            {isCamEnable ? (
              <FaVideo />
            ) : (
              <FaVideoSlash className="text-red-800" />
            )}
          </Button>

          <Button
            variant="rounded"
            className="h-16 w-16 ml-2 bg-red-800 hover:bg-red-700"
          >
            <FaPhoneSlash />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CallPage;
