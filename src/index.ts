import axios from "axios";
import QRCode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";

import { deletedMessages } from "./store";
import { getSimpleMessage, logger } from "./utils";
import { server } from "./server";

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
    if (revoked_msg) {
      if (revoked_msg.type === "chat") {
        deletedMessages.chats.push(getSimpleMessage(revoked_msg));
      }
    }
  });

  whatsapp.on("message_revoke_me", (message) => {
    if (message && message.type === "chat") {
      deletedMessages.chats.push(getSimpleMessage(message));
    }
  });

  whatsapp.on("message", async (message) => {
    if (message.type === "buttons_response") {
      try {
        const request = await axios.put(
          "https://estacaambato.vercel.app/api/whatsapp",
          {
            method: "PUT",
            body: { selectedButtonId: message.selectedButtonId },
          }
        );
        logger.info(
          `severAPI: PUT sended ${message.selectedButtonId} ${request.data.data}`
        );
      } catch {
        logger.error("serverAPI: cannot save");
      }
    }
  });

  server(whatsapp);
}

main();
