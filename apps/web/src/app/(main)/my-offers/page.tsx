'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { Send, Clock, CheckCircle2, XCircle, Briefcase } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { offersApi } from '@/lib/api';
import { SERVICE_CATEGORIES } from '@localservices/shared';

type OfferStatus = 'all' | 'pending' | 'accepted' | 'rejected';

export default function MyOffersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<OfferStatus>('all');
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['my-offers', activeTab, user?.id],
    queryFn: () => offersApi.listMine({ status: activeTab === 'all' ? undefined : activeTab }),
    enabled: !!user?.id,
  });

  const offers = data?.data || [];

  const getStatusBadge = (offer: any) => {
    if (offer.isAccepted) {
      return (
        <Badge className="border-green-600 bg-green-50 text-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          {t('myOffers.accepted')}
        </Badge>
      );
    }
    if (offer.job.status !== 'OPEN') {
      return (
        <Badge className="bg-muted/50 text-muted-foreground border-gray-600">
          <XCircle className="mr-1 h-3 w-3" />
          {t('myOffers.notSelected')}
        </Badge>
      );
    }
    return (
      <Badge className="border-yellow-600 bg-yellow-50 text-yellow-600">
        <Clock className="mr-1 h-3 w-3" />
        {t('myOffers.pending')}
      </Badge>
    );
  };

  const tabs: { key: OfferStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: t('myOffers.allOffers'), icon: <Send className="h-4 w-4" /> },
    { key: 'pending', label: t('myOffers.pending'), icon: <Clock className="h-4 w-4" /> },
    { key: 'accepted', label: t('myOffers.accepted'), icon: <CheckCircle2 className="h-4 w-4" /> },
    { key: 'rejected', label: t('myOffers.notSelected'), icon: <XCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">{t('myOffers.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('myOffers.subtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Offers List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex gap-6">
                  <Skeleton className="h-32 w-48 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : offers.length > 0 ? (
          <div className="space-y-4">
            {offers.map((offer: any) => {
              const job = offer.job;
              const categoryInfo =
                SERVICE_CATEGORIES[job.category as keyof typeof SERVICE_CATEGORIES];
              return (
                <Link key={offer.id} href={`/jobs/${job.id}`}>
                  <Card className="p-6 transition hover:shadow-lg">
                    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                      {/* Image */}
                      <div className="bg-muted relative h-32 w-full flex-shrink-0 overflow-hidden rounded-lg md:w-48">
                        {job.images && job.images.length > 0 && job.images[0].url ? (
                          <SafeImage
                            src={job.images[0].url}
                            alt={job.title}
                            fill
                            className="object-cover"
                            fallback={
                              <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                                <Briefcase className="h-12 w-12" />
                              </div>
                            }
                          />
                        ) : (
                          <div className="text-muted-foreground flex h-full items-center justify-center">
                            <Briefcase className="h-12 w-12" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="text-foreground mb-2 text-xl font-semibold">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge
                                style={{
                                  backgroundColor: `${categoryInfo?.color}20`,
                                  color: categoryInfo?.color,
                                }}
                              >
                                {categoryInfo?.label || job.category}
                              </Badge>
                              {getStatusBadge(offer)}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground text-sm">
                              {t('myOffers.yourOffer')}
                            </p>
                            <p className="text-primary text-2xl font-bold">${offer.price}</p>
                            <p className="text-muted-foreground text-sm">
                              {t('jobs.budget')}: ${job.budget}
                            </p>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                            <span>
                              {t('jobs.postedBy')} {job.poster?.name || 'Unknown'}
                            </span>
                            <span>
                              {new Date(offer.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span>
                              {job.offerCount || 0} {t('jobs.offers').toLowerCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Send className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              {t('myOffers.noOffersYet')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === 'all' ? t('myOffers.noOffersSubmitted') : t('myOffers.noStatusOffers')}
            </p>
            <Link
              href="/jobs"
              className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium text-white transition"
            >
              {t('myOffers.browseJobs')}
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
