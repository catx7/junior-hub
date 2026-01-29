'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Edit2,
  Star,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

export default function ProfilePage() {
  // Mock user data - replace with actual auth state
  const user = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    avatar: null,
    bio: 'Reliable and experienced service provider. Always on time and ready to help! I specialize in babysitting and have CPR certification.',
    location: 'Manhattan, NY',
    rating: 4.8,
    reviewCount: 24,
    jobsCompleted: 32,
    jobsPosted: 15,
    memberSince: 'January 2024',
    isVerified: true,
  };

  const recentJobs = [
    {
      id: '1',
      title: 'Babysitter needed for 2 kids',
      status: 'completed',
      date: 'Jan 15, 2024',
      amount: 75,
    },
    {
      id: '2',
      title: 'Deep cleaning for apartment',
      status: 'in_progress',
      date: 'Jan 18, 2024',
      amount: 150,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} fill />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
              </Avatar>
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{user.rating}</span>
                    </div>
                    <span className="text-gray-500">({user.reviewCount} reviews)</span>
                    {user.isVerified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>

              <p className="text-gray-600 mt-4">{user.bio}</p>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {user.phone}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member since {user.memberSince}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{user.jobsCompleted}</p>
            <p className="text-sm text-gray-500">Jobs Completed</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{user.jobsPosted}</p>
            <p className="text-sm text-gray-500">Jobs Posted</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{user.rating}</p>
            <p className="text-sm text-gray-500">Rating</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{user.reviewCount}</p>
            <p className="text-sm text-gray-500">Reviews</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Jobs</h2>
              <Link href="/my-jobs" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-500">{job.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${job.amount}</p>
                    <Badge
                      variant="outline"
                      className={
                        job.status === 'completed'
                          ? 'text-green-600 border-green-600'
                          : 'text-blue-600 border-blue-600'
                      }
                    >
                      {job.status === 'completed' ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Quick Links */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
            <div className="space-y-2">
              {[
                { href: '/my-jobs', label: 'My Jobs', icon: Briefcase },
                { href: '/reviews', label: 'My Reviews', icon: Star },
                { href: '/settings', label: 'Settings', icon: Settings },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
