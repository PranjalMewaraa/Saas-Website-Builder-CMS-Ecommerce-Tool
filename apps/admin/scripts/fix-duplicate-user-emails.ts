import { existsSync } from "node:fs";
import { join } from "node:path";

type UserRow = {
  _id: string;
  tenant_id: string;
  email: string;
  created_at?: Date;
};

type PlannedChange = {
  user_id: string;
  tenant_id: string;
  oldEmail: string;
  newEmail: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sanitizeLocalPart(text: string) {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return cleaned || "user";
}

function parseEmail(email: string) {
  const normalized = normalizeEmail(email);
  const at = normalized.lastIndexOf("@");
  if (at <= 0 || at === normalized.length - 1) {
    return { local: sanitizeLocalPart(normalized), domain: "example.local" };
  }
  return {
    local: sanitizeLocalPart(normalized.slice(0, at)),
    domain: normalized.slice(at + 1),
  };
}

function compareUsers(a: UserRow, b: UserRow) {
  const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
  const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
  if (ta !== tb) return ta - tb;
  return a._id.localeCompare(b._id);
}

function buildCandidateEmail(baseLocal: string, tenantId: string, domain: string, attempt: number) {
  const tenant = sanitizeLocalPart(tenantId);
  const suffix = attempt === 0 ? `+${tenant}` : `+${tenant}-${attempt}`;
  return `${baseLocal}${suffix}@${domain}`;
}

async function run() {
  loadEnvFiles();
  const apply = process.argv.includes("--apply");
  const { getMongoDb } = await import("@acme/db-mongo");
  const db = await getMongoDb();
  const users = db.collection<UserRow>("users");

  const allUsers = await users
    .find({}, { projection: { _id: 1, tenant_id: 1, email: 1, created_at: 1 } })
    .toArray();

  const byEmail = new Map<string, UserRow[]>();
  const usedEmails = new Set<string>();

  for (const user of allUsers) {
    const normalized = normalizeEmail(user.email);
    usedEmails.add(normalized);
    const list = byEmail.get(normalized);
    if (list) {
      list.push(user);
    } else {
      byEmail.set(normalized, [user]);
    }
  }

  const duplicateGroups = Array.from(byEmail.values()).filter((group) => group.length > 1);

  if (duplicateGroups.length === 0) {
    console.log("No duplicate emails found.");
    return;
  }

  const planned: PlannedChange[] = [];

  for (const group of duplicateGroups) {
    const sorted = [...group].sort(compareUsers);
    const keeper = sorted[0];
    const keeperEmail = normalizeEmail(keeper.email);
    usedEmails.add(keeperEmail);

    for (const user of sorted.slice(1)) {
      const oldEmail = normalizeEmail(user.email);
      usedEmails.delete(oldEmail);

      const parsed = parseEmail(oldEmail);
      let attempt = 0;
      let candidate = buildCandidateEmail(parsed.local, user.tenant_id, parsed.domain, attempt);

      while (usedEmails.has(candidate)) {
        attempt += 1;
        candidate = buildCandidateEmail(parsed.local, user.tenant_id, parsed.domain, attempt);
      }

      planned.push({
        user_id: user._id,
        tenant_id: user.tenant_id,
        oldEmail,
        newEmail: candidate,
      });
      usedEmails.add(candidate);
    }
  }

  console.log(`Found ${duplicateGroups.length} duplicate email group(s).`);
  console.log(`Planned ${planned.length} email update(s).`);

  for (const change of planned) {
    console.log(`${change.user_id} [${change.tenant_id}] ${change.oldEmail} -> ${change.newEmail}`);
  }

  if (!apply) {
    console.log("\nDry-run only. Re-run with --apply to persist these changes.");
    return;
  }

  const now = new Date();
  for (const change of planned) {
    await users.updateOne(
      { _id: change.user_id },
      {
        $set: {
          email: change.newEmail,
          updated_at: now,
        },
      }
    );
  }

  console.log("\nDuplicate email fix applied successfully.");
}

function loadEnvFiles() {
  const loader = (process as any).loadEnvFile as ((path: string) => void) | undefined;
  if (!loader) return;

  const cwd = process.cwd();
  const candidates = [
    join(cwd, ".env.local"),
    join(cwd, ".env"),
    join(cwd, "../../.env.local"),
    join(cwd, "../../.env"),
  ];

  for (const file of candidates) {
    if (existsSync(file)) {
      loader(file);
    }
  }
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
