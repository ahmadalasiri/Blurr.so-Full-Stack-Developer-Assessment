import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateAIResponse } from "@/lib/ai-responses";

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    } // Generate AI response with user context
    const userForAI = {
      id: session.user.id,
      name: session.user.name || undefined,
      email: session.user.email || undefined,
    };
    const response = await generateAIResponse(message, userForAI);

    // Log the interaction for analytics
    console.log(`Chat interaction - User: ${session.user.id}, Message: ${message}`);

    return NextResponse.json({
      response,
      success: true,
    });
  } catch (error) {
    console.error("Error in chatbot API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
