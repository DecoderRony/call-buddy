import { firestore } from "@/config/firebase";
import {
  addDoc,
  collection,
  CollectionReference,
  DocumentReference,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useCallStore } from "./callStore";

class Logger {
  private readonly logsCollection = collection(firestore, "logs");
  private logDoc: DocumentReference | null = null;
  private participantLogCollection: CollectionReference | null = null;

  private callId: string | null = null;
  private participantId: string | null = null;

  constructor() {
    useCallStore.subscribe(
      (state) => state.callId,
      async (callId, prevCallId) => {
        try {
          this.callId = callId;
          // If valid callId
          if (callId && callId !== prevCallId) {
            const logDocQuery = query(
              this.logsCollection,
              where("callId", "==", callId)
            );

            const querySnapshot = await getDocs(logDocQuery);
            if (querySnapshot.docs.length === 0) {
              const logsDoc = await addDoc(this.logsCollection, {
                callId,
                callName: useCallStore.getState().callName,
                createdAt: Date.now(),
              });
              this.logDoc = logsDoc;
            } else {
              this.logDoc = querySnapshot.docs[0].ref;
            }
          }
        } catch (err) {
          console.error("could not create log collecion", err);
        }
      }
    );

    useCallStore.subscribe(
      (state) => state.participantId,
      async (participantId, prevParticipantId) => {
        try {
          this.participantId = participantId;
          // If valid participant and log doc present
          if (
            participantId &&
            participantId !== prevParticipantId &&
            this.logDoc
          ) {
            const participantsCollection = collection(
              this.logDoc,
              "participants"
            );
            const participantDocQuery = query(
              participantsCollection,
              where("participantId", "==", participantId)
            );

            const querySnapshot = await getDocs(participantDocQuery);
            if (querySnapshot.docs.length === 0) {
              const participantDoc = await addDoc(participantsCollection, {
                participantId,
                participantName: useCallStore.getState().participantName,
                deviceDetails: navigator.userAgent,
                createdAt: Date.now(),
              });
              this.participantLogCollection = collection(
                participantDoc,
                "logs"
              );
            } else {
              this.participantLogCollection = collection(
                querySnapshot.docs[0].ref,
                "logs"
              );
            }
          }
        } catch (err) {
          console.error("could not create participant log collecion", err);
        }
      }
    );
  }

  error(...args: any[]) {
    if (this.callId && this.participantId && this.participantLogCollection) {
      addDoc(this.participantLogCollection, {
        type: "error",
        message: args[0],
        stack: args[1],
        createdAt: Date.now(),
      });
    }

    if (process.env.NODE_ENV !== "production") {
      console.error(...args);
    }
  }

  warn(...args: any[]) {
    if (this.callId && this.participantId && this.participantLogCollection) {
      addDoc(this.participantLogCollection, {
        type: "warn",
        message: args[0],
        stack: args[1],
        createdAt: Date.now(),
      });
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(...args);
    }
  }

  info(...args: any[]) {
    if (this.callId && this.participantId && this.participantLogCollection) {
      addDoc(this.participantLogCollection, {
        type: "info",
        message: args[0],
        createdAt: Date.now(),
      });
    }

    if (process.env.NODE_ENV !== "production") {
      console.info(...args);
    }
  }

  debug(...args: any[]) {
    // -- debug logs should not be stored in DB
    // if (this.callId && this.participantId && this.participantLogCollection) {
    //   addDoc(this.participantLogCollection, {
    //     type: "debug",
    //     message: args[0],
    //     createdAt: Date.now(),
    //   });
    // }

    if (process.env.NODE_ENV !== "production") {
      console.log(...args);
    }
  }
}

export default new Logger();
