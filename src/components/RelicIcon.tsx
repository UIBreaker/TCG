import React from 'react';
import {
  Swords,
  Flame,
  Skull,
  HeartPulse,
  Wind,
  ShieldAlert,
  Zap,
  Snowflake,
  Crosshair,
  Shield,
  Sparkles,
  FlaskConical,
  FlameKindling,
  Compass,
  Heart,
} from 'lucide-react';

interface RelicIconProps {
  icon: string;
  className?: string;
}

export const RelicIcon: React.FC<RelicIconProps> = ({ icon, className = 'w-5 h-5' }) => {
  switch (icon) {
    case 'Swords':
      return <Swords className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Skull':
      return <Skull className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Snowflake':
      return <Snowflake className={className} />;
    case 'ShieldHeart':
      return <Heart className={className} />;
    case 'Crosshair':
      return <Crosshair className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'FlaskConical':
      return <FlaskConical className={className} />;
    case 'FlameKindling':
      return <FlameKindling className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};
