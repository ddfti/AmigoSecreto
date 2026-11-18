import React, { useState } from 'react';
import { ArrowDownRight, Gift } from 'lucide-react';
import type { WishlistConfig } from '../types/wishlist';

interface HeroSectionProps {
  config: WishlistConfig;
  itemCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config, itemCount }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      id="topo"
      className="max-w-[1200px] mx-auto px-6 pt-10 pb-14 md:pt-14 md:pb-20 border-b border-border-hairline"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-between py-2">
          <div>
            <p className="text-xs font-medium tracking-wider uppercase text-ink-muted mb-5">
              <span>{config.occasionLabel}</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span>Para {config.recipientName}</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span className="tabular-nums">
                {itemCount} {itemCount === 1 ? 'sugestão' : 'sugestões'}
              </span>
            </p>

            <h1 className="font-display text-[clamp(2.35rem,4.1vw,3.6rem)] font-semibold leading-[1.08] tracking-tight text-ink text-balance mb-6">
              {config.greetingTitle}
            </h1>

            <p className="text-[15px] md:text-base text-ink-muted leading-[1.68] max-w-[54ch]">
              {config.greetingMessage}
            </p>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <a
              href="#sugestoes"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-forest hover:bg-forest-hover rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            >
              <span>Ver sugestões</span>
              <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
            </a>

            <a
              href="#como-funciona"
              className="text-sm font-medium text-ink hover:text-forest transition-colors duration-150 underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Como funciona
            </a>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="w-full aspect-[4/3] lg:aspect-auto lg:h-full min-h-[300px] bg-surface-muted border border-border-hairline rounded-lg overflow-hidden">
            {!imgError && config.heroImageUrl ? (
              <img
                src={config.heroImageUrl}
                alt={`Curadoria de presentes de ${config.recipientName}`}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-surface-muted text-ink-muted">
                <Gift className="w-10 h-10 mb-3 text-forest/70" strokeWidth={1.5} aria-hidden="true" />
                <p className="font-display text-2xl text-ink">{config.brandTitle}</p>
                <p className="text-xs mt-1">{config.occasionLabel}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
