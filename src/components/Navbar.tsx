import React from 'react';

interface NavbarProps {
  brandTitle: string;
  onOpenManage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ brandTitle, onOpenManage }) => {
  return (
    <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b border-border-hairline">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <a
          href="#topo"
          className="font-display text-2xl font-semibold tracking-tight text-ink whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest"
        >
          {brandTitle}
        </a>

        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-muted"
        >
          <a
            href="#sugestoes"
            className="hover:text-ink transition-colors duration-150 whitespace-nowrap shrink-0 underline-offset-4 hover:underline"
          >
            Sugestões
          </a>
          <a
            href="#como-funciona"
            className="hover:text-ink transition-colors duration-150 whitespace-nowrap shrink-0 underline-offset-4 hover:underline"
          >
            Como funciona
          </a>
          <a
            href="#sobre"
            className="hover:text-ink transition-colors duration-150 whitespace-nowrap shrink-0 underline-offset-4 hover:underline"
          >
            Sobre a lista
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenManage}
            className="px-4 py-2 text-xs font-semibold tracking-wide text-white bg-forest hover:bg-forest-hover rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            Gerenciar Lista
          </button>
        </div>
      </div>
    </header>
  );
};
