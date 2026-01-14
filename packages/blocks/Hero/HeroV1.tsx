import Link from "next/link";
import Image from "next/image";

type Props = {
  headline: string;
  subhead?: string;
  ctaText?: string;
  ctaHref?: string;

  imageUrl?: string;
  imageAlt?: string;
};

export default function HeroV1({
  headline,
  subhead,
  ctaText,
  ctaHref,
  imageUrl,
  imageAlt,
}: Props) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-2 gap-8 items-center">
        <div>
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

        {imageUrl ? (
          <div className="border rounded-xl overflow-hidden">
            <Image
              src={imageUrl}
              alt={imageAlt || ""}
              width={1200}
              height={800}
              className="w-full h-[260px] md:h-[360px] object-cover"
              priority
            />
          </div>
        ) : (
          <div className="hidden md:block opacity-30 text-sm border rounded-xl p-6">
            No hero image selected.
          </div>
        )}
      </div>
    </section>
  );
}
