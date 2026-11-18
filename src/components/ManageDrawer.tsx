import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Copy,
  Check,
  Upload,
  ExternalLink,
} from 'lucide-react';
import type { GiftItem, WishlistConfig, WishlistData } from '../types/wishlist';
import { createGiftId, isValidProductUrl, normalizeExternalUrl } from '../utils/url';

interface ManageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: WishlistData;
  isSaving: boolean;
  lastSavedAt: string | null;
  onAddItem: (item: GiftItem) => Promise<boolean>;
  onUpdateItem: (item: GiftItem) => Promise<boolean>;
  onDeleteItem: (id: string) => Promise<boolean>;
  onMoveItem: (index: number, direction: -1 | 1) => Promise<boolean>;
  onUpdateConfig: (config: WishlistConfig) => Promise<boolean>;
  onImportData: (data: WishlistData) => Promise<boolean>;
  onNotify: (message: string) => void;
}

type DrawerTab = 'products' | 'presentation' | 'publish';

const STUDIO_IMAGE_PRESETS = [
  {
    label: 'Chaleira Café',
    url: '/src/assets/images/gift_coffee_kettle_1794964312178.jpg',
  },
  {
    label: 'Fone Minimalista',
    url: '/src/assets/images/gift_wireless_headphones_1794964313214.jpg',
  },
  {
    label: 'Livro Design',
    url: '/src/assets/images/gift_design_book_1794964313735.jpg',
  },
  {
    label: 'Capa Presente',
    url: '/src/assets/images/hero_editorial_gifts_1794964312420.jpg',
  },
];

function parseBrazilianPrice(raw: string): number | null {
  const cleaned = raw.replace(/R\$/gi, '').replace(/\s+/g, '').trim();
  if (!cleaned) return null;
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : Number.NaN;
}

