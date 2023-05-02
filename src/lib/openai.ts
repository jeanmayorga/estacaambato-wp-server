import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_SECRET,
});

export const openai = new OpenAIApi(configuration);
