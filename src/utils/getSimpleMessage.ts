import { Message as WAMessage } from "whatsapp-web.js";

interface Message extends WAMessage {
  _data?: WAMessage;
}

export interface SimpleChatMessage {
  id: string;
  from: string;
  to: string;
  body: string;
}

export function getSimpleMessage(message: Message): SimpleChatMessage {
  return {
    id: message._data?.id.id || "",
    from: message.from,
    to: message.to,
    body: message.body,
  };
}
