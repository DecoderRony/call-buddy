import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface CallStore {
  callId: string | null;
  setCallId: (callId: string | null) => void;
  clearCallId: () => void;
  participantId: string | null;
  setParticipantId: (participantId: string) => void;
  participants: Record<
    string,
    {
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
  removeParticipant: (participantId: string) => void;
  removeAllParticipants: () => void;
  setParticipantMic: (participantId: string, isMicEnabled: boolean) => void;
  setParticipantCam: (participantId: string, isCamEnabled: boolean) => void;
  hasMediaAccess: boolean;
  setHasMediaAccess: (hasMediaAccess: boolean) => void;
  localStream: MediaStream | null;
  setLocalStream: (localStream: MediaStream | null) => void;
  isMicEnabled: boolean;
  setIsMicEnabled: (isMicEnabled: boolean) => void;
  isCamEnabled: boolean;
  setIsCamEnabled: (isCamEnabled: boolean) => void;
}

export const useCallStore = create<CallStore>()(
  subscribeWithSelector((set) => ({
    callId: null,
    setCallId: (callId) => set({ callId }),
    clearCallId: () => set({ callId: null }),

    participantId: null,
    setParticipantId: (participantId) => set({ participantId }),

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

    hasMediaAccess: false,
    setHasMediaAccess: (hasMediaAccess) => set({ hasMediaAccess }),

    localStream: null,
    setLocalStream: (localStream) => set({ localStream }),

    isMicEnabled: false,
    setIsMicEnabled: (isMicEnabled) => set({ isMicEnabled }),

    isCamEnabled: false,
    setIsCamEnabled: (isCamEnabled) => set({ isCamEnabled }),
  }))
);
