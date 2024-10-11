"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const schema = z.object({
  message: z.string().min(1),
});

export default function ChatInterface() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const userMessage = { role: 'user' as const, content: data.message };
    setMessages(prev => [...prev, userMessage]);
    reset();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: data.message }),
      });
      const aiResponse = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse.message }]);
    } catch (error) {
      console.error('Chat error:', error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <ScrollArea className="h-[400px] mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
              {msg.content}
            </span>
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <Input {...register('message')} placeholder="Type your message..." />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}