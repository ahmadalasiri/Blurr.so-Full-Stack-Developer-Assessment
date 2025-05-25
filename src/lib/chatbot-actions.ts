export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  userId: string;
}

/**
 * Process user message and generate AI response using API route
 */
export async function processUserMessage(message: string): Promise<string> {
  try {
    // Call the chatbot API route
    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return "Please log in to use the chatbot.";
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Unknown error occurred");
    }

    return data.response;
  } catch (error) {
    console.error("Error processing user message:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again.";
  }
}
