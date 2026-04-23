import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "./prisma";

// Initialize the Google Generative AI SDK with the provided Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API || "");

/**
 * Custom Error to throw when a Workspace relies on AI but has no tokens.
 */
export class InsufficientTokensError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientTokensError";
  }
}

/**
 * Triggers a Gemini AI Generation mathematically deducting tokens BEFORE resolving.
 * Uses a basic single-shot generation approach suitable for Exam / Content generation.
 */
export async function generateContentWithTokens(
  workspaceId: string,
  systemPrompt: string,
  userPrompt: string,
  tokenCost: number = 1
) {
  // 1. Verify and deduct tokens atomically to prevent race conditions
  const result = await db.$transaction(async (tx) => {
    // Lock or simply check the balance
    const workspace = await tx.workspace.findUnique({
      where: { id: workspaceId },
      select: { tokensBalance: true }
    });

    if (!workspace) throw new Error("Workspace not found.");
    if (workspace.tokensBalance < tokenCost) {
      throw new InsufficientTokensError(`Insufficient AI Tokens. Cost: ${tokenCost}, Available: ${workspace.tokensBalance}`);
    }

    // Deduct the tokens
    await tx.workspace.update({
      where: { id: workspaceId },
      data: { tokensBalance: { decrement: tokenCost } }
    });
    
    return true; // Deduction successful
  });

  // 2. If deduction successful, request Gemini AI
  if (result) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const fullPrompt = `${systemPrompt}\n\nUser Request: ${userPrompt}`;
      
      const response = await model.generateContent(fullPrompt);
      const textResponse = response.response.text();
      
      return textResponse;
    } catch (aiError) {
      // If AI fails, we SHOULD refund the tokens in a robust deployment!
      // Here we will run a compensatory transaction.
      await db.workspace.update({
        where: { id: workspaceId },
        data: { tokensBalance: { increment: tokenCost } }
      });
      
      console.error("Gemini AI failed, refunded tokens.", aiError);
      throw new Error("AI generation failed, tokens have been refunded.");
    }
  }
}
