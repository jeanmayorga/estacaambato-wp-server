import { Client, LocalAuth } from "whatsapp-web.js";
import QRCode from "qrcode-terminal";

import { logger } from "./utils";
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

  server(whatsapp);
}

main();
