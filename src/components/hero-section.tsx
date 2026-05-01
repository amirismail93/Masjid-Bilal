import { IslamicPattern } from "@/components/islamic-pattern";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function HeroSection({ title, subtitle, children }: HeroSectionProps) {
  return (
    <section className="relative bg-sage overflow-hidden">
      <IslamicPattern />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
