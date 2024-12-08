// A copy of the gemini.ts file, contains a workaround to bypass the rate limit of the Google Generative AI

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// more instances to bypass the rate limit
const genAI1 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY1!);
const genAI2 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY2!);
const genAI3 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY3!);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// more instances to bypass the rate limit
const model1 = genAI1.getGenerativeModel({ model: "gemini-1.5-flash" });
const model2 = genAI2.getGenerativeModel({ model: "gemini-1.5-flash" });
const model3 = genAI3.getGenerativeModel({ model: "gemini-1.5-flash" });

const MAX_ERRORS = 10;

export const aiSummarise = async (diff: string) => {
  const prompt = [
    `You are an expert programmer, and you are trying to summarize a git diff.
Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example):
\`\`\`
diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef603 100644
--- a/lib/index.js
+++ b/lib/index.js
\`\`\`
This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
Then there is a specifier of the lines that were modified.
A line starting with \`+\` means it was added.
A line that starting with \`-\` means that line was deleted.
A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
It is not part of the diff.
[...]
EXAMPLE SUMMARY COMMENTS:
\`\`\`
* Raised the amount of returned recordings from \`10\` to \`100\`  [packages/server/recordings_api.ts, packages/server/constants.ts]
* Fixed a typo in the github action name [github/workflows/gpt-commit-summarizer.yml]
* Moved the \`octokit\` initialization to a separate file [src/octokit.ts, src/index.ts]
* Added an OpenAI API for completions [packages/utils/apis/openai.ts]
* Lowered numeric tolerance for test files
\`\`\`
Most commits will have less comments than this examples list.
The last comment does not include the file names, because there were more than two relevant files in the hypothetical commit.
Do not include parts of the example in your summary.
It is given only as an example of appropriate comments.`,
    `Please summarise the following diff file: \n\n${diff}`,
  ];

  const models = [model, model1, model2, model3];

  let currentModelIndex = 0;
  let totalErrors = 0;

  while (totalErrors < MAX_ERRORS) {
    try {
      const currentModel = models[currentModelIndex]!;
      const res = await currentModel.generateContent(prompt);
      return res.response.text();
    } catch (error) {
      console.error(`Model ${currentModelIndex} failed: ${error}`);

      // Increment model index, wrapping around to 0 if we reach the end
      currentModelIndex = (currentModelIndex + 1) % models.length;

      // Increment total errors
      totalErrors++;

      // Wait before trying the next model
      await new Promise((resolve) => setTimeout(resolve, 16000));
    }
  }

  return "Rate limited response since i am using a free tier";
};

export const summariseCode = async (doc: Document) => {
  const code = doc.pageContent.slice(0, 10000); // Limiting to 10k characters
  const prompt = [
    `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.`,
    `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
      Here is the code:
      ----
      ${code}
      ----
      Give a summary no more than 200 words of the code above`,
  ];

  const models = [model, model1, model2, model3];

  let currentModelIndex = 0;
  let totalErrors = 0;

  while (totalErrors < MAX_ERRORS) {
    try {
      const currentModel = models[currentModelIndex]!;
      const res = await currentModel.generateContent(prompt);
      return res.response.text();
    } catch (error) {
      console.error(`Model ${currentModelIndex} failed: ${error}`);

      // Increment model index, wrapping around to 0 if we reach the end
      currentModelIndex = (currentModelIndex + 1) % models.length;

      // Increment total errors
      totalErrors++;

      // Wait before trying the next model
      await new Promise((resolve) => setTimeout(resolve, 16000));
    }
  }

  return "Rate limited response since i am using a free tier";
};

// not rate limited
export const generateEmbedding = async (summary: string) => {
  const embeddingModel = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });
  // Embed the summary
  const result = await embeddingModel.embedContent(summary);
  const embedding = result.embedding;
  // Return the embedding - a vector of 768 dimensions and type number[]
  return embedding.values;
};
