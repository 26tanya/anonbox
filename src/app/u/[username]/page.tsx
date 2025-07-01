'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { useCompletion } from 'ai/react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {Toaster} from "@/components/ui/sonner"
import { toast } from "sonner"
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';
import { signOut } from 'next-auth/react';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

// ...your imports remain the same

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const [completion, setCompletion] = useState(initialMessageString);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');
  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });
      toast(response.data.message);
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast('Error', {
        description: axiosError.response?.data.message ?? 'Failed to send message',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    try {
      setIsSuggestLoading(true);
      const res = await fetch('/api/suggest-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ random: Math.random() }),
      });
      const data = await res.json();
      setCompletion(data.suggestions);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsSuggestLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center text-black">
        Public Profile Link
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">
                  Send Anonymous Message to @{username}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none text-black bg-white border border-gray-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled className="bg-black text-white">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !messageContent}
                className="bg-black text-white hover:bg-zinc-800"
              >
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4 bg-black text-white hover:bg-zinc-800"
            disabled={isSuggestLoading}
          >
            Suggest Messages
          </Button>
          <p className="text-black">Click on any message below to select it.</p>
        </div>

        <Card className="bg-zinc-100 text-black border border-zinc-300 shadow-sm rounded-xl">
  <CardHeader>
    <h3 className="text-xl font-semibold text-black">Messages</h3>
  </CardHeader>
  <CardContent className="flex flex-col space-y-4 break-words whitespace-pre-wrap overflow-hidden">
    {error ? (
      <p className="text-red-500">{error.message}</p>
    ) : (
      parseStringMessages(completion).map((message, index) => (
        <button
          key={index}
          onClick={() => handleMessageClick(message)}
          className="w-full text-center bg-white hover:bg-zinc-100 text-black px-4 py-2 rounded-md border border-zinc-300 transition"
        >
          {message}
        </button>
      ))
    )}
  </CardContent>
</Card>

      </div>

      <Separator className="my-6 bg-gray-300" />
      <div className="text-center text-black">
        <div className="mb-4">Get Your Message Board</div>
        <Link href="/sign-up">
          <Button className="bg-black text-white hover:bg-zinc-800">Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}
