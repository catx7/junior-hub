'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, ImageIcon, ArrowLeft, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { getIdToken } from '@/lib/firebase';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  job: {
    id: string;
    title: string;
  } | null;
  participant: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export default function ChatPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const conversationId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();

  // Fetch conversation details
  const { data: conversationData, isLoading: isConversationLoading } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();
      return data.conversations.find((c: any) => c.id === conversationId);
    },
    enabled: isAuthenticated && !!conversationId,
  });

  // Fetch messages
  const { data: messagesData, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: isAuthenticated && !!conversationId,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const token = await getIdToken();
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      setMessage('');
    },
    onError: () => {
      toast.error(t('messages.failedToSend'));
    },
  });

  const messages: Message[] = messagesData?.messages || [];
  const conversation: Conversation | undefined = conversationData;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(message.trim());
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('messages.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('messages.yesterday');
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

  if (isAuthLoading) {
    return (
      <div className="bg-muted/50 flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-muted/50 flex h-[calc(100vh-64px)] items-center justify-center">
        <Card className="p-6 text-center">
          <p className="mb-4">{t('messages.loginToView')}</p>
          <Link href="/login">
            <Button>{t('auth.login')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isConversationLoading || isMessagesLoading) {
    return (
      <div className="bg-muted/50 flex h-[calc(100vh-64px)] flex-col">
        <div className="bg-card flex items-center gap-4 border-b px-4 py-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-1 h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <Skeleton className="h-16 w-64 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="bg-muted/50 flex h-[calc(100vh-64px)] items-center justify-center">
        <Card className="p-6 text-center">
          <p className="mb-4">{t('messages.conversationNotFound')}</p>
          <Link href="/messages">
            <Button>{t('messages.backToMessages')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 flex h-[calc(100vh-64px)] flex-col">
      {/* Header */}
      <div className="bg-card flex items-center gap-4 border-b px-4 py-3">
        <Link href="/messages" className="lg:hidden">
          <ArrowLeft className="h-6 w-6" />
        </Link>

        <Link href={`/profile/${conversation.participant.id}`}>
          <Avatar className="h-10 w-10">
            {conversation.participant.avatar ? (
              <Image
                src={conversation.participant.avatar}
                alt={conversation.participant.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="bg-primary flex h-full w-full items-center justify-center font-bold text-white">
                {conversation.participant.name.charAt(0)}
              </div>
            )}
          </Avatar>
        </Link>

        <div className="flex-1">
          <Link
            href={`/profile/${conversation.participant.id}`}
            className="font-semibold hover:underline"
          >
            {conversation.participant.name}
          </Link>
          {conversation.job && (
            <Link
              href={`/jobs/${conversation.job.id}`}
              className="text-primary block text-sm hover:underline"
            >
              {conversation.job.title}
            </Link>
          )}
        </div>

        {conversation.job && (
          <Link href={`/jobs/${conversation.job.id}`}>
            <Button variant="ghost" size="sm">
              <Info className="h-5 w-5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {groupedMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">{t('messages.noMessagesStart')}</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="mb-4 flex justify-center">
                <span className="bg-card text-muted-foreground rounded-full px-3 py-1 text-xs shadow-sm">
                  {group.date}
                </span>
              </div>
              <div className="space-y-3">
                {group.messages.map((msg, index) => {
                  const isOwn = msg.senderId === user?.id;
                  const showAvatar =
                    !isOwn && (index === 0 || group.messages[index - 1].senderId !== msg.senderId);

                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {!isOwn && (
                        <div className="mr-2 w-8">
                          {showAvatar && (
                            <Avatar className="h-8 w-8">
                              {msg.sender.avatar ? (
                                <Image
                                  src={msg.sender.avatar}
                                  alt={msg.sender.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="bg-primary flex h-full w-full items-center justify-center text-xs font-bold text-white">
                                  {msg.sender.name.charAt(0)}
                                </div>
                              )}
                            </Avatar>
                          )}
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-primary rounded-br-md text-white'
                            : 'bg-card rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p
                          className={`mt-1 text-xs ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-card border-t p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hover:bg-muted flex h-10 w-10 items-center justify-center rounded-full transition"
          >
            <ImageIcon className="text-muted-foreground h-5 w-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('messages.typeMessage')}
            className="bg-muted focus:ring-primary flex-1 rounded-full px-4 py-2 focus:outline-none focus:ring-2"
          />
          <Button
            type="submit"
            size="sm"
            className="h-10 w-10 rounded-full p-0"
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
