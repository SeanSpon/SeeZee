import { test } from "node:test";
import assert from "node:assert/strict";
import { intakeSchema } from "../src/lib/validation/intake";
import { submitIntake } from "../src/server/intake";
import { NAV_GROUPS, findNavItemForPath } from "../src/lib/admin/nav-data";
import { previewDatabaseReady } from "../src/lib/preview-database";
import type { PrismaClient } from "@prisma/client";

const valid = () =>
  intakeSchema.parse({
    serviceType: "BUSINESS_WEBSITE",
    name: " Jane ",
    email: " JANE@example.com ",
    projectGoals: "A booking website",
    company: "Jane Co",
    importantFeatures: ["Bookings"],
    additionalNotes: "Call in the afternoon",
    attachments: ["https://files.example.com/brief.pdf"],
  });
function database(failRequest = false) {
  const state = {
    leads: [] as any[],
    requests: [] as any[],
    organizations: [] as any[],
  };
  let memberships = 0;
  const tx = {
    organizationMember: {
      findFirst: async () => {
        memberships++;
        return null;
      },
    },
    organization: {
      create: async ({ data }: any) => {
        const row = { id: "org-1", ...data };
        state.organizations.push(row);
        return row;
      },
    },
    lead: {
      findUnique: async ({ where }: any) => {
        const lead = state.leads.find(
          (row) => row.submissionKey === where.submissionKey,
        );
        return lead
          ? {
              ...lead,
              intakeRequest: state.requests.find(
                (row) => row.leadId === lead.id,
              ),
            }
          : null;
      },
      create: async ({ data }: any) => {
        const row = { id: "lead-" + (state.leads.length + 1), ...data };
        state.leads.push(row);
        return row;
      },
    },
    projectRequest: {
      create: async ({ data }: any) => {
        if (failRequest) throw new Error("Request write unavailable");
        const row = { id: "request-" + (state.requests.length + 1), ...data };
        state.requests.push(row);
        return row;
      },
    },
  };
  const db = {
    ...tx,
    $transaction: async (fn: any) => {
      const saved = structuredClone(state);
      try {
        return await fn(tx);
      } catch (error) {
        Object.assign(state, saved);
        throw error;
      }
    },
  } as unknown as PrismaClient;
  return { db, state, memberships: () => memberships };
}
test("normalizes email and rejects missing goals, invalid services, bad hours and unsafe files", () => {
  assert.equal(valid().email, "jane@example.com");
  for (const patch of [
    { projectGoals: " " },
    { email: "bad" },
    { serviceType: "HACK" },
    { estimatedHours: "NaN" },
    { estimatedHours: -1 },
    { attachments: ["javascript:alert(1)"] },
  ])
    assert.equal(
      intakeSchema.safeParse({ ...valid(), ...patch }).success,
      false,
    );
});
test("anonymous submission saves linked records and all structured details without account access", async () => {
  const { db, state, memberships } = database();
  const result = await submitIntake(db, valid(), null);
  assert.equal(result.duplicate, false);
  assert.equal(state.requests[0].leadId, result.leadId);
  assert.equal(state.requests[0].userId, null);
  assert.equal(state.leads[0].userId, null);
  assert.equal(memberships(), 0);
  assert.deepEqual(state.leads[0].metadata.attachments, valid().attachments);
  assert.equal(
    state.leads[0].metadata.additionalNotes,
    "Call in the afternoon",
  );
});
test("identical retry returns the same linked pair while a different brief is accepted", async () => {
  const { db, state } = database();
  const first = await submitIntake(db, valid(), null);
  const retry = await submitIntake(db, valid(), null);
  assert.equal(retry.leadId, first.leadId);
  assert.equal(retry.projectRequestId, first.projectRequestId);
  assert.equal(retry.duplicate, true);
  await submitIntake(db, { ...valid(), projectGoals: "Another project" }, null);
  assert.equal(state.leads.length, 2);
});
test("request write failure rolls back the lead and organization", async () => {
  const { db, state } = database(true);
  await assert.rejects(
    submitIntake(db, valid(), {
      id: "user-1",
      name: "Jane",
      email: "jane@example.com",
    }),
  );
  assert.equal(state.leads.length, 0);
  assert.equal(state.requests.length, 0);
  assert.equal(state.organizations.length, 0);
});
test("authenticated intake keeps the authenticated owner on both records", async () => {
  const { db, state } = database();
  await submitIntake(db, valid(), {
    id: "user-1",
    name: "Jane",
    email: "jane@example.com",
  });
  assert.equal(state.requests[0].userId, "user-1");
  assert.equal(state.leads[0].userId, "user-1");
});
test("navigation selects the deepest exact path without prefix collisions or duplicate destinations", () => {
  assert.equal(
    findNavItemForPath("/admin/finance/expenses")?.item.label,
    "Expenses",
  );
  assert.equal(
    findNavItemForPath("/admin/projects/123")?.item.label,
    "Projects",
  );
  assert.equal(findNavItemForPath("/admin/projectsmith"), undefined);
  const paths = NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => item.href),
  );
  assert.equal(new Set(paths).size, paths.length);
});
test("preview fails closed for production/missing database configuration", () => {
  assert.equal(previewDatabaseReady({ VERCEL_ENV: "preview" }), false);
  assert.equal(
    previewDatabaseReady({
      VERCEL_ENV: "preview",
      DATABASE_URL: "postgresql://u:p@production.example/db",
    }),
    false,
  );
  assert.equal(previewDatabaseReady({ VERCEL_ENV: "production" }), true);
});
