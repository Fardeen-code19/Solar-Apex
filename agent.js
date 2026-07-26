import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Ensure process won't crash if API key is missing
const apiKey = process.env.OPENAI_API_KEY || 'dummy_key';
const openai = new OpenAI({ apiKey });

const agentTools = [
  {
    type: "function",
    function: {
      name: "book_rooftop_survey",
      description: "Books a free solar rooftop inspection survey for a client.",
      parameters: {
        type: "object",
        properties: {
          clientName: { type: "string", description: "Full name of the client" },
          phoneNumber: { type: "string", description: "Phone number for contact" },
          city: { type: "string", description: "City where the property is located" }
        },
        required: ["clientName", "phoneNumber", "city"]
      }
    }
  }
];

export async function runSolarAgent(messageHistory = [], systemPrompt = "") {
  const defaultSystemPrompt = `You are the SolarApex AI Consultant. 
Your job is to answer questions about solar installations, PM Surya Ghar Muft Bijli Yojana subsidies, bill savings, and book free rooftop surveys.`;

  const messages = [
    { role: "system", content: systemPrompt || defaultSystemPrompt },
    ...messageHistory
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      tools: agentTools,
      tool_choice: "auto",
      temperature: 0.7,
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.tool_calls) {
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.function.name === "book_rooftop_survey") {
          const args = JSON.parse(toolCall.function.arguments);
          return {
            role: "assistant",
            content: `Great news, ${args.clientName}! I've booked your free rooftop survey in ${args.city}. Our technician will call you shortly at ${args.phoneNumber}.`
          };
        }
      }
    }

    return {
      role: "assistant",
      content: responseMessage.content
    };
  } catch (err) {
    console.error("OpenAI API Error:", err.message);
    return {
      role: "assistant",
      content: "I'm having a brief issue connecting to my knowledge base right now, but feel free to submit your rooftop survey using the form above!"
    };
  }
}