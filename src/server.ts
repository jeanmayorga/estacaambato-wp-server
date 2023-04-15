import express, { Request, Response } from "express";
import WAWebJS, { Client } from "whatsapp-web.js";
import dotenv from "dotenv";

import { logger } from "./utils";

dotenv.config();

interface Message extends WAWebJS.Message {
  _data?: WAWebJS.Message;
}

export async function server(whatsapp: Client) {
  logger.info("server: initializing");
  const server = express();
  server.use(express.json());

  server.post("/message", async (req: Request, res: Response) => {
    try {
      interface Body {
        message?: string;
        to?: string;
      }
      const body = req.body as Body;
      const token = req.headers.authorization?.split(" ")[1];

      logger.info({ token, body }, "server: incoming request");

      if (!token || token !== process.env.TOKEN_SECRET) {
        return res.status(401).json({ erorr: "Not authorized." });
      }
      if (!body.message || !body.to) {
        return res
          .status(400)
          .json({ erorr: "Missing fields (message or to)" });
      }
      if (!body.to.startsWith("593")) {
        return res
          .status(400)
          .json({ erorr: "Bad phone number, must start with 593" });
      }

      const to = `${body.to}@c.us`;
      const message = body.message;

      logger.info({ to, message }, "whatsapp: start sending message");
      const newMessage = await whatsapp.sendMessage(to, message);
      logger.info({ id: newMessage.id.id }, `whatsapp: message sent`);

      const data = newMessage as Message;

      delete data._data;

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error });
    }
  });

  server.listen(8080, () => {
    logger.info("server: running on http://localhost:8080/");
  });
}
