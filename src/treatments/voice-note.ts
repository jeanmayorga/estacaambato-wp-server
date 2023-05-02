import { Message } from "whatsapp-web.js";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import { createReadStream } from "fs";

import { logger } from "../utils";
import { voiceNotesTranscribed } from "../store";
import { openai } from "../lib/openai";
import { getContact } from "../utils/getContact";

export async function treatVoiceNote(message: Message) {
  const isVoiceNote =
    message.hasMedia && (message.type === "audio" || message.type === "ptt");
  if (!isVoiceNote) return null;

  logger.info(`treat-voice-note-audio: starting`);
  const filePathOgg = `./src/audios/${message.id.id}.ogg`;
  const filePathMp3 = `./src/audios/${message.id.id}.mp3`;

  const media = await message.downloadMedia();

  await fs.writeFile(filePathOgg, media.data, { encoding: "base64" });

  logger.info(`treat-voice-note-audio: audio converting`);
  ffmpeg({ source: filePathOgg })
    .on("end", async () => {
      try {
        logger.info(`treat-voice-note-audio: audio transcripting`);
        const response = await openai.createTranscription(
          createReadStream(filePathMp3),
          "whisper-1"
        );
        const transcription = response.data.text;

        const audioTranscribed = {
          contact: await getContact(message),
          message: {
            duration: message.duration,
            timestamp: message.timestamp,
          },
          transcription,
        };

        voiceNotesTranscribed.push(audioTranscribed);

        logger.info(`treat-voice-note-audio: audio done`);
      } catch (error: any) {
        console.log(error.message || error.response.data.error);
      } finally {
        await fs.unlink(filePathOgg);
        await fs.unlink(filePathMp3);
      }
    })
    .save(filePathMp3);
}
