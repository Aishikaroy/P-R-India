import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

export function PageHero({ eyebrow, title, children }: PageHeroProps) {
  return (
    <section className="border-b border-border bg-section">
      <div className="container-site py-14 sm:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {children && (
          <div className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
