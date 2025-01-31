import OpenAI from "openai";
import axios from "axios";
import pdfParse from "pdf-parse";
import * as cheerio from "cheerio";

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export const fetchContentFromURL = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });

    if (response.headers["content-type"] === "application/pdf") {
      const pdfContent = await pdfParse(response.data);
      return pdfContent.text.trim();
    }

    const html = response.data.toString();
    const $ = cheerio.load(html);
    const text = $("body").text();
    return text.trim();
  } catch (error) {
    console.error("Failed to fetch content from URL");
    throw new Error("Failed to fetch content from the URL");
  }
};

// Summarize content using OpenAI's GPT API
export const summarizeContent = async (content: string): Promise<string> => {
  try {
    // Split content into smaller chunks to avoid token limits
    const maxChunkSize = 3000; // Approx. 3000 tokens per chunk
    const contentChunks = splitContentIntoChunks(content, maxChunkSize);

    let combinedSummary = "";

    for (const chunk of contentChunks) {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
            "You are a top-level educator specializing in ultra-efficient learning. Summarize the following text in bullet points with clear titles about the focus subject. Focus only on the absolute core ideas—ignore minor details, technical jargon, or unnecessary explanations. Do not include intros, conclusions, or formatting metadata. Only return the key takeaways in a structured, highly compressed format that maximizes clarity and efficiency. Your answer should never ever under no circumstances exceed the limit of 5000 tokens, if it does, you decide what should be cut out to fit the criteria."
          },
          { role: "user", content: chunk },
        ],
        max_tokens: 5000,
      });

      combinedSummary += response.choices[0]?.message?.content || "";
    }

    return combinedSummary.trim();
  } catch (error) {
    console.error("Error summarizing content:", error);
    throw new Error("Failed to summarize content.");
  }
};

// Utility function to split text into chunks
const splitContentIntoChunks = (
  text: string,
  maxChunkSize: number,
): string[] => {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxChunkSize) {
    chunks.push(text.slice(i, i + maxChunkSize));
  }
  return chunks;
};
