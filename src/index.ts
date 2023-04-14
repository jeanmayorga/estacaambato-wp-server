import express, { Request, Response } from "express";
import { Client, LocalAuth } from "whatsapp-web.js";
import QRCode from "qrcode-terminal";
import dotenv from "dotenv";

import { logger } from "./utils";

dotenv.config();

async function server(whatsapp: Client) {
  logger.info("server: initializing");
  const server = express();
  server.use(express.json());

  server.post("/message", async (req: Request, res: Response) => {
    interface Body {
      message?: string;
      to?: string;
    }
    const body = req.body as Body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ erorr: "Not authorized." });
    }
    if (token !== process.env.TOKEN_SECRET) {
      return res.status(401).json({ erorr: "Not authorized." });
    }
    if (!body.message || !body.to) {
      return res.status(400).json({ erorr: "Missing fields (message or to)" });
    }
    if (!body.to.startsWith("593")) {
      return res
        .status(400)
        .json({ erorr: "Bad phone number, must start with 593" });
    }

    try {
      const to = `${body.to}@c.us`;
      const message = body.message;

      logger.info({ to, message }, "whatsapp: start sending message");
      const newMessage = await whatsapp.sendMessage(to, message);
      logger.info(`whatsapp: message sent ${newMessage.id.id}`);

      return res.status(200).json({ data: newMessage });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
  server.listen(3000, () => {
    logger.info("server: running on http://localhost:3000/");
  });
}

async function main() {
  logger.info("whatsapp: initializing");
  const whatsapp = new Client({
    authStrategy: new LocalAuth(),
  });

  whatsapp.initialize();

  whatsapp.on("qr", (qr) => {
    logger.info("whatsapp: qr code is ready!!");
    QRCode.generate(qr, { small: true });
  });
  whatsapp.on("authenticated", () => {
    logger.info("whatsapp: authenticated");
  });
  whatsapp.on("ready", () => {
    logger.info("whatsapp: ready");
    server(whatsapp);
  });
  whatsapp.on("auth_failure", (e) => {
    logger.error({ message: e }, "Error: Authentication failed");
  });
}

main();
