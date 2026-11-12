import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightMode?: boolean; // true if placed on dark primary background
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  lightMode = false,
  className = ''
}) => {
  const iconSizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const titleSizeClasses = {
    sm: 'text-sm',
    md: 'text-base font-semibold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-bold'
  };

  const primaryFill = lightMode ? '#E0FFC2' : '#064734';
  const secondaryFill = lightMode ? '#FFFFFF' : '#E0FFC2';
  const outlineStroke = lightMode ? '#E0FFC2' : '#064734';
  const backgroundFill = lightMode ? 'rgba(224, 255, 194, 0.12)' : 'rgba(6, 71, 52, 0.06)';

  const emblemSvg = (
    <svg
      viewBox="0 0 100 100"
      className={`${iconSizeClasses[size]} shrink-0 transition-transform duration-200 group-hover:scale-105`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Nyange Radjabu Family Emblem"
    >
      {/* Outer decorative ring with Rwandan Imigongo chevron accents */}
      <circle
        cx="50"
        cy="50"
        r="47"
        stroke={outlineStroke}
        strokeWidth="2"
        fill={backgroundFill}
      />
      <circle
        cx="50"
        cy="50"
        r="43"
        stroke={outlineStroke}
        strokeWidth="0.75"
        strokeDasharray="2 3"
      />

      {/* Islamic 8-Pointed Star Motif (Rub el Hizb subtle framing) */}
      <path
        d="M50 8 L54 18 L64 14 L61 24 L71 27 L64 34 L72 41 L62 45 L67 55 L57 55 L57 65 L50 60 L43 65 L43 55 L33 55 L38 45 L28 41 L36 34 L29 27 L39 24 L36 14 L46 18 Z"
        stroke={primaryFill}
        strokeWidth="0.8"
        strokeOpacity="0.35"
        fill="none"
      />

      {/* Roots / Base Pedestal representing Level 0 Patriarch */}
      <path
        d="M32 78 C38 74 44 76 50 78 C56 76 62 74 68 78 C65 83 35 83 32 78 Z"
        fill={primaryFill}
      />
      <path
        d="M44 78 L50 86 L56 78"
        stroke={primaryFill}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Central Majestic Tree Trunk (Lineage Foundation) */}
      <path
        d="M48 50 C48 62 46 72 43 78 L57 78 C54 72 52 62 52 50 Z"
        fill={primaryFill}
      />

      {/* Spreading Generational Branches (Level 1 to 5) */}
      {/* Left primary branch */}
      <path
        d="M49 54 C42 50 34 50 24 58 C29 50 36 44 47 46"
        stroke={primaryFill}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right primary branch */}
      <path
        d="M51 54 C58 50 66 50 76 58 C71 50 64 44 53 46"
        stroke={primaryFill}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center ascending branch towards crescent/star crown */}
      <path
        d="M49 46 C47 38 44 32 40 26 C46 30 50 35 50 42 C50 35 54 30 60 26 C56 32 53 38 51 46"
        fill={primaryFill}
      />

      {/* Rwandan Imigongo Geometric Diamonds / Olive leaves (representing the branches) */}
      <polygon points="24,56 20,50 24,44 28,50" fill={secondaryFill} stroke={primaryFill} strokeWidth="1.2" />
      <polygon points="36,43 32,38 36,33 40,38" fill={secondaryFill} stroke={primaryFill} strokeWidth="1.2" />
      <polygon points="50,25 46,20 50,15 54,20" fill={secondaryFill} stroke={primaryFill} strokeWidth="1.2" />
      <polygon points="64,43 60,38 64,33 68,38" fill={secondaryFill} stroke={primaryFill} strokeWidth="1.2" />
      <polygon points="76,56 72,50 76,44 80,50" fill={secondaryFill} stroke={primaryFill} strokeWidth="1.2" />

      {/* Subtle Islamic Crescent Crown */}
      <path
        d="M43 14 C46 12 54 12 57 14 C54 16 46 16 43 14 Z"
        fill={secondaryFill}
        stroke={primaryFill}
        strokeWidth="0.8"
      />
      {/* Center seed of unity */}
      <circle cx="50" cy="50" r="3.5" fill={secondaryFill} stroke={primaryFill} strokeWidth="1.5" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{emblemSvg}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {emblemSvg}
      <div className="flex flex-col leading-none">
        <span
          className={`font-serif tracking-tight ${titleSizeClasses[size]} ${
            lightMode ? 'text-white' : 'text-[#064734]'
          }`}
        >
          NYANGE RADJABU
        </span>
        <span
          className={`text-[10px] md:text-[11px] font-medium tracking-widest uppercase mt-0.5 ${
            lightMode ? 'text-[#E0FFC2]' : 'text-[#064734]/80'
          }`}
        >
          Family Heritage
        </span>
      </div>
    </div>
  );
};
