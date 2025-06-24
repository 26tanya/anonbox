// app/api/suggest-messages/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: 'https://api.groq.com/openai/v1', // 🔁 IMPORTANT: Use Groq's base URL
});

export async function POST(req:Request) {
  try {
     await req.json();
   const prompt = `You're helping generate engaging, anonymous prompts for an anonymous messaging platform like AnonBox. The messages users send are meant to spark friendly conversations, collect anonymous feedback, or encourage thoughtful replies — but should always feel safe and welcoming.

    Create a list of three open-ended and professional-to-fun questions, separated by '||'.  Mix topics like general feedback, casual personality questions about the persom whom you are sending to, light advice requests,general feedbacks about work, and imagination-based prompts. 

    Examples:
    
    - you did well in the class presentation!||How about a meetup||I saw your work. i think u could do better? 

    Only return the formatted string of three questions separated by '||'. No intro or explanation. Random ID: ${Math.floor(Math.random() * 10000)}.`


    const chatCompletion = await openai.chat.completions.create({
      model: 'llama3-70b-8192', // or use `llama3-70b-8192` or `gemma-7b-it`
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 150,
    });

    const text = chatCompletion.choices[0].message.content;

    return NextResponse.json({ suggestions: text });
  } catch (error) {
    console.error('Groq Error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
