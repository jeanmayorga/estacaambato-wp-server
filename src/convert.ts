import { Configuration, OpenAIApi } from "openai";
import { createReadStream } from "fs";
import ffmpeg from "fluent-ffmpeg";
import { logger } from "./utils";

const apiKey = "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";

const configuration = new Configuration({
  apiKey,
});
const openai = new OpenAIApi(configuration);

async function main() {
  try {
    const filePathOgg = `./src/audios/EF5D978E3911D845BED751A51B1BF257.ogg`;
    const filePathMp3 = `./src/audios/EF5D978E3911D845BED751A51B1BF257.mp3`;

    ffmpeg({ source: filePathOgg })
      .on("end", async () => {
        logger.info(`treat: voice note audio: audio converted`);

        logger.info(`treat: voice note audio: audio transcripting`);
        const response = await openai.createTranscription(
          createReadStream(filePathMp3),
          "whisper-1"
        );
        const transcription = response.data.text;

        logger.info(`treat: voice note audio: audio transcripted`);

        logger.info(transcription);
      })
      .save(filePathMp3);
  } catch (error: any) {
    console.log(error.message || error.response.data.error);
  }
}

main();
