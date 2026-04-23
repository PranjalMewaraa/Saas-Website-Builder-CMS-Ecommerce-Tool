import { MODULE_REGISTRY, ModuleKey } from "./module";

export type ModuleFlags = Partial<Record<ModuleKey, boolean>>;

export function computeEffectiveModules(args: {
  platformPolicy?: ModuleFlags;
  tenantEntitlements: ModuleFlags;
  storeEnabled: ModuleFlags;
}) {
  const platform = args.platformPolicy ?? {};
  const effective: Record<ModuleKey, boolean> = {} as any;

  (Object.keys(MODULE_REGISTRY) as ModuleKey[]).forEach((k) => {
    const allowedByPlatform = platform[k] !== false; // default true
    const entitled = args.tenantEntitlements[k] === true;
    const enabled = args.storeEnabled[k] === true;

    effective[k] = allowedByPlatform && entitled && enabled;
  });

  // enforce dependencies: if module is on but dependency is off, force it off
  (Object.keys(MODULE_REGISTRY) as ModuleKey[]).forEach((k) => {
    if (!effective[k]) return;
    const deps = MODULE_REGISTRY[k].dependencies;
    for (const d of deps) {
      if (!effective[d]) {
        effective[k] = false;
        break;
      }
    }
  });

  return effective;
}
