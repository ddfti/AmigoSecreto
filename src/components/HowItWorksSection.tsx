import React from 'react';

interface HowItWorksSectionProps {
  recipientName: string;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ recipientName }) => {
  return (
    <>
      <section
        id="como-funciona"
        className="max-w-[1200px] mx-auto px-6 py-16 md:py-20 border-t border-border-hairline"
      >
        <div className="max-w-xl mb-10">
          <p className="text-xs font-medium tracking-wider uppercase text-ink-muted mb-3">
            Guia Rápido
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink text-balance">
            Escolha simples, sem complicação.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          <div className="pt-5 border-t border-border-hairline">
            <h3 className="text-base font-semibold text-ink mb-2">
              01. Explore as sugestões
            </h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Cada item da vitrine traz imagem, loja sugerida, valor aproximado e eventuais preferências de cor ou tamanho.
            </p>
          </div>

          <div className="pt-5 border-t border-border-hairline">
            <h3 className="text-base font-semibold text-ink mb-2">
              02. Clique na imagem
            </h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Ao clicar na fotografia de qualquer produto, a página da loja abre automaticamente em uma nova aba do navegador.
            </p>
          </div>

          <div className="pt-5 border-t border-border-hairline">
            <h3 className="text-base font-semibold text-ink mb-2">
              03. Compre onde preferir
            </h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Você pode finalizar a compra pelo link direto ou usar a sugestão apenas como referência para encontrar em outra loja.
            </p>
          </div>
        </div>
      </section>

      <section
        id="sobre"
        className="max-w-[1200px] mx-auto px-6 py-14 border-t border-border-hairline"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
              Sobre esta curadoria
            </h2>
          </div>
          <div className="md:col-span-8 max-w-[65ch]">
            <p className="text-[15px] text-ink-muted leading-[1.7]">
              Esta lista foi montada por {recipientName} para tornar a troca de presentes do amigo secreto mais prática e certeira. Nenhuma escolha fica presa ou registrada no site — sinta-se à vontade para comparar preços e escolher o que fizer mais sentido para você.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
