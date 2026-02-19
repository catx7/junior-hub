'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { conversationsApi } from '@/lib/api';
import { useTranslation } from '@/hooks/use-translation';

// Helper to format relative time
function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
  const [search, setSearch] = useState('');
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationsApi.list(),
  });

  const conversations = data?.conversations || [];

  const filteredConversations = conversations.filter((conv: any) => {
    const searchLower = search.toLowerCase();
    return (
      conv.participant?.name?.toLowerCase().includes(searchLower) ||
      conv.job?.title?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6">
          <h1 className="text-foreground text-2xl font-bold">{t('messages.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('messages.subtitle')}</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('messages.searchConversations')}
            className="pl-10"
          />
        </div>

        {/* Conversations List */}
        {isLoading ? (
          <Card className="divide-y">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </Card>
        ) : filteredConversations.length > 0 ? (
          <Card className="divide-y">
            {filteredConversations.map((conversation: any) => {
              const hasUnread = conversation.unreadCount > 0;
              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className="hover:bg-muted/50 flex items-start gap-4 p-4 transition"
                >
                  <div className="relative">
                    <Avatar className="h-14 w-14">
                      {conversation.participant?.avatar ? (
                        <Image
                          src={conversation.participant.avatar}
                          alt={conversation.participant.name || 'User'}
                          fill
                        />
                      ) : (
                        <div className="bg-primary flex h-full w-full items-center justify-center text-lg font-bold text-white">
                          {conversation.participant?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </Avatar>
                    {hasUnread && (
                      <span className="bg-primary absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={`font-semibold ${
                          hasUnread ? 'text-foreground' : 'text-foreground'
                        }`}
                      >
                        {conversation.participant?.name || 'Unknown User'}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {conversation.lastMessage
                          ? formatRelativeTime(conversation.lastMessage.createdAt)
                          : ''}
                      </span>
                    </div>
                    <p className="text-primary mb-1 truncate text-sm">
                      {conversation.job?.title || 'No job title'}
                    </p>
                    {conversation.lastMessage && (
                      <p
                        className={`truncate text-sm ${
                          hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <MessageSquare className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              {search ? t('messages.noConversationsFound') : t('messages.noConversationsYet')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {search ? t('messages.adjustSearch') : t('messages.connectDesc')}
            </p>
            {!search && (
              <Link
                href="/jobs"
                className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-lg px-6 py-2 font-medium text-white transition"
              >
                {t('messages.browseJobs')}
              </Link>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
