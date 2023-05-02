import QRCode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";

import { deletedMessages } from "./store";
import { getSimpleMessage, logger } from "./utils";
import { server } from "./server";
import { treatVoiceNote } from "./treatments/voice-note";
import { treatChatMessageRevoke } from "./treatments/chat-message-revoke";

async function main() {
  logger.info("whatsapp: initializing");
  const whatsapp = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ["--no-sandbox"],
    },
  });

  whatsapp.initialize();

  whatsapp.on("qr", (qr) => {
    logger.info("whatsapp: qr code is ready!!");
    QRCode.generate(qr, { small: true });
  });
  whatsapp.on("authenticated", () => logger.info("whatsapp: authenticated"));
  whatsapp.on("loading_screen", () => logger.info("whatsapp: loading"));
  whatsapp.on("auth_failure", (e) => logger.error({ e }, "whatsapp: error"));
  whatsapp.on("ready", () => logger.info("whatsapp: ready"));

  whatsapp.on("message_revoke_everyone", (_message, revoked_msg) => {
    treatChatMessageRevoke(revoked_msg);
  });

  whatsapp.on("message_revoke_me", async (message) => {
    treatChatMessageRevoke(message);
  });

  whatsapp.on("message_create", async (message) => {
    if (
      message.from === "593962975512@c.us" &&
      message.to === "593962975512@c.us"
    ) {
      treatVoiceNote(message);
      // console.log(message);
    }
  });

  whatsapp.on("message", async (message) => {
    treatVoiceNote(message);
    // treatViewOnceImage(message);

    // if (message.type === "buttons_response") {
    //   try {
    //     const request = await axios.put(
    //       "https://estacaambato.vercel.app/api/whatsapp",
    //       {
    //         method: "PUT",
    //         body: { selectedButtonId: message.selectedButtonId },
    //       }
    //     );
    //     logger.info(
    //       `severAPI: PUT sended ${message.selectedButtonId} ${request.data.data}`
    //     );
    //   } catch {
    //     logger.error("serverAPI: cannot save");
    //   }
    // }
  });

  server(whatsapp);
}

main();
