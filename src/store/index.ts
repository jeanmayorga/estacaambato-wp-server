import { SimpleChatMessage } from "../utils";

interface Contact {
  picUrl: string;
  name: string | undefined;
  number: string;
}

export const deletedMessages: Record<"chats", SimpleChatMessage[]> = {
  chats: [],
};

interface ChatMessageRevoked {
  contact: Contact;
  message: {
    timestamp: string | number;
    body: string;
  };
}
export const chatMessagesRevoked: ChatMessageRevoked[] = [];

interface VoiceNotesTranscribed {
  contact: Contact;
  message: {
    duration: string;
    timestamp: number | number;
  };
  transcription: string;
}

export const voiceNotesTranscribed: VoiceNotesTranscribed[] = [];
