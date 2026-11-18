import React, { useState, useEffect } from 'react';
import { ExternalLink, Gift } from 'lucide-react';
import type { GiftItem } from '../types/wishlist';
import { formatCurrencyBRL, normalizeExternalUrl } from '../utils/url';

interface GiftCardProps {
  item: GiftItem;
}

export const GiftCard: React.FC<GiftCardProps> = ({ item }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [item.imageUrl]);

  const safeUrl = normalizeExternalUrl(item.productUrl);
  const priceLabel = formatCurrencyBRL(item.price);

  return (
    <article className="group flex flex-col bg-surface border border-border-hairline rounded-lg overflow-hidden transition-transform duration-150 ease-out hover:-translate-y-0.5">
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Abrir ${item.title} em ${item.storeName || 'loja'} em uma nova aba`}
        className="relative block aspect-[4/3] w-full bg-surface-muted overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        {!imgError && item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-surface-muted text-ink-muted">
            <Gift className="w-8 h-8 mb-2.5 text-forest/70" strokeWidth={1.5} aria-hidden="true" />
            <span className="font-display text-lg text-ink line-clamp-2">{item.title}</span>
          </div>
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-end justify-end p-4"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white tracking-wide">
            <span>Abrir na loja</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </a>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-ink-muted truncate mb-2">
            <span>{item.storeName || 'Loja Online'}</span>
            {item.category ? (
              <>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span>{item.category}</span>
              </>
            ) : null}
          </p>

          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-[17px] font-semibold leading-snug text-ink">
              {item.title}
            </h3>
            <span className="text-[15px] font-medium text-ink tabular-nums whitespace-nowrap shrink-0">
              {priceLabel}
            </span>
          </div>

          {item.note ? (
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              {item.note}
            </p>
          ) : null}
        </div>

        <div className="pt-3 border-t border-border-hairline flex items-center justify-between">
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-hover transition-colors duration-150 whitespace-nowrap"
          >
            <span>Ir para a loja</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
          <span className="text-[11px] text-ink-muted whitespace-nowrap">
            Abre em nova aba
          </span>
        </div>
      </div>
    </article>
  );
};
