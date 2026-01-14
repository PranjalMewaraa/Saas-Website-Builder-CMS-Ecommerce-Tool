import Link from "next/link";

type Props = {
  headline: string;
  subhead?: string;
  ctaText?: string;
  ctaHref?: string;
};

export default function HeroV1({ headline, subhead, ctaText, ctaHref }: Props) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
          {headline}
        </h1>

        {subhead ? (
          <p className="mt-3 text-base md:text-lg opacity-85 max-w-2xl">
            {subhead}
          </p>
        ) : null}

        {ctaText && ctaHref ? (
          <div className="mt-6">
            <Link
              href={ctaHref}
              className="inline-flex px-4 py-2 rounded bg-black text-white"
            >
              {ctaText}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
