import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience.1 Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 400,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Gemini Error:', error);
    if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
    }
  }
}
