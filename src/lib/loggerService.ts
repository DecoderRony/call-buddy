import { firestore } from "@/config/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useCallStore } from "./callStore";

class Logger {
  private readonly logsCollection = collection(firestore, "logs");

  private saveToDB(data: any) {
    addDoc(this.logsCollection, {
      ...data,
      callId: useCallStore.getState().callId,
      callName: useCallStore.getState().callName,
      participantId: useCallStore.getState().participantId,
      participantName: useCallStore.getState().participantName,
      deviceDetails: navigator.userAgent,
      createdAt: Date.now(),
    });
  }

  error(...args: any[]) {
    this.saveToDB({
      type: "error",
      message: args[0],
      stack: args[1],
    });

    if (process.env.NODE_ENV !== "production") {
      console.error(...args);
    }
  }

  warn(...args: any[]) {
    this.saveToDB({
      type: "warn",
      message: args[0],
      stack: args[1],
    });

    if (process.env.NODE_ENV !== "production") {
      console.warn(...args);
    }
  }

  info(...args: any[]) {
    this.saveToDB({
      type: "info",
      message: args[0],
    });

    if (process.env.NODE_ENV !== "production") {
      console.info(...args);
    }
  }

  debug(...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.log(...args);
    }
  }
}

export default new Logger();