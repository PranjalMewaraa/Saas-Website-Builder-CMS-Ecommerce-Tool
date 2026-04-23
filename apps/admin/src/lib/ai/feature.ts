export function isAiSiteCreationEnabledServer() {
  const raw = String(process.env.AI_SITE_CREATION_ENABLED || "true").toLowerCase();
  return raw !== "0" && raw !== "false" && raw !== "off";
}

export function isAiSiteCreationEnabledClient() {
  const raw = String(process.env.NEXT_PUBLIC_AI_SITE_CREATION_ENABLED || "true").toLowerCase();
  return raw !== "0" && raw !== "false" && raw !== "off";
}

export function isAiSiteBuilderModuleEnabled(modules_enabled?: Record<string, boolean>) {
  if (!modules_enabled) return true;
  if (modules_enabled.ai_site_builder === false) return false;
  return true;
}
