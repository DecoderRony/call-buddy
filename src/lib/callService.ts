import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentChange,
  DocumentReference,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useCallStore } from "./callStore";
import { firestore } from "../config/firebase";
import {
  createDummyAudioTrack,
  createDummyVideoTrack,
  getRTCPeerConnection,
  getToast,
} from "./utils";
import { showToast } from "@/components/functions/Toast";
import logger from "@/lib/loggerService";

let instance: CallService;

class CallService {
  private participantsCollection: CollectionReference | undefined;
  private participantDoc: DocumentReference | undefined;
  private joinedAt: number | null = null;

  private unsubscribeParticipantsListener: (() => void) | undefined;
  private unsubscribeOffersListener: (() => void) | undefined;
  private unsubscribeAudioStreamListener: (() => void) | undefined;
  private unsubscribeVideoStreamListener: (() => void) | undefined;

  constructor() {
    if (instance) {
      throw new Error("CallService instance already exists");
    }
    instance = this;
  }

  // --------------------------- Private methods ------------------------------- //
  private unsubscribeListeners() {
    if (this.unsubscribeParticipantsListener) {
      this.unsubscribeParticipantsListener();
    }
    if (this.unsubscribeOffersListener) {
      this.unsubscribeOffersListener();
    }
    if (this.unsubscribeAudioStreamListener) {
      this.unsubscribeAudioStreamListener();
    }
    if (this.unsubscribeVideoStreamListener) {
      this.unsubscribeVideoStreamListener();
    }
    this.unsubscribeParticipantsListener = undefined;
    this.unsubscribeOffersListener = undefined;
    this.unsubscribeOffersListener = undefined;
  }

