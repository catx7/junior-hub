import { Baby, Home, UtensilsCrossed, MoreHorizontal, type LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Baby,
  Home,
  UtensilsCrossed,
  MoreHorizontal,
};

interface CategoryIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export function CategoryIcon({ name, className, style }: CategoryIconProps) {
  const Icon = iconMap[name];
  if (!Icon) return <span className={className}>{name}</span>;
  return <Icon className={className} style={style} />;
}
