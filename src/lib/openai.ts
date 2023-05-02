import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: "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",
});

export const openai = new OpenAIApi(configuration);