  private pushLocalStreamToConnection(peerConnection: RTCPeerConnection) {
    logger.debug("Inside pushLocalStreamToConnection");

    const audioStream = useCallStore.getState().audioStream;
    const videoStream = useCallStore.getState().videoStream;

    const stream = new MediaStream();
    stream.addTrack(
      audioStream?.getAudioTracks()[0] || createDummyAudioTrack()
    );
    stream.addTrack(
      videoStream?.getVideoTracks()[0] || createDummyVideoTrack()
    );

    if (peerConnection.getSenders().length !== 0) {
      logger.debug("Replacing local stream in connection", stream);
      peerConnection.getSenders().forEach((sender) => {
        if (sender.track?.kind === "audio" || sender.track?.kind === "video") {
          stream.getTracks().forEach((track) => {
            if (track.kind === sender.track?.kind) {
              sender.replaceTrack(track);
              logger.info("replaced track", track);
            }
          });
        }
      });
    } else {
      logger.debug("Aadding local stream to connection", stream);
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
        logger.info("added track", track);
      });
    }

    logger.debug("leaving pushLocalStreamToConnection");
  }

  private listenForRemoteTracks(
    peerConnection: RTCPeerConnection,
    participantId: string
  ) {
    logger.debug("Inside listenForRemoteTracks");
    const addParticipantStream = useCallStore.getState().addParticipantStream;

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      addParticipantStream(participantId, remoteStream);
      logger.info(
        "added remote stream to participant",
        participantId,
        remoteStream
      );
    };

    logger.debug("leaving listenForRemoteTracks");
  }

  private async handleParticipantJoined(otherParticipant: DocumentChange) {
    logger.debug("Inside handleParticipantJoined");

    if (!this.participantDoc || !this.joinedAt) {
      return;
    }

    // get states and actions from the store
    const addParticipantConnection =
      useCallStore.getState().addParticipantConnection;
    const addParticipantName = useCallStore.getState().addParticipantName;

    const otherParticipantId = otherParticipant.doc.id;

    const peerConnection = getRTCPeerConnection();
    addParticipantConnection(otherParticipantId, peerConnection);
    addParticipantName(otherParticipantId, otherParticipant.doc.data().name);
    logger.info("created connection with participant ", otherParticipantId);

    this.pushLocalStreamToConnection(peerConnection);
    this.listenForRemoteTracks(peerConnection, otherParticipantId);

    const offerDoc = doc(
      otherParticipant.doc.ref,
      "offers",
      this.participantDoc.id
    );
    const offerCandidates = collection(offerDoc, "candidates");

    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(offerCandidates, event.candidate.toJSON());
        logger.info("added offer candidate to DB", event.candidate.candidate);
      }
    };

    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);
    logger.info("set local description", offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
    await setDoc(offerDoc, { description: offer }, { merge: true });
    logger.info("added offer to DB", offer);

    const answerDoc = doc(
      otherParticipant.doc.ref,
      "answers",
      this.participantDoc.id
    );
    const answerCandidates = collection(answerDoc, "candidates");

    const unsubscribeAnswerDescriptionListener = onSnapshot(
      answerDoc,
      (snapshot) => {
        const answerData = snapshot.data();
        if (answerData?.description) {
          peerConnection.setRemoteDescription(
            new RTCSessionDescription(answerData.description)
          );
          logger.info("set remote description", answerData.description);
        }
      }
    );

    const unsubscribeAnswerCandidatesListener = onSnapshot(
      answerCandidates,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const candidate = new RTCIceCandidate(change.doc.data());
            peerConnection.addIceCandidate(candidate);
            logger.info("added answer candidate to connection", candidate);
          }
        });
      }
    );

    logger.debug("leaving handleParticipantJoined");
    return () => {
      unsubscribeAnswerDescriptionListener();
      unsubscribeAnswerCandidatesListener();
    };
  }

  private handleParticipantLeft(otherParticipant: DocumentChange) {
    logger.debug("Inside handleParticipantLeft");

    const otherParticipantId = otherParticipant.doc.id;
    const participants = useCallStore.getState().participants;
    const removeParticipant = useCallStore.getState().removeParticipant;

    // Close the peer connection for the participant who left
    if (participants[otherParticipantId]) {
      participants[otherParticipantId].connection.close();
      removeParticipant(otherParticipantId);
      logger.info("removed participant with id ", otherParticipantId);
    }

    showToast(
      getToast(
        "TITLE",
        `${participants[otherParticipantId].name} has left the call`
      )
    );

    logger.debug("leaving handleParticipantLeft");
  }

  private async handleParticipantOffer(otherParticipant: DocumentChange) {
    logger.debug("Inside handleParticipantOffer");

    const offerData = otherParticipant.doc.data();
    if (!this.participantDoc || !offerData) {
      return;
    }

    // get states and actions from the store
    const addParticipantConnection =
      useCallStore.getState().addParticipantConnection;
    const setParticipantMic = useCallStore.getState().setParticipantMic;
    const setParticipantCam = useCallStore.getState().setParticipantCam;
    const addParticipantName = useCallStore.getState().addParticipantName;

    const otherParticipantId = otherParticipant.doc.id;

    const peerConnection = getRTCPeerConnection();
    addParticipantConnection(otherParticipantId, peerConnection);
    logger.info("created connection with participant ", otherParticipantId);

    // fetch mic and cam status of the participant making offer
    // required for initial rendering
    if (this.participantsCollection) {
      const otherParticipantDoc = await getDoc(
        doc(this.participantsCollection, otherParticipantId)
      );
      const otherParticipantData = otherParticipantDoc.data();

      logger.info(
        "setting media status and name for participant",
        otherParticipantId,
        otherParticipantData
      );
      setParticipantMic(otherParticipantId, otherParticipantData?.isMicEnabled);
      setParticipantCam(otherParticipantId, otherParticipantData?.isCamEnabled);
      addParticipantName(otherParticipantId, otherParticipantData?.name);
    }

    this.pushLocalStreamToConnection(peerConnection);
    this.listenForRemoteTracks(peerConnection, otherParticipantId);

    const answerDoc = doc(this.participantDoc, "answers", otherParticipantId);
    const answerCandidates = collection(answerDoc, "candidates");

    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(answerCandidates, event.candidate.toJSON());
        logger.info("add answer candidate in DB", event.candidate);
      }
    };

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(offerData.description)
    );
    logger.info("set remote description", offerData.description);

    const answerDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDescription);
    logger.info("set local description", answerDescription);

    const answer = {
      sdp: answerDescription.sdp,
      type: answerDescription.type,
    };
    await setDoc(answerDoc, { description: answer }, { merge: true });
    logger.info("added answer to DB", answer);

    const offerDoc = otherParticipant.doc.ref;
    const offerCandidates = collection(offerDoc, "candidates");
    const unsubscribeOfferCandidatesListener = onSnapshot(
      offerCandidates,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const candidate = new RTCIceCandidate(change.doc.data());
            peerConnection.addIceCandidate(candidate);
            logger.info("added offer candidate to connection", candidate);
          }
        });
      }
    );

    logger.debug("leaving handleParticipantOffer");
    return () => {
      unsubscribeOfferCandidatesListener();
    };
  }

  private async watchOffers() {
    logger.debug("Inside watchOffers");
    if (!this.participantDoc) {
      return;
    }

    // unsubsribers for each participants listeners
    const unsubscribeParticipantsOfferListeners: Record<
      string,
      (() => void) | undefined
    > = {};

    const participantOffers = collection(this.participantDoc, "offers");
    const unsubscribeMainOffersListener = onSnapshot(
      participantOffers,
      (snapshot) => {
        snapshot.docChanges().forEach(async (otherParticipant) => {
          const otherParticipantId = otherParticipant.doc.id;
          const participants = useCallStore.getState().participants;

          if (!this.participantDoc) {
            return;
          }

          const isSelfDocumentInChange =
            otherParticipantId === this.participantDoc.id;
          const connectionAlreadyExists = participants[otherParticipantId];

          if (
            !isSelfDocumentInChange &&
            !connectionAlreadyExists &&
            otherParticipant.type === "added"
          ) {
            const unsubscribeParticipantOffer =
              this.handleParticipantOffer(otherParticipant);
            unsubscribeParticipantsOfferListeners[otherParticipantId] =
              await unsubscribeParticipantOffer;
          }
        });
      }
    );

    logger.debug("leaving watchOffers");
    return () => {
      unsubscribeMainOffersListener();
      Object.values(unsubscribeParticipantsOfferListeners).forEach((unsub) => {
        if (unsub) unsub();
      });
    };
  }

  private async watchParticipants() {
    logger.debug("Inside watchParticipants");
    if (!this.participantsCollection || !this.participantDoc) {
      return;
    }

    // unsubsribers for each participants listeners
    const unsubscribeParticipantsJoinedListeners: Record<
      string,
      (() => void) | undefined
    > = {};

    const unsubsribeMainParticipantsListener = onSnapshot(
      this.participantsCollection,
      (snapshot) => {
        snapshot.docChanges().forEach(async (otherParticipant) => {
          const participants = useCallStore.getState().participants;
          const setParticipantMic = useCallStore.getState().setParticipantMic;
          const setParticipantCam = useCallStore.getState().setParticipantCam;

          const otherParticipantId = otherParticipant.doc.id;
          const otherParticipantData = otherParticipant.doc.data();

          if (!this.joinedAt || !this.participantDoc) {
            return;
          }

          const isSelfDocumentInChange =
            otherParticipantId === this.participantDoc.id;
          const isNewParticpant = otherParticipantData.joinedAt > this.joinedAt;
          const connectionAlreadyExists = participants[otherParticipantId];

          // Handle if a participant leaves the call
          if (otherParticipant.type === "removed") {
            this.handleParticipantLeft(otherParticipant);
          }

          // Handle if a participant joins the call
          if (
            !isSelfDocumentInChange &&
            isNewParticpant &&
            !connectionAlreadyExists
          ) {
            const unsubsribeParticipantJoined =
              this.handleParticipantJoined(otherParticipant);
            unsubscribeParticipantsJoinedListeners[otherParticipantId] =
              await unsubsribeParticipantJoined;
          }

          // Handle media status changes
          if (!isSelfDocumentInChange) {
            logger.info(
              "setting media status for participant ",
              otherParticipantId,
              otherParticipantData
            );
            setParticipantMic(
              otherParticipantId,
              otherParticipantData.isMicEnabled
            );
            setParticipantCam(
              otherParticipantId,
              otherParticipantData.isCamEnabled
            );
          }
        });
      }
    );

    logger.debug("leaving watchParticipants");
    return () => {
      unsubsribeMainParticipantsListener();
      Object.values(unsubscribeParticipantsJoinedListeners).forEach((unsub) => {
        if (unsub) unsub();
      });
    };
  }

  // --------------------------- Public methods --------------------------------- //
  public async callExists(id: string) {
    logger.debug("Inside callExists");

    const callId = useCallStore.getState().callId;
    if (callId) {
      logger.info("call exists. leaving callExists");
      return true;
    }

    const callDoc = doc(firestore, "calls", id);
    const callSnap = await getDoc(callDoc);

    if (callSnap.exists()) {
      const setCallId = useCallStore.getState().setCallId;
      const setCallName = useCallStore.getState().setCallName;

      setCallId(id);
      setCallName(callSnap.data().name);

      logger.info("call exists. leaving callExists");
      return true;
    }
    logger.info("call does not exists. leaving callExists");
    return false;
  }

  public async getAudioStream() {
    logger.debug("Inside getAudioStream");
    try {
      const setAudioStream = useCallStore.getState().setAudioStream;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setAudioStream(stream);
      this.toggleMic();
      logger.debug("leaving getAudioStream");
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        logger.error("audio stream permission denied. leaving getAudioStream");
        return {
          error: true,
          type: "ACCESS_DENIED",
        };
      } else {
        logger.error("no audio device found. leaving getAudioStream");
        return {
          error: true,
          type: "NOT_FOUND",
        };
      }
    }
  }

  public async getVideoStream() {
    logger.debug("Inside getVideoStream");

    try {
      const setVideoStream = useCallStore.getState().setVideoStream;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      setVideoStream(stream);
      this.toggleCam();
      logger.debug("leaving getVideoStream");
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        logger.error("video stream permission denied. leaving getVideoStream");
        return {
          error: true,
          type: "ACCESS_DENIED",
        };
      } else {
        logger.error("no video device found. leaving getVideoStream");
        return {
          error: true,
          type: "NOT_FOUND",
        };
      }
    }
  }

  public async toggleMic() {
    logger.debug("Inside toggleMic");

    // Get the audio stream
    const audioStream = useCallStore.getState().audioStream;
    if (!audioStream) {
      logger.error("no audio stream. leaving toggleMic");
      return {
        status: "error",
        message: "No audio stream avialable",
      };
    }

    // Get audio tracks
    const audioTrack = audioStream.getAudioTracks()[0];
    if (!audioTrack) {
      logger.error("no audio track. leaving toggleMic");
      return {
        status: "error",
        message: "No audio track avialable",
      };
    }

    // Update mic state
    audioTrack.enabled = !audioTrack.enabled;
    const setIsMicEnabled = useCallStore.getState().setIsMicEnabled;
    setIsMicEnabled(audioTrack.enabled);

    // update in firebase
    if (this.participantDoc) {
      try {
        await updateDoc(this.participantDoc, {
          isMicEnabled: audioTrack.enabled,
        });
        logger.debug("updated in DB. leaving toggleMic");
        return {
          status: "success",
          message: "Mic status changed",
        };
      } catch (err) {
        logger.error("could not update in DB. leaving toggleMic");
        return {
          status: "error",
          message: "Could not update in DB",
        };
      }
    }
  }

  public async toggleCam() {
    logger.debug("Inside toggleCam");

    // Get the video stream
    const videoStream = useCallStore.getState().videoStream;
    if (!videoStream) {
      logger.error("no video stream. leaving toggleCam");
      return {
        status: "error",
        message: "No video stream avialable",
      };
    }

    // Get video tracks
    const videoTrack = videoStream.getVideoTracks()[0];
    if (!videoTrack) {
      logger.error("no video track. leaving toggleCam");
      return {
        status: "error",
        message: "No video track avialable",
      };
    }

    // Update mic state
    videoTrack.enabled = !videoTrack.enabled;
    const setIsCamEnabled = useCallStore.getState().setIsCamEnabled;
    setIsCamEnabled(videoTrack.enabled);

    // update in firebase
    if (this.participantDoc) {
      try {
        await updateDoc(this.participantDoc, {
          isCamEnabled: videoTrack.enabled,
        });
        logger.debug("updated in DB. leaving toggleCam");
        return {
          status: "success",
          message: "Cam status changed",
        };
      } catch (err) {
        logger.error("could not update in DB. leaving toggleCam");
        return {
          status: "error",
          message: "Could not update in DB",
        };
      }
    }
  }

  public async getCallParticipants() {
    try {
      const callId = useCallStore.getState().callId;
      if (!callId) {
        return {
          error: true,
        };
      }

      const callDocument = doc(firestore, "calls", callId);
      const participantsCollection = collection(callDocument, "participants");
      const participants: string[] = [];
      const participantsSnapshot = await getDocs(query(participantsCollection));
      participantsSnapshot.forEach((doc) => {
        participants.push(doc.data().name);
      });
      return participants;
    } catch (err) {
      return {
        error: true,
      };
    }
  }

  public async createCall(callName: string) {
    logger.debug("Inside createCall");

    const setCallId = useCallStore.getState().setCallId;
    const setCallName = useCallStore.getState().setCallName;

    const callsCollection = collection(firestore, "calls");
    let callDocument: DocumentReference;
    try {
      callDocument = await addDoc(callsCollection, {
        name: callName,
        createdAt: Date.now(),
      });
      logger.info(`Created call ${callName} with id ${callDocument.id}`);
    } catch (err) {
      logger.error("Could not create call. leaving createCall", err);
      throw new Error("Could not create call");
    }

    setCallId(callDocument.id);
    setCallName(callName);

    logger.debug("leaving createCall");
    return callDocument.id;
  }

  public async joinCall(callId: string) {
    logger.debug("Inside joinCall");

    // get states and actions from the store
    const isMicEnabled = useCallStore.getState().isMicEnabled;
    const isCamEnabled = useCallStore.getState().isCamEnabled;
    const participantName = useCallStore.getState().participantName;
    const setParticipantId = useCallStore.getState().setParticipantId;
    const setIsInCall = useCallStore.getState().setIsInCall;

    // Initialize firebase references
    const callDocument = doc(firestore, "calls", callId);
    const participantsCollection = collection(callDocument, "participants");
    let participantDoc: DocumentReference | null = null;

    try {
      // Add participant in the call
      const joinedAt = Date.now();
      participantDoc = await addDoc(participantsCollection, {
        name: participantName,
        joinedAt,
        isMicEnabled: isMicEnabled,
        isCamEnabled: isCamEnabled,
      });
      logger.info(
        `Joined call with name ${participantName} and id ${participantDoc.id}`
      );

      // Initialize call instance values
      this.participantsCollection = participantsCollection;
      this.participantDoc = participantDoc;
      this.joinedAt = joinedAt;
      setParticipantId(participantDoc.id);

      // listen for participants in the call
      this.unsubscribeParticipantsListener = await this.watchParticipants();
      // listen for offers from other participants
      this.unsubscribeOffersListener = await this.watchOffers();
      // listen for audio stream changes
      this.unsubscribeAudioStreamListener = useCallStore.subscribe(
        (state) => state.audioStream,
        () => {
          const participants = useCallStore.getState().participants;
          Object.keys(participants).forEach((participantId) => {
            if (participants[participantId].connection) {
              this.pushLocalStreamToConnection(
                participants[participantId].connection
              );
            }
          });
        }
      );
      // listen for video stream changes
      this.unsubscribeVideoStreamListener = useCallStore.subscribe(
        (state) => state.videoStream,
        () => {
          const participants = useCallStore.getState().participants;
          Object.keys(participants).forEach((participantId) => {
            if (participants[participantId].connection) {
              this.pushLocalStreamToConnection(
                participants[participantId].connection
              );
            }
          });
        }
      );

      setIsInCall(true);
      logger.debug("leaving joinCall");
      return {
        status: "success",
      };
    } catch (err) {
      logger.error("could not join call. leaving joinCall", err);
      return {
        status: "error",
        message: "Could not join the call. Please try again later",
      };
    }
  }

  public async endCall() {
    logger.debug("Inside endCall");

    const callId = useCallStore.getState().callId;
    const setCallId = useCallStore.getState().setCallId;
    const setIsInCall = useCallStore.getState().setIsInCall;
    const setCallName = useCallStore.getState().setCallName;
    const participantId = useCallStore.getState().participantId;
    const setParticipantId = useCallStore.getState().setParticipantId;
    const setParticipantName = useCallStore.getState().setParticipantName;
    const participants = useCallStore.getState().participants;
    const audioStream = useCallStore.getState().audioStream;
    const setAudioStream = useCallStore.getState().setAudioStream;
    const videoStream = useCallStore.getState().videoStream;
    const setVideoStream = useCallStore.getState().setVideoStream;
    const removeAllParticipants = useCallStore.getState().removeAllParticipants;

    // 1. Stop local media tracks
    if (audioStream) {
      audioStream.getTracks().forEach((track) => {
        track.stop(); // Stop each audio/video track
      });
    }
    if (videoStream) {
      videoStream.getTracks().forEach((track) => {
        track.stop(); // Stop each audio/video track
      });
    }

    // 2. Unsubscribe all listeners
    this.unsubscribeListeners();

    // 3. Close all peer connections
    Object.keys(participants).forEach((participantId) => {
      if (participants[participantId]) {
        participants[participantId].connection.close(); // Close the peer connection
      }
    });
    removeAllParticipants();

    // 4. remove the user's document from the participants collection
    if (callId && participantId) {
      const participantDoc = doc(
        firestore,
        "calls",
        callId,
        "participants",
        participantId
      );
      if (participantDoc) {
        await deleteDoc(participantDoc); // Remove your participant entry from Firebase
      }
      logger.info(`Removed participant ${participantId} from call`);
    }

    // 5. Reset the state and UI
    setAudioStream(null);
    setVideoStream(null);
    setCallId(null);
    setCallName(null);
    setParticipantId(null);
    setParticipantName(null);
    this.participantDoc = undefined;
    this.participantsCollection = undefined;
    this.joinedAt = null;
    setIsInCall(false);

    logger.debug("leaving endCall");
  }
}

const callService = new CallService();
export default callService;
