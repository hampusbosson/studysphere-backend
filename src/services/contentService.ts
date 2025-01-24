import OpenAI from "openai";
import axios from "axios";
import pdfParse from "pdf-parse";
import * as cheerio from "cheerio";

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export const fetchContentFromURL = async(url: string): Promise<string> => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });

    if (response.headers["content-type"] === "application/pdf") {
      const pdfContent = await pdfParse(response.data);
      return pdfContent.text;
    }

    const html = response.data.toString();
    const $ = cheerio.load(html);
    const text = $("body").text();
    return text.trim();

  } catch (error) {
    console.error("Failed to fetch content from URL");
    throw new Error("Failed to fetch content from the URL");
  }
}

// Summarize content using OpenAI's GPT API
export const summarizeContent = async(content: string): Promise<string> => {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "developer",
          content: "Summarize the following text in a concise and clear way:",
        },
        { role: "user", content },
      ],
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || "Summary not available.";
    
  } catch (error) {
    console.error("Error summarizing content:", error);
    throw new Error("Failed to summarize content.");
  }
}