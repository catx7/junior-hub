'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Star, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { getIdToken } from '@/lib/firebase';

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: { id: string; name: string; avatar: string | null };
  target: { id: string; name: string; avatar: string | null };
  job: { id: string; title: string };
}

async function fetchAllReviews() {
  const token = await getIdToken();
  const res = await fetch('/api/admin/reviews', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

async function deleteReview(reviewId: string) {
  const token = await getIdToken();
  const res = await fetch(`/api/admin/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to delete review');
  return res.json();
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/50'
          }`}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery<ReviewData[]>({
    queryKey: ['admin-reviews'],
    queryFn: fetchAllReviews,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success('Review deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => {
      toast.error('Failed to delete review');
    },
  });

  const handleDelete = (reviewId: string, authorName: string) => {
    if (
      confirm(
        `Are you sure you want to delete the review by "${authorName}"? This will recalculate the target user's rating.`
      )
    ) {
      deleteMutation.mutate(reviewId);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    return matchesSearch && matchesRating;
  });

  const stats = {
    total: reviews.length,
    avgRating:
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0',
    fiveStar: reviews.filter((r) => r.rating === 5).length,
    oneStar: reviews.filter((r) => r.rating === 1).length,
  };

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">Review Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and moderate all user reviews</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="p-4">
            <p className="text-muted-foreground text-sm">Total Reviews</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-sm">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.avgRating}
              </p>
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-sm">5-Star Reviews</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.fiveStar}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-sm">1-Star Reviews</p>
            <p className="text-destructive text-2xl font-bold">{stats.oneStar}</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by author, target, comment, or job title..."
                className="pl-10"
              />
            </div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="rounded-lg border px-4 py-2"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </Card>

        {/* Reviews Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Review
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Author
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Target
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Job
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-muted-foreground px-6 py-12 text-center">
                      Loading reviews...
                    </td>
                  </tr>
                ) : filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <StarRating rating={review.rating} />
                          <p className="text-foreground mt-1 line-clamp-2 text-sm">
                            {review.comment}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {review.author.avatar ? (
                              <img src={review.author.avatar} alt={review.author.name} />
                            ) : (
                              <div className="bg-primary flex h-full w-full items-center justify-center text-xs font-bold text-white">
                                {review.author.name.charAt(0)}
                              </div>
                            )}
                          </Avatar>
                          <Link
                            href={`/profile/${review.author.id}`}
                            className="text-foreground hover:text-primary text-sm font-medium"
                          >
                            {review.author.name}
                          </Link>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {review.target.avatar ? (
                              <img src={review.target.avatar} alt={review.target.name} />
                            ) : (
                              <div className="bg-primary flex h-full w-full items-center justify-center text-xs font-bold text-white">
                                {review.target.name.charAt(0)}
                              </div>
                            )}
                          </Avatar>
                          <Link
                            href={`/profile/${review.target.id}`}
                            className="text-foreground hover:text-primary text-sm font-medium"
                          >
                            {review.target.name}
                          </Link>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          href={`/jobs/${review.job.id}`}
                          className="text-primary text-sm hover:underline"
                        >
                          {review.job.title}
                        </Link>
                      </td>
                      <td className="text-muted-foreground whitespace-nowrap px-6 py-4 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <Link href={`/jobs/${review.job.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/5"
                            onClick={() => handleDelete(review.id, review.author.name)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-muted-foreground px-6 py-12 text-center">
                      No reviews found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
