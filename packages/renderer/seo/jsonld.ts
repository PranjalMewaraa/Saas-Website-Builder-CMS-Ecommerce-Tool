export function organizationSchema(site: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.primary_domain,
    logo: site.logoUrl,
  };
}

export function webpageSchema(url: string, title: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    name: title,
    description,
  };
}
