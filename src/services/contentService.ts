import OpenAI from "openai";
import axios from "axios";
import pdfParse from "pdf-parse";
import * as cheerio from "cheerio";

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export const fetchContentFromURL = async (url: string): Promise<string> => {
  try {
    console.time("Fetch Request");
    const response = await axios.get(url, { responseType: "arraybuffer" });
    console.timeEnd("Fetch Request");

    if (response.headers["content-type"] === "application/pdf") {
      console.time("PDF Parse");
      const pdfContent = await pdfParse(response.data);
      console.timeEnd("PDF Parse");
      return pdfContent.text.trim();
    }

    console.time("HTML Parse");
    const html = response.data.toString();
    const $ = cheerio.load(html);
    const text = $("body").text();
    console.timeEnd("HTML Parse");
    return text.trim();
  } catch (error) {
    console.error("Failed to fetch content from URL");
    throw new Error("Failed to fetch content from the URL");
  }
};

// Summarize content using OpenAI's GPT API
export const summarizeContent = async (content: string): Promise<string> => {
  try {
    console.time("Total Summarization");
    // Split content into smaller chunks
    const maxChunkSize = 3000; // Approx. 3000 tokens per chunk
    const contentChunks = splitContentIntoChunks(content, maxChunkSize);

    console.log(contentChunks.length);

    let combinedSummary = "";
    let chunkIndex = 1;
    for (const chunk of contentChunks) {
      console.time(`Summarize Chunk ${chunkIndex}`);
      const response = await client.chat.completions.create({
        model: "o3-mini-2025-01-31",
        messages: [
          {
            role: "system",
            content:
              "Summarize the following content in a concise and clear manner. " +
              "The summary should be in HTML format, with <strong> for bold text and <ul> for lists. " +
              "The summary should start with a headline that is the name of the subject, for example: 'Artificial Intelligence', the headline should be wrapped in a <h1> and <strong> tag " +
              "The summary should be informative and easy to understand. " +
              "Please avoid using overly technical language or jargon. " +
              "Please summarize it in a bullet point format. " + 
              "Each bullet point list should start with a headline in bold, " + 
              "If the content is too long, please summarize it in multiple parts. ",
              
          },
          { role: "user", content: chunk },
        ],
        max_completion_tokens: 5000,
      });

      console.timeEnd(`Summarize Chunk ${chunkIndex}`);
      combinedSummary += response.choices[0]?.message?.content || "";
      chunkIndex++;
    }
    console.timeEnd("Total Summarization");

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
