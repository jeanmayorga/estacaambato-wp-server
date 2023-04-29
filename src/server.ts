import express, { Request, Response } from "express";
import WAWebJS, {
  Buttons,
  Client,
  List,
  MessageContent,
} from "whatsapp-web.js";
import dotenv from "dotenv";

import { logger } from "./utils";
import { deletedMessages } from "./store";

dotenv.config();

function getFormattedTo(to: string) {
  const unformattedTo = to.split("@");
  const phone = unformattedTo[0] || "";
  const type = unformattedTo[1] ? `@${unformattedTo[1]}` : "@c.us";

  const phoneNumber = phone.match(/[0-9-]/g)?.join("");

  return `${phoneNumber}${type}`;
}

function getResponse(message: Message) {
  return {
    id: message._data?.id.id,
    from: message.from,
    to: message.to,
    body: message.body,
  };
}

interface Message extends WAWebJS.Message {
  _data?: WAWebJS.Message;
}
interface Body {
  // mandatory fields
  to?: string;
  message?: string;

  // optional fields
  type?: "message" | "buttons" | "list";
  title?: string;
  footer?: string;
  buttons?: {
    body: string;
    id: string;
  }[];
  lists?: {
    title: string;
    rows: {
      title: string;
      id: string;
      description: string;
    }[];
  }[];
  buttonText?: string;
}

export async function server(whatsapp: Client) {
  logger.info("server: initializing");
  const server = express();
  server.use(express.json());

  server.get("/deleted-messages", async (_req: Request, res: Response) => {
    logger.info("server: start get deleted list messages");
    return res.status(200).json({ data: deletedMessages.chats });
  });

  server.post("/message", async (req: Request, res: Response) => {
    try {
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

      const to = getFormattedTo(body.to);

      if (body.type === "list") {
        if (!body.buttonText || !body.lists || body.lists?.length === 0) {
          return res.status(400).json({ erorr: "Missing fields." });
        }

        const content: MessageContent = new List(
          body.message,
          body.buttonText,
          body.lists,
          body.title,
          body.footer
        );
        logger.info({ to, content }, "server: start a list message");
        const data: Message = await whatsapp.sendMessage(to, content);
        logger.info("whatsapp: list message sent");
        return res.status(200).json(getResponse(data));
      }

      if (body.type === "buttons") {
        if (!body.buttons || body.buttons?.length === 0) {
          return res.status(400).json({ erorr: "Missing fields." });
        }

        const content: MessageContent = new Buttons(
          body.message,
          body.buttons,
          body.title,
          body.footer
        );
        logger.info({ to, content }, "server: start a buttons message");
        const data: Message = await whatsapp.sendMessage(to, content);
        logger.info("whatsapp: buttons message sent");
        return res.status(200).json(getResponse(data));
      }

      const data: Message = await whatsapp.sendMessage(to, body.message);
      logger.info(
        { to, content: body.message },
        "server: start a simple message"
      );
      logger.info("whatsapp: simple message sent");
      return res.status(200).json(getResponse(data));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  server.listen(8080, () => {
    logger.info("server: running on http://localhost:8080/");
  });
}
