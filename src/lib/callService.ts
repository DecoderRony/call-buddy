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
import { createDummyMediaStream, getRTCPeerConnection } from "./utils";
import { showToast } from "@/components/functions/Toast";

let instance: CallService;

class CallService {
  private participantsCollection: CollectionReference | undefined;
  private participantDoc: DocumentReference | undefined;
  private joinedAt: number | null = null;

  private unsubscribeParticipantsListener: (() => void) | undefined;
  private unsubscribeOffersListener: (() => void) | undefined;
  private unsubscribeLocalStreamListener: (() => void) | undefined;

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
    if (this.unsubscribeLocalStreamListener) {
      this.unsubscribeLocalStreamListener();
    }
    this.unsubscribeParticipantsListener = undefined;
    this.unsubscribeOffersListener = undefined;
    this.unsubscribeOffersListener = undefined;
  }

  private pushLocalStreamToConnection(peerConnection: RTCPeerConnection) {
    const localStream = useCallStore.getState().localStream;
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
  }

  private listenForRemoteTracks(
    peerConnection: RTCPeerConnection,
    participantId: string
  ) {
    const addParticipantStream = useCallStore.getState().addParticipantStream;
    console.log("4a/4b. listening for remote tracks from", participantId);
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      console.log(
        "13a/12b. Remote description and answer candidates set. Remote tracks avialable: ",
        remoteStream
      );
      addParticipantStream(participantId, remoteStream);
      const participants = useCallStore.getState().participants;
      console.log(
        "added participant stream: ",
        participantId,
        remoteStream,
        participants
      );
    };
  }

  private async handleParticipantJoined(otherParticipant: DocumentChange) {
    if (!this.participantDoc || !this.joinedAt) {
      return;
    }

    // get states and actions from the store
    const participants = useCallStore.getState().participants;
    const addParticipantConnection =
      useCallStore.getState().addParticipantConnection;
    const addParticipantName = useCallStore.getState().addParticipantName;

    const otherParticipantId = otherParticipant.doc.id;

    const peerConnection = getRTCPeerConnection();
    addParticipantConnection(otherParticipantId, peerConnection);
    console.log(
      "added participant via participant joined",
      otherParticipantId,
      peerConnection,
      participants
    );
    addParticipantName(otherParticipantId, otherParticipant.doc.data().name);

    console.log(
      "2a. creating connection with other participant: ",
      otherParticipantId,
      "with peer connection: ",
      peerConnection,
      "updated participants object: ",
      participants
    );

    this.pushLocalStreamToConnection(peerConnection);
    this.listenForRemoteTracks(peerConnection, otherParticipantId);

    const offerDoc = doc(
      otherParticipant.doc.ref,
      "offers",
      this.participantDoc.id
    );
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
      this.participantDoc.id
    );
    const answerCandidates = collection(answerDoc, "candidates");

    const unsubscribeAnswerDescriptionListener = onSnapshot(
      answerDoc,
      (snapshot) => {
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
      }
    );

    const unsubscribeAnswerCandidatesListener = onSnapshot(
      answerCandidates,
      (snapshot) => {
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
      }
    );

    return () => {
      unsubscribeAnswerDescriptionListener();
      unsubscribeAnswerCandidatesListener();
    };
  }

  private handleParticipantLeft(otherParticipant: DocumentChange) {
    console.log("handle participant left ran");

    const otherParticipantId = otherParticipant.doc.id;
    const participants = useCallStore.getState().participants;
    const removeParticipant = useCallStore.getState().removeParticipant;

    // Close the peer connection for the participant who left
    if (participants[otherParticipantId]) {
      participants[otherParticipantId].connection.close();
      removeParticipant(otherParticipantId);
    }

    showToast({
      title: `${participants[otherParticipantId].name} has left the call`,
    });
  }

  private async handleParticipantOffer(otherParticipant: DocumentChange) {
    console.log("handle participant offer ran");
    const offerData = otherParticipant.doc.data();
    if (!this.participantDoc || !offerData) {
      return;
    }

    // get states and actions from the storesetParticipantM
    const participants = useCallStore.getState().participants;
    const addParticipantConnection =
      useCallStore.getState().addParticipantConnection;
    const setParticipantMic = useCallStore.getState().setParticipantMic;
    const setParticipantCam = useCallStore.getState().setParticipantCam;
    const addParticipantName = useCallStore.getState().addParticipantName;

    const otherParticipantId = otherParticipant.doc.id;

    const peerConnection = getRTCPeerConnection();
    console.log(
      "added participant via offer: ",
      otherParticipantId,
      peerConnection,
      participants
    );
    addParticipantConnection(otherParticipantId, peerConnection);

    // fetch mic and cam status of the participant making offer
    // required for initial rendering
    if (this.participantsCollection) {
      const otherParticipantDoc = await getDoc(
        doc(this.participantsCollection, otherParticipantId)
      );
      const otherParticipantData = otherParticipantDoc.data();
      setParticipantMic(
        otherParticipantId,
        otherParticipantData?.isMicEnabled || true
      );
      setParticipantCam(
        otherParticipantId,
        otherParticipantData?.isCamEnabled || true
      );
      addParticipantName(otherParticipantId, otherParticipantData?.name);
    }

    console.log(
      "2b. Found offer from other participant: ",
      otherParticipantId,
      "creating connection with the participant: ",
      peerConnection,
      "updated participants object",
      participants
    );

    this.pushLocalStreamToConnection(peerConnection);
    this.listenForRemoteTracks(peerConnection, otherParticipantId);

    const answerDoc = doc(this.participantDoc, "answers", otherParticipantId);
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

    console.log("6b. Setting remote description", offerData.description);
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(offerData.description)
    );

    const answerDescription = await peerConnection.createAnswer();
    console.log("partcipants till now: ", useCallStore.getState().participants);
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

    const offerDoc = otherParticipant.doc.ref;
    const offerCandidates = collection(offerDoc, "candidates");
    const unsubscribeOfferCandidatesListener = onSnapshot(
      offerCandidates,
      (snapshot) => {
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
      }
    );

    return () => {
      unsubscribeOfferCandidatesListener();
    };
  }

  private async watchOffers() {
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
          console.log("change in participant offer: ", otherParticipant);

          const otherParticipantId = otherParticipant.doc.id;
          const participants = useCallStore.getState().participants;

          console.log("found participants after getting offer", participants);
          if (!this.participantDoc) {
            return;
          }

          const isSelfDocumentInChange =
            otherParticipantId === this.participantDoc.id;
          const connectionAlreadyExists = participants[otherParticipantId];
          console.log(
            "is self document: ",
            isSelfDocumentInChange,
            "does connection already exists",
            connectionAlreadyExists
          );

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

    return () => {
      unsubscribeMainOffersListener();
      Object.values(unsubscribeParticipantsOfferListeners).forEach((unsub) => {
        if (unsub) unsub();
      });
    };
  }

  private async watchParticipants() {
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
          console.log("participant collection changed", otherParticipant);
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
            console.log(
              "calling handle participant joined",
              otherParticipantId,
              participants
            );
            const unsubsribeParticipantJoined =
              this.handleParticipantJoined(otherParticipant);
            unsubscribeParticipantsJoinedListeners[otherParticipantId] =
              await unsubsribeParticipantJoined;
          }

          // Handle media status changes
          if (!isSelfDocumentInChange) {
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

    return () => {
      unsubsribeMainParticipantsListener();
      Object.values(unsubscribeParticipantsJoinedListeners).forEach((unsub) => {
        if (unsub) unsub();
      });
    };
  }

  // --------------------------- Public methods --------------------------------- //
  public async callExists(id: string) {
    const callId = useCallStore.getState().callId;
    if (callId) {
      return true;
    }

    const callDoc = doc(firestore, "calls", id);
    const callSnap = await getDoc(callDoc);

    if (callSnap.exists()) {
      const setCallId = useCallStore.getState().setCallId;
      const setCallName = useCallStore.getState().setCallName;

      setCallId(id);
      setCallName(callSnap.data().name);
      return true;
    }
    return false;
  }

  public async getLocalStream() {
    try {
      const setLocalStream = useCallStore.getState().setLocalStream;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      this.setIsMicEnabled(true);
      this.setIsCamEnabled(true);
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        return {
          error: true,
          type: "ACCESS_DENIED",
        };
      } else {
        return {
          error: true,
          type: "NOT_FOUND",
        };
      }
    }
  }

  public async setIsMicEnabled(isMicEnabled: boolean) {
    const setIsMicEnabled = useCallStore.getState().setIsMicEnabled;
    setIsMicEnabled(isMicEnabled);

    if (this.participantDoc) {
      await updateDoc(this.participantDoc, {
        isMicEnabled: isMicEnabled, // Update in Firebase
      });
    }
  }

  public async setIsCamEnabled(isCamEnabled: boolean) {
    const setIsCamEnabled = useCallStore.getState().setIsCamEnabled;
    setIsCamEnabled(isCamEnabled);

    if (this.participantDoc) {
      await updateDoc(this.participantDoc, {
        isCamEnabled: isCamEnabled, // Update in Firebase
      });
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
    const setCallId = useCallStore.getState().setCallId;
    const setCallName = useCallStore.getState().setCallName;

    const callsCollection = collection(firestore, "calls");
    const callDocument = await addDoc(callsCollection, {
      name: callName,
      createdAt: Date.now(),
    });

    setCallId(callDocument.id);
    setCallName(callName);
    return callDocument.id;
  }

  public async joinCall(callId: string) {
    // get states and actions from the store
    const isMicEnabled = useCallStore.getState().isMicEnabled;
    const isCamEnabled = useCallStore.getState().isCamEnabled;
    const participantName = useCallStore.getState().participantName;
    const setParticipantId = useCallStore.getState().setParticipantId;

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

      // Initialize call instance values
      this.participantsCollection = participantsCollection;
      this.participantDoc = participantDoc;
      this.joinedAt = joinedAt;
      setParticipantId(participantDoc.id);

      // listen for participants in the call
      this.unsubscribeParticipantsListener = await this.watchParticipants();
      // listen for offers from other participants
      this.unsubscribeOffersListener = await this.watchOffers();
      // listen for local stream changes
      this.unsubscribeLocalStreamListener = useCallStore.subscribe(
        (state) => state.localStream,
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
    } catch (err) {
      // TODO: Handle UI
      console.log("Could not join the call. Please try again later");
    }
  }

  public endCall() {
    const callId = useCallStore.getState().callId;
    const setCallId = useCallStore.getState().setCallId;
    const setCallName = useCallStore.getState().setCallName;
    const participantId = useCallStore.getState().participantId;
    const setParticipantId = useCallStore.getState().setParticipantId;
    const setParticipantName = useCallStore.getState().setParticipantName;
    const participants = useCallStore.getState().participants;
    const localStream = useCallStore.getState().localStream;
    const setLocalStream = useCallStore.getState().setLocalStream;
    const removeAllParticipants = useCallStore.getState().removeAllParticipants;

    // 1. Stop local media tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
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
        deleteDoc(participantDoc); // Remove your participant entry from Firebase
      }
    }

    // 5. Reset the state and UI
    setLocalStream(null);
    setCallId(null);
    setCallName(null);
    setParticipantId(null);
    setParticipantName(null);
    this.participantDoc = undefined;
    this.participantsCollection = undefined;
    this.joinedAt = null;
  }
}

const callService = new CallService();
export default callService;
