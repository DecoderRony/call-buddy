import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface CallStore {
  isInCall: boolean;
  setIsInCall: (isInCall: boolean) => void;
  callId: string | null;
  setCallId: (callId: string | null) => void;
  clearCallId: () => void;
  callName: string | null;
  setCallName: (callName: string | null) => void;
  clearCallName: () => void;
  participantId: string | null;
  setParticipantId: (participantId: string | null) => void;
  participantName: string | null;
  setParticipantName: (participantName: string | null) => void;
  participants: Record<
    string,
    {
      name: string | null;
      connection: RTCPeerConnection;
      stream: MediaStream;
      isMicEnabled: boolean;
      isCamEnabled: boolean;
    }
  >;
  addParticipantConnection: (
    participantId: string,
    connection: RTCPeerConnection
  ) => void;
  addParticipantStream: (participantId: string, stream: MediaStream) => void;
  addParticipantName: (participantId: string, name: string) => void;
  removeParticipant: (participantId: string) => void;
  removeAllParticipants: () => void;
  setParticipantMic: (participantId: string, isMicEnabled: boolean) => void;
  setParticipantCam: (participantId: string, isCamEnabled: boolean) => void;
  audioStream: MediaStream | null;
  setAudioStream: (localStream: MediaStream | null) => void;
  videoStream: MediaStream | null;
  setVideoStream: (localStream: MediaStream | null) => void;
  isMicEnabled: boolean;
  setIsMicEnabled: (isMicEnabled: boolean) => void;
  isCamEnabled: boolean;
  setIsCamEnabled: (isCamEnabled: boolean) => void;
}

export const useCallStore = create<CallStore>()(
  subscribeWithSelector((set) => ({
    isInCall: false,
    setIsInCall: (isInCall) => set({ isInCall }),

    callId: null,
    setCallId: (callId) => set({ callId }),
    clearCallId: () => set({ callId: null }),

    callName: null,
    setCallName: (callName) => set({ callName }),
    clearCallName: () => set({ callName: null }),

    participantId: null,
    setParticipantId: (participantId) => set({ participantId }),

    participantName: null,
    setParticipantName: (participantName) => set({ participantName }),

    participants: {},
    addParticipantConnection: (participantId, connection) =>
      set((state) => ({
        participants: {
          ...state.participants,
          [participantId]: {
            ...state.participants[participantId],
            connection,
          },
        },
      })),
    addParticipantStream: (participantId, stream) =>
      set((state) => ({
        participants: {
          ...state.participants,
          [participantId]: {
            ...state.participants[participantId],
            stream,
          },
        },
      })),
    addParticipantName: (participantId, name) =>
      set((state) => {
        if (!state.participants[participantId]) return state;
        return {
          participants: {
            ...state.participants,
            [participantId]: {
              ...state.participants[participantId],
              name,
            },
          },
        };
      }),
    removeParticipant: (participantId) =>
      set((state) => {
        const { [participantId]: _, ...remainingParticipants } =
          state.participants;
        return { participants: remainingParticipants };
      }),
    removeAllParticipants: () => set({ participants: {} }),
    setParticipantMic: (participantId, isMicEnabled) =>
      set((state) => {
        if (!state.participants[participantId]) return state;
        return {
          participants: {
            ...state.participants,
            [participantId]: {
              ...state.participants[participantId],
              isMicEnabled,
            },
          },
        };
      }),
    setParticipantCam: (participantId, isCamEnabled) =>
      set((state) => {
        if (!state.participants[participantId]) return state;
        return {
          participants: {
            ...state.participants,
            [participantId]: {
              ...state.participants[participantId],
              isCamEnabled,
            },
          },
        };
      }),

    audioStream: null,
    setAudioStream: (audioStream) => set({ audioStream }),

    videoStream: null,
    setVideoStream: (videoStream) => set({ videoStream }),

    isMicEnabled: false,
    setIsMicEnabled: (isMicEnabled) => set({ isMicEnabled }),

    isCamEnabled: false,
    setIsCamEnabled: (isCamEnabled) => set({ isCamEnabled }),
  }))
);
