'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Send, ImageIcon, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  isRead: boolean;
}

export default function ChatPage() {
  const params = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const currentUserId = 'current-user'; // Replace with actual auth

  // Mock data
  const conversation = {
    id: params.id,
    job: {
      id: 'j1',
      title: 'Babysitter needed for 2 kids',
      status: 'OPEN',
    },
    otherUser: {
      id: 'u2',
      name: 'Jane Smith',
      avatar: null,
    },
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi! I saw your job posting for a babysitter. I have 5 years of experience and am CPR certified.',
      senderId: 'u2',
      createdAt: new Date(Date.now() - 3600000),
      isRead: true,
    },
    {
      id: '2',
      content: 'That sounds great! Can you tell me more about your availability?',
      senderId: currentUserId,
      createdAt: new Date(Date.now() - 3000000),
      isRead: true,
    },
    {
      id: '3',
      content: 'I am available this Saturday from 6 PM onwards. I can also provide references if you would like.',
      senderId: 'u2',
      createdAt: new Date(Date.now() - 2400000),
      isRead: true,
    },
    {
      id: '4',
      content: 'Perfect! Saturday works for me. The job is for about 5 hours. Would $75 work for you?',
      senderId: currentUserId,
      createdAt: new Date(Date.now() - 1800000),
      isRead: true,
    },
    {
      id: '5',
      content: 'Yes, that works perfectly! Should I bring any activities for the kids?',
      senderId: 'u2',
      createdAt: new Date(Date.now() - 600000),
      isRead: false,
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      senderId: currentUserId,
      createdAt: new Date(),
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // TODO: Send via API/Socket
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const dateStr = formatDate(msg.createdAt);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, messages: [msg] });
    }
  });

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <Link href="/messages" className="lg:hidden">
          <ArrowLeft className="w-6 h-6" />
        </Link>

        <Avatar className="w-10 h-10">
          {conversation.otherUser.avatar ? (
            <Image
              src={conversation.otherUser.avatar}
              alt={conversation.otherUser.name}
              fill
            />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold">
              {conversation.otherUser.name.charAt(0)}
            </div>
          )}
        </Avatar>

        <div className="flex-1">
          <h2 className="font-semibold">{conversation.otherUser.name}</h2>
          <Link
            href={`/jobs/${conversation.job.id}`}
            className="text-sm text-primary hover:underline"
          >
            {conversation.job.title}
          </Link>
        </div>

        <Link href={`/jobs/${conversation.job.id}`}>
          <Button variant="ghost" size="sm">
            <Info className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="flex justify-center mb-4">
              <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                {group.date}
              </span>
            </div>
            <div className="space-y-3">
              {group.messages.map((msg, index) => {
                const isOwn = msg.senderId === currentUserId;
                const showAvatar = !isOwn && (index === 0 || group.messages[index - 1].senderId !== msg.senderId);

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwn && (
                      <div className="w-8 mr-2">
                        {showAvatar && (
                          <Avatar className="w-8 h-8">
                            {conversation.otherUser.avatar ? (
                              <Image
                                src={conversation.otherUser.avatar}
                                alt={conversation.otherUser.name}
                                fill
                              />
                            ) : (
                              <div className="w-full h-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                                {conversation.otherUser.name.charAt(0)}
                              </div>
                            )}
                          </Avatar>
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-white shadow-sm rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwn ? 'text-white/70' : 'text-gray-400'
                      }`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white border-t p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
          >
            <ImageIcon className="w-5 h-5 text-gray-500" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            type="submit"
            size="sm"
            className="rounded-full w-10 h-10 p-0"
            disabled={!message.trim() || isSending}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
