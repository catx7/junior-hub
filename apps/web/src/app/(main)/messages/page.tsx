'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';

interface Conversation {
  id: string;
  jobTitle: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
}

export default function MessagesPage() {
  const [search, setSearch] = useState('');

  // Mock data - replace with actual API call
  const conversations: Conversation[] = [
    {
      id: '1',
      jobTitle: 'Babysitter needed for 2 kids',
      otherUser: {
        id: 'u1',
        name: 'Jane Smith',
        avatar: null,
      },
      lastMessage: {
        content: 'Hi! I am interested in the babysitting job. I have 5 years of experience.',
        createdAt: '2 min ago',
        isRead: false,
      },
    },
    {
      id: '2',
      jobTitle: 'Deep cleaning for apartment',
      otherUser: {
        id: 'u2',
        name: 'Mike Johnson',
        avatar: null,
      },
      lastMessage: {
        content: 'When would you like me to come? I am available this week.',
        createdAt: '1 hour ago',
        isRead: true,
      },
    },
    {
      id: '3',
      jobTitle: 'Homemade Romanian dinner',
      otherUser: {
        id: 'u3',
        name: 'Elena Popescu',
        avatar: null,
      },
      lastMessage: {
        content: 'I can prepare sarmale and mici for your dinner party!',
        createdAt: 'Yesterday',
        isRead: true,
      },
    },
    {
      id: '4',
      jobTitle: 'Weekly house cleaning',
      otherUser: {
        id: 'u4',
        name: 'Sarah Williams',
        avatar: null,
      },
      lastMessage: {
        content: 'Thank you for choosing me! See you next Monday.',
        createdAt: '2 days ago',
        isRead: true,
      },
    },
  ];

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.otherUser.name.toLowerCase().includes(search.toLowerCase()) ||
      conv.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">
            Your conversations with service providers and clients
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="pl-10"
          />
        </div>

        {/* Conversations List */}
        {filteredConversations.length > 0 ? (
          <Card className="divide-y">
            {filteredConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="flex items-start gap-4 p-4 hover:bg-gray-50 transition"
              >
                <div className="relative">
                  <Avatar className="w-14 h-14">
                    {conversation.otherUser.avatar ? (
                      <Image
                        src={conversation.otherUser.avatar}
                        alt={conversation.otherUser.name}
                        fill
                      />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center text-white text-lg font-bold">
                        {conversation.otherUser.name.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  {!conversation.lastMessage.isRead && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold ${
                      !conversation.lastMessage.isRead ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {conversation.otherUser.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {conversation.lastMessage.createdAt}
                    </span>
                  </div>
                  <p className="text-sm text-primary truncate mb-1">
                    {conversation.jobTitle}
                  </p>
                  <p className={`text-sm truncate ${
                    !conversation.lastMessage.isRead
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-500'
                  }`}>
                    {conversation.lastMessage.content}
                  </p>
                </div>
              </Link>
            ))}
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-500 mb-6">
              When you connect with service providers or clients, your conversations will appear here
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Browse Jobs
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
