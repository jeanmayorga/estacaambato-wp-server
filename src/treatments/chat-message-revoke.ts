import { Message } from "whatsapp-web.js";

import { logger } from "../utils";
import { chatMessagesRevoked } from "../store";
import { getContact } from "../utils/getContact";

export async function treatChatMessageRevoke(message?: Message | null) {
  const isRevokeChat = message && message.type === "chat";
  if (!isRevokeChat) return null;

  logger.info(`treat-chat-message-revoke: starting`);

  const revokedChat = {
    contact: await getContact(message),
    message: {
      timestamp: message.timestamp,
      body: message.body,
    },
  };

  chatMessagesRevoked.push(revokedChat);
  logger.info(`treat-chat-message-revoke: done`);
}