export const ManageDrawer: React.FC<ManageDrawerProps> = ({
  isOpen,
  onClose,
  data,
  isSaving,
  lastSavedAt,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onMoveItem,
  onUpdateConfig,
  onImportData,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>('products');

  // Product form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');
  const [previewError, setPreviewError] = useState(false);

  // Config form state
  const [configDraft, setConfigDraft] = useState<WishlistConfig>(data.config);

  // Publish / Export feedback
  const [copiedJson, setCopiedJson] = useState(false);

  useEffect(() => {
    setConfigDraft(data.config);
  }, [data.config]);

  useEffect(() => {
    setPreviewError(false);
  }, [imageUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetProductForm = () => {
    setEditingId(null);
    setTitle('');
    setStoreName('');
    setCategory('');
    setProductUrl('');
    setImageUrl('');
    setPriceInput('');
    setNote('');
    setFormError('');
  };

  const handleEditClick = (item: GiftItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setStoreName(item.storeName);
    setCategory(item.category);
    setProductUrl(item.productUrl);
    setImageUrl(item.imageUrl);
    setPriceInput(item.price ? String(item.price) : '');
    setNote(item.note ?? '');
    setFormError('');
    setActiveTab('products');
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedTitle = title.trim();
    const trimmedUrl = productUrl.trim();

    if (!trimmedTitle) {
      setFormError('Informe o nome do produto.');
      return;
    }

    if (!trimmedUrl || !isValidProductUrl(trimmedUrl)) {
      setFormError('Informe um link válido da loja (ex: https://www.amazon.com.br/...).');
      return;
    }

    const parsedPrice = parseBrazilianPrice(priceInput);

    if (priceInput.trim() && (parsedPrice === null || Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      setFormError('Informe um valor numérico válido para o preço (ex: 199,90).');
      return;
    }

    const nextItem: GiftItem = {
      id: editingId ?? createGiftId(),
      title: trimmedTitle,
      storeName: storeName.trim() || 'Loja Online',
      category: category.trim(),
      productUrl: normalizeExternalUrl(trimmedUrl),
      imageUrl: imageUrl.trim(),
      price: parsedPrice && parsedPrice > 0 ? parsedPrice : null,
      note: note.trim(),
    };

    const ok = editingId
      ? await onUpdateItem(nextItem)
      : await onAddItem(nextItem);

    if (ok) {
      onNotify(
        editingId
          ? 'Sugestão atualizada e salva em wishlist.json.'
          : 'Sugestão adicionada e salva em wishlist.json.',
      );
      resetProductForm();
    } else {
      setFormError('Não foi possível salvar no arquivo do projeto. Recarregue a página e tente novamente.');
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onUpdateConfig({
      ...configDraft,
      brandTitle: configDraft.brandTitle.trim() || 'Curadoria de Presentes',
      recipientName: configDraft.recipientName.trim() || 'Amigo Secreto',
      occasionLabel: configDraft.occasionLabel.trim() || 'Amigo Secreto',
      greetingTitle:
        configDraft.greetingTitle.trim() ||
        'Se você me tirou, preparei algumas ideias para facilitar sua escolha.',
      greetingMessage: configDraft.greetingMessage.trim(),
      heroImageUrl: configDraft.heroImageUrl.trim(),
    });
    if (ok) {
      onNotify('Apresentação salva em wishlist.json.');
    }
  };

  const serializedJson = JSON.stringify(data, null, 2);

  const handleDownloadJson = () => {
    const blob = new Blob([serializedJson + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'wishlist.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    onNotify('Backup wishlist.json baixado.');
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(serializedJson);
      setCopiedJson(true);
      onNotify('JSON copiado para a área de transferência.');
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      onNotify('Não foi possível copiar automaticamente. Use o botão de download.');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as WishlistData;
        if (!parsed || !parsed.config || !Array.isArray(parsed.items)) {
          onNotify('Arquivo inválido: estrutura de wishlist.json não reconhecida.');
          return;
        }
        const ok = await onImportData(parsed);
        if (ok) {
          onNotify('Lista importada e salva em wishlist.json.');
        }
      } catch {
        onNotify('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div
        className="fixed inset-0 bg-ink/35 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="relative z-10 w-full max-w-[540px] h-full bg-surface border-l border-border-hairline flex flex-col">
        <div className="px-6 py-5 border-b border-border-hairline flex items-center justify-between gap-4">
          <div>
            <h2 id="drawer-title" className="font-display text-2xl font-semibold text-ink">
              Gerenciar Lista
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              {isSaving
                ? 'Salvando alterações em wishlist.json...'
                : lastSavedAt
                  ? `Salvo em src/data/wishlist.json às ${lastSavedAt}`
                  : 'Tudo que você salvar aqui vai junto no próximo commit'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel"
            className="w-10 h-10 flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4 pb-3 border-b border-border-hairline">
          <div className="grid grid-cols-3 gap-1 p-1 bg-surface-muted rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Produtos ({data.items.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presentation')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'presentation'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Apresentação
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('publish')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'publish'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              GitHub & Vercel
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === 'products' && (
            <div className="space-y-8">
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">
                    {editingId ? 'Editar sugestão' : 'Adicionar nova sugestão'}
                  </h3>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="text-xs font-medium text-ink-muted hover:text-ink underline cursor-pointer"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>

                {formError && (
                  <p role="alert" className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {formError}
                  </p>
                )}

                <div>
                  <label htmlFor="gift-title" className="block text-xs font-medium text-ink mb-1.5">
                    Nome do produto *
                  </label>
                  <input
                    id="gift-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Cafeteira Prensa Francesa 600ml"
                    className="w-full px-3.5 py-2.5 text-sm bg-canvas border border-border-hairline rounded-md focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label htmlFor="gift-url" className="block text-xs font-medium text-ink mb-1.5">
                    Link da loja (abre ao clicar na imagem) *
                  </label>
                  <input
                    id="gift-url"
                    type="text"
                    required
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://www.amazon.com.br/..."
                    className="w-full px-3.5 py-2.5 text-sm bg-canvas border border-border-hairline rounded-md focus:outline-none focus:border-forest"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="gift-store" className="block text-xs font-medium text-ink mb-1.5">
                      Nome da loja
                    </label>
                    <input
                      id="gift-store"
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Ex: Amazon Brasil"
                      className="w-full px-3.5 py-2.5 text-sm bg-canvas border border-border-hairline rounded-md focus:outline-none focus:border-forest"
                    />
                  </div>
                  <div>
                    <label htmlFor="gift-price" className="block text-xs font-medium text-ink mb-1.5">
                      Preço estimado (R$)
                    </label>
                    <input
                      id="gift-price"
                      type="text"
                      inputMode="decimal"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      placeholder="Ex: 199.90"
                      className="w-full px-3.5 py-2.5 text-sm bg-canvas border border-border-hairline rounded-md focus:outline-none focus:border-forest tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="gift-category" className="block text-xs font-medium text-ink mb-1.5">
                      Categoria
                    </label>
                    <input
                      id="gift-category"
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Ex: Casa, Áudio, Moda"
                      className="w-full px-3.5 py-2.5 text-sm bg-canvas border border-border-hairline rounded-md focus:outline-none focus:border-forest"
                    />
                  </div>
                  <div>
                    <label htmlFor="gift-note" className="block text-xs font-medium text-ink mb-1.5">
                      Observação (cor/tamanho)
                    </label>
                    <input
                      id="gift-note"
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ex: Tamanho M, cor preta"
                      className="w-full px-3.5 py-2.5 text-sm bg-canvas border border-border-hairline rounded-md focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="gift-image" className="block text-xs font-medium text-ink mb-1.5">
                    URL da imagem do produto
                  </label>
                  <input
                    id="gift-image"
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... (cole o endereço da imagem da loja)"
                    className="w-full px-3.5 py-2.5 text-sm bg-canvas border border-border-hairline rounded-md focus:outline-none focus:border-forest"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-ink-muted">Exemplos prontos:</span>
                    {STUDIO_IMAGE_PRESETS.slice(0, 3).map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className="text-[11px] font-medium text-forest hover:underline cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {imageUrl.trim() && (
                  <div className="border border-border-hairline rounded-md overflow-hidden bg-surface-muted aspect-[4/3] max-w-[220px]">
                    {!previewError ? (
                      <img
                        src={imageUrl.trim()}
                        alt="Pré-visualização do produto"
                        referrerPolicy="no-referrer"
                        onError={() => setPreviewError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-ink-muted">
                        Não foi possível pré-visualizar esta URL, mas um placeholder elegante será exibido na vitrine.
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-forest hover:bg-forest-hover rounded-md transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingId ? 'Salvar alterações' : 'Adicionar à vitrine'}</span>
                </button>
              </form>

              <div className="pt-6 border-t border-border-hairline">
                <h3 className="text-sm font-semibold text-ink mb-4">
                  Itens na vitrine ({data.items.length})
                </h3>

                {data.items.length === 0 ? (
                  <p className="text-sm text-ink-muted">
                    Nenhum produto cadastrado ainda. Adicione o primeiro item acima.
                  </p>
                ) : (
                  <ul className="divide-y divide-border-hairline border-t border-b border-border-hairline">
                    {data.items.map((item, idx) => (
                      <li key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink truncate">{item.title}</p>
                          <p className="text-xs text-ink-muted truncate mt-0.5">
                            {item.storeName}
                            {item.price ? ` · R$ ${item.price.toFixed(2).replace('.', ',')}` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={normalizeExternalUrl(item.productUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Testar link da loja"
                            aria-label={`Testar link de ${item.title}`}
                            className="w-8 h-8 flex items-center justify-center rounded text-ink-muted hover:text-ink hover:bg-surface-muted"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => onMoveItem(idx, -1)}
                            disabled={idx === 0}
                            title="Mover para cima"
                            aria-label={`Mover ${item.title} para cima`}
                            className="w-8 h-8 flex items-center justify-center rounded text-ink-muted hover:text-ink hover:bg-surface-muted disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveItem(idx, 1)}
                            disabled={idx === data.items.length - 1}
                            title="Mover para baixo"
                            aria-label={`Mover ${item.title} para baixo`}
                            className="w-8 h-8 flex items-center justify-center rounded text-ink-muted hover:text-ink hover:bg-surface-muted disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditClick(item)}
                            title="Editar produto"
                            aria-label={`Editar ${item.title}`}
                            className="w-8 h-8 flex items-center justify-center rounded text-ink-muted hover:text-forest hover:bg-surface-muted cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await onDeleteItem(item.id);
                              if (editingId === item.id) resetProductForm();
                              if (ok) onNotify('Sugestão removida e salva em wishlist.json.');
                            }}
                            title="Remover produto"
                            aria-label={`Remover ${item.title}`}
                            className="w-8 h-8 flex items-center justify-center rounded text-ink-muted hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === 'presentation' && (
            <form onSubmit={handleConfigSubmit} className="space-y-4">
              <p className="text-xs text-ink-muted leading-relaxed">
                Personalize como seu amigo secreto enxerga a página inicial ao acessar o link publicado na Vercel.
              </p>

              <div>
                <label htmlFor="cfg-brand" className="block text-xs font-medium text-ink mb-1.5">
                  Título da barra superior
                </label>
                <input
                  id="cfg-brand"
                  type="text"
                  value={configDraft.brandTitle}
                  onChange={(e) => setConfigDraft({ ...configDraft, brandTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-canvas border border-border-hairline rounded-md focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cfg-name" className="block text-xs font-medium text-ink mb-1.5">
                    Seu nome
                  </label>
                  <input
                    id="cfg-name"
                    type="text"
                    value={configDraft.recipientName}
                    onChange={(e) => setConfigDraft({ ...configDraft, recipientName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-canvas border border-border-hairline rounded-md focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label htmlFor="cfg-occasion" className="block text-xs font-medium text-ink mb-1.5">
                    Ocasião
                  </label>
                  <input
                    id="cfg-occasion"
                    type="text"
                    value={configDraft.occasionLabel}
                    onChange={(e) => setConfigDraft({ ...configDraft, occasionLabel: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-canvas border border-border-hairline rounded-md focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cfg-title" className="block text-xs font-medium text-ink mb-1.5">
                  Manchete de boas-vindas
                </label>
                <textarea
                  id="cfg-title"
                  rows={2}
                  value={configDraft.greetingTitle}
                  onChange={(e) => setConfigDraft({ ...configDraft, greetingTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-canvas border border-border-hairline rounded-md focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label htmlFor="cfg-message" className="block text-xs font-medium text-ink mb-1.5">
                  Mensagem para quem te tirou
                </label>
                <textarea
                  id="cfg-message"
                  rows={4}
                  value={configDraft.greetingMessage}
                  onChange={(e) => setConfigDraft({ ...configDraft, greetingMessage: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-canvas border border-border-hairline rounded-md focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label htmlFor="cfg-hero-img" className="block text-xs font-medium text-ink mb-1.5">
                  Imagem de capa (opcional)
                </label>
                <input
                  id="cfg-hero-img"
                  type="text"
                  value={configDraft.heroImageUrl}
                  onChange={(e) => setConfigDraft({ ...configDraft, heroImageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-canvas border border-border-hairline rounded-md focus:outline-none focus:border-forest"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-forest hover:bg-forest-hover rounded-md transition-colors cursor-pointer"
              >
                Aplicar apresentação
              </button>
            </form>
          )}

          {activeTab === 'publish' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-ink mb-2">
                  Pronto para Commit no GitHub & Deploy na Vercel
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Todos os produtos e textos cadastrados aqui são salvos diretamente no arquivo{' '}
                  <code className="px-1.5 py-0.5 bg-surface-muted rounded text-[11px]">
                    src/data/wishlist.json
                  </code>{' '}
                  deste projeto.
                </p>
              </div>

              <ol className="space-y-3 text-xs text-ink leading-relaxed border-t border-b border-border-hairline py-4">
                <li>
                  <strong>1. Cadastre e organize por aqui</strong> — cada item adicionado ou editado já é gravado automaticamente nos arquivos do projeto.
                </li>
                <li>
                  <strong>2. Faça o commit e push para o GitHub</strong> — seus itens e alterações vão junto no mesmo commit.
                </li>
                <li>
                  <strong>3. Acesse pela Vercel</strong> — no site publicado, os botões de edição ficam ocultos automaticamente, exibindo apenas a vitrine limpa para seu amigo secreto.
                </li>
              </ol>

              <div className="pt-2 space-y-3">
                <h4 className="text-xs font-semibold text-ink">Backup opcional (JSON)</h4>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-ink bg-surface border border-border-hairline hover:bg-surface-muted rounded-md transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar cópia de backup (wishlist.json)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-ink bg-surface border border-border-hairline hover:bg-surface-muted rounded-md transition-colors cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'JSON copiado' : 'Copiar conteúdo JSON'}</span>
                </button>

                <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-ink bg-surface border border-border-hairline hover:bg-surface-muted rounded-md transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar arquivo wishlist.json</span>
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
