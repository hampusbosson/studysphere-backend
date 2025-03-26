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
            "You are a top-level educator specializing in ultra-efficient learning. Summarize the following text in bullet points with clear titles about the focus subject. Focus only on the absolute core ideas—ignore minor details, technical jargon, or unnecessary explanations. Do not include intros, conclusions, or formatting metadata. Only return the key takeaways in a structured, highly compressed format that maximizes clarity and efficiency. Your answer should never ever under no circumstances exceed the limit of 5000 tokens, if it does, you decide what should be cut out to fit the criteria. I want you to respond in nicely formatted HTML code, there should be no instances of comments saying 'html'. I want the main ideas to have a <strong> tag"
          },
          { role: "user", content: chunk },
        ],
        max_tokens: 5000,
      });

      combinedSummary += response.choices[0]?.message?.content || "";   
    }

    return combinedSummary;
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

const formatTextToHTML = (content: string): string => {
  // --- Step 1: Fix hyphens that are not on a new line ---
  // Example: "players.- Substitutions" becomes "players.<br>- Substitutions" later.
  content = content.replace(/([^\n])(-\s+)/g, '$1\n$2');

  // --- Step 2: Convert **bold text** to <strong>bold text</strong> ---
  let html = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // --- Step 3: Convert blocks with a bold heading followed by bullet list lines ---
  // This regex finds a bold heading (wrapped in <strong>…</strong>) followed by one or more lines that start with a hyphen.
  html = html.replace(
    /(<strong>[^<]+<\/strong>)\s*\n((?:\s*-\s.*(?:\n|$))+)/g,
    (match, boldText, listBlock) => {
      // Split the block into individual lines and filter those that start with '-'
      const listItems = listBlock
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-'))
        .map((line: string) => {
          // Remove the bullet marker and trim the text
          const itemText = line.replace(/^\s*-\s*/, '').trim();
          return `<li>${itemText}</li>`;
        })
        .join(''); // Join without extra newlines as <li> is already block-level.
      // Insert <br> tags: two <br> tags after the bold text, then the <ul> block, then two more <br> tags.
      return `${boldText}<br><br><ul>${listItems}</ul><br><br>`;
    }
  );

  // --- Final Step: Replace any remaining newline characters with <br> tags ---
  html = html.replace(/\n/g, '<br>');

  return html;
};
