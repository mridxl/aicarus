"use server";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createStreamableValue } from "ai/rsc";
import { streamText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();
  const queryVector = await generateEmbedding(question);

  // Convert the query vector (array of numbers) into a string for use in the database query.
  const vectorQuery = `[${queryVector.join(",")}]`;

  // Query the database to find the most relevant source code files based on the similarity of the question embedding.
  const result = (await db.$queryRaw`
  SELECT "fileName", "sourceCode", "summary",
  1 - ("summaryEmbedding" <-> ${vectorQuery}::vector) AS similarity
  FROM "SourceCodeEmbedding"
  WHERE 1-("summaryEmbedding" <-> ${vectorQuery}::vector) > 0.05 
  AND "projectId" = ${projectId}
  ORDER BY similarity DESC
  LIMIT 10
  `) as { fileName: string; sourceCode: string; summary: string }[];

  console.log(result);

  let context = "";

  for (const doc of result) {
    context += `source: ${doc.fileName} \n Code content:  ${doc.sourceCode} \n summary of file: ${doc.summary} \n`;
  }

  // Query the database to find the most relevant source code files based on the similarity of the question embedding.
  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: `You are an AI code assistant specializing in answering questions about a codebase. Your target audience is a technical intern seeking to understand the codebase.
      ### AI Assistant Traits:
- Expert knowledge, particularly about codebases, software development, and debugging.
- Friendly, articulate, and eager to help.
- Inspiring and detailed in explanations, especially when addressing technical queries.
- Well-mannered and professional in tone.

You are a powerful, human-like AI assistant capable of accurately answering questions when the information is available in the provided context.

### Behavior Guidelines:
1. **Context-Dependent Responses**:  
   - Use the provided CONTEXT BLOCK to inform answers.  
   - If the context does not provide an answer, respond:  
     *"I'm sorry, I don't have the answer to that question based on the provided information."*  
   - Avoid inventing information that is not drawn from the context.  

2. **Response Style**:  
   - Answer in Markdown syntax for clarity.  
   - Include detailed step-by-step explanations and accurate code snippets when applicable.  
   - Avoid apologizing for earlier responses. Instead, clarify or improve answers based on new context.  

START CONTEXT BLOCK  
${context}  
END OF CONTEXT BLOCK  

START QUESTION  
${question}  
END OF QUESTION  

Provide responses that are vivid, accurate, and helpful. Your explanations should enhance the user's understanding of the codebase, ensuring no mistakes.
`,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }
    stream.done();
  })();

  return {
    output: stream.value,
    filesReferences: result,
  };
}
