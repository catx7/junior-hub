import * as React from 'react';
import { Shield, ShieldCheck, Mail, Phone, Star, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './tooltip';

type BadgeTier = 'email' | 'phone' | 'id' | 'background' | 'top';

interface TrustBadgeProps {
  tier: BadgeTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const badgeConfig: Record<
  BadgeTier,
  {
    icon: React.ElementType;
    label: string;
    tooltip: string;
    color: string;
  }
> = {
  email: {
    icon: Mail,
    label: 'Email verificat',
    tooltip: 'Adresa de email a fost verificata',
    color: 'text-blue-500',
  },
  phone: {
    icon: Phone,
    label: 'Telefon verificat',
    tooltip: 'Numarul de telefon a fost verificat',
    color: 'text-green-500',
  },
  id: {
    icon: Shield,
    label: 'Identitate verificata',
    tooltip: 'Documentul de identitate a fost verificat de echipa noastra',
    color: 'text-primary',
  },
  background: {
    icon: ShieldCheck,
    label: 'Verificare completa',
    tooltip: 'Cazier judiciar si identitate verificate',
    color: 'text-primary',
  },
  top: {
    icon: Award,
    label: 'Top Provider',
    tooltip: 'Rating 4.8+ si peste 10 lucrari finalizate',
    color: 'text-yellow-500',
  },
};

const sizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

function TrustBadge({ tier, size = 'md', showLabel = false, className }: TrustBadgeProps) {
  const config = badgeConfig[tier];
  const Icon = config.icon;

  const badge = (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Icon className={cn(sizeMap[size], config.color)} />
      {showLabel && <span className="text-xs font-medium">{config.label}</span>}
    </span>
  );

  if (showLabel) return badge;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface TrustBadgesProps {
  emailVerified?: boolean;
  phoneVerified?: boolean;
  idVerified?: boolean;
  backgroundChecked?: boolean;
  isTopProvider?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function TrustBadges({
  emailVerified,
  phoneVerified,
  idVerified,
  backgroundChecked,
  isTopProvider,
  size = 'md',
  className,
}: TrustBadgesProps) {
  const badges: BadgeTier[] = [];
  if (emailVerified) badges.push('email');
  if (phoneVerified) badges.push('phone');
  if (idVerified) badges.push('id');
  if (backgroundChecked) badges.push('background');
  if (isTopProvider) badges.push('top');

  if (badges.length === 0) return null;

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {badges.map((tier) => (
        <TrustBadge key={tier} tier={tier} size={size} />
      ))}
    </div>
  );
}

export { TrustBadge, TrustBadges };
