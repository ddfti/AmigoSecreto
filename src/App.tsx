/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import publishedWishlistRaw from './data/wishlist.json';
import type { GiftItem, WishlistConfig, WishlistData } from './types/wishlist';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GiftCard } from './components/GiftCard';
import { HowItWorksSection } from './components/HowItWorksSection';
import { ManageDrawer } from './components/ManageDrawer';

const IS_EDITABLE = import.meta.env.DEV;
const initialData: WishlistData = publishedWishlistRaw as WishlistData;

export default function App() {
  const [data, setData] = useState<WishlistData>(initialData);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!IS_EDITABLE) return;
    let active = true;
    fetch('/__api/wishlist', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((fresh: WishlistData | null) => {
        if (active && fresh && fresh.config && Array.isArray(fresh.items)) {
          setData(fresh);
        }
      })
      .catch(() => {
        // Keep bundled initialData if dev server endpoint is unavailable
      });
    return () => {
      active = false;
    };
  }, []);

  const persistToProject = useCallback(async (nextData: WishlistData) => {
    if (!IS_EDITABLE) return;
    setIsSaving(true);
    try {
      const response = await fetch('/__api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextData),
      });
      if (!response.ok) {
        setToastMessage('Erro ao gravar alterações em wishlist.json.');
      }
    } catch {
      setToastMessage('Não foi possível salvar no arquivo do projeto.');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const applyAndSave = useCallback(
    (updater: (prev: WishlistData) => WishlistData) => {
      setData((prev) => {
        const next = updater(prev);
        void persistToProject(next);
        return next;
      });
    },
    [persistToProject],
  );

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleAddItem = (newItem: GiftItem) => {
    applyAndSave((prev) => ({
      ...prev,
      items: [newItem, ...prev.items],
    }));
  };

  const handleUpdateItem = (updatedItem: GiftItem) => {
    applyAndSave((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    }));
  };

  const handleDeleteItem = (id: string) => {
    applyAndSave((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleMoveItem = (index: number, direction: -1 | 1) => {
    applyAndSave((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.items.length) return prev;
      const nextItems = [...prev.items];
      const [moved] = nextItems.splice(index, 1);
      nextItems.splice(targetIndex, 0, moved);
      return {
        ...prev,
        items: nextItems,
      };
    });
  };

  const handleUpdateConfig = (nextConfig: WishlistConfig) => {
    applyAndSave((prev) => ({
      ...prev,
      config: nextConfig,
    }));
  };

  const handleImportData = (imported: WishlistData) => {
    applyAndSave(() => imported);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar
        brandTitle={data.config.brandTitle}
        isEditable={IS_EDITABLE}
        onOpenManage={() => setIsDrawerOpen(true)}
      />

      <main className="flex-1">
        <HeroSection config={data.config} itemCount={data.items.length} />

        <section
          id="sugestoes"
          className="max-w-[1200px] mx-auto px-6 py-16 md:py-20"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-ink-muted mb-2.5">
                Vitrine de Sugestões
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink text-balance">
                Clique na imagem para ir direto à loja
              </h2>
            </div>

            {IS_EDITABLE && (
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-ink bg-surface border border-border-hairline hover:bg-surface-muted rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Adicionar produto</span>
                </button>
              </div>
            )}
          </div>

          {data.items.length === 0 ? (
            <div className="bg-surface border border-border-hairline rounded-lg p-12 text-center">
              <p className="font-display text-2xl font-semibold text-ink mb-2">
                Nenhuma sugestão cadastrada ainda
              </p>
              <p className="text-sm text-ink-muted max-w-md mx-auto mb-6">
                {IS_EDITABLE
                  ? 'Adicione produtos com foto e link da loja para que seu amigo secreto possa escolher com facilidade.'
                  : 'Em breve novas sugestões de presente aparecerão por aqui.'}
              </p>
              {IS_EDITABLE && (
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-forest hover:bg-forest-hover rounded-md transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar primeira sugestão</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 md:gap-8">
              {data.items.map((item) => (
                <GiftCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <HowItWorksSection recipientName={data.config.recipientName} />
      </main>

      <footer className="border-t border-border-hairline bg-canvas">
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-ink-muted">
          <p>
            {data.config.brandTitle} · {data.config.occasionLabel}
          </p>
          <div className="flex items-center gap-6">
            <a href="#topo" className="hover:text-ink transition-colors">
              Voltar ao topo
            </a>
            {IS_EDITABLE && (
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="hover:text-ink transition-colors cursor-pointer"
              >
                Gerenciar lista
              </button>
            )}
          </div>
        </div>
      </footer>

      {IS_EDITABLE && (
        <ManageDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          data={data}
          isSaving={isSaving}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onMoveItem={handleMoveItem}
          onUpdateConfig={handleUpdateConfig}
          onImportData={handleImportData}
          onNotify={(msg) => setToastMessage(msg)}
        />
      )}

      {IS_EDITABLE && toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 px-4 py-3 text-xs font-medium text-white bg-ink rounded-md shadow-md"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
