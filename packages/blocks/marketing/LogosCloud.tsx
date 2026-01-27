import React from "react";

export default function LogosCloudV1({ title, logos = [] }: any) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {title && <h3 className="mb-8 text-lg font-medium">{title}</h3>}

        <div className="flex flex-wrap justify-center gap-10 items-center opacity-70">
          {logos.map((logo: string, i: number) => (
            <img key={i} src={logo} className="h-8" />
          ))}
        </div>
      </div>
    </section>
  );
}
