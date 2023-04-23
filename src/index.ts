import { Client, LocalAuth } from "whatsapp-web.js";
import QRCode from "qrcode-terminal";

import { logger } from "./utils";
import { server } from "./server";
import axios from "axios";

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

  whatsapp.on("message", async (message) => {
    if (message.type === "buttons_response") {
      try {
        await axios.put("https://estacaambato.vercel.app/api/whatsapp", {
          method: "PUT",
          body: { selectedButtonId: message.selectedButtonId },
        });
        logger.info(`severAPI: PUT sended ${message.selectedButtonId}`);
      } catch {
        logger.error("serverAPI: cannot save");
      }
    }
  });

  server(whatsapp);
}

main();
