import { z } from 'zod';
import { contentEquals } from './domain';
import { createSeedState } from './seed';
import type { DemoState } from './types';

export const STORAGE_KEY = 'pr-review-studio:state:v1';

const text = z.string().max(100_000);
const id = z.string().min(1).max(200);
const timestamp = z.string().datetime();
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Coverage requires a valid calendar date');
const locale = z.enum(['en', 'ar']);
const content = z.object({ title: text, paragraphs: z.array(text).min(1).max(200) });
const version = content.extend({ id, number: z.number().int().positive(), createdAt: timestamp, note: text });
const campaign = z.object({
  id, name: z.string().min(1).max(200), brief: text, market: z.string().min(1).max(200), language: locale,
  status: z.enum(['draft', 'in-review', 'approved', 'changes-requested']), content,
  versions: z.array(version).min(1).max(1000),
  comments: z.array(z.object({ id, text, createdAt: timestamp, paragraph: z.number().int().nonnegative().nullable() })).max(5000),
  activity: z.array(z.object({ id, type: z.string().min(1).max(100), text, createdAt: timestamp })).max(10000),
  createdAt: timestamp, updatedAt: timestamp, approvedAt: timestamp.nullable(),
}).refine((item) => item.status === 'approved' ? item.approvedAt !== null : item.approvedAt === null, 'Approval must match workflow status')
  .refine((item) => new Set(item.versions.map((entry) => entry.id)).size === item.versions.length, 'Version identifiers must be unique')
  .refine((item) => item.versions.every((entry, index) => index === 0 || entry.number > item.versions[index - 1].number), 'Versions must be ordered')
  .refine((item) => {
    const latest = item.versions.at(-1);
    return latest !== undefined && contentEquals(item.content, latest);
  }, 'Current saved content must match the latest version');

export const demoStateSchema = z.object({
  schemaVersion: z.literal(1), locale,
  campaigns: z.array(campaign).max(1000),
  agents: z.array(z.object({ id: z.enum(['writer', 'researcher', 'monitor']), active: z.boolean(), runs: z.number().int().nonnegative(), lastRunAt: timestamp.nullable() })).length(3),
  coverage: z.array(z.object({ id, outlet: text, headline: text, sentiment: z.enum(['positive', 'neutral', 'negative']), date: calendarDate, campaignId: id, excerpt: text })).max(5000),
}).refine((state) => new Set(state.campaigns.map((item) => item.id)).size === state.campaigns.length, 'Campaign identifiers must be unique')
  .refine((state) => new Set(state.agents.map((item) => item.id)).size === 3, 'All three agents must be present')
  .refine((state) => state.coverage.every((item) => state.campaigns.some((entry) => entry.id === item.campaignId)), 'Coverage must reference an existing campaign');

export function restoreState(raw: string | null | undefined): { state: DemoState; warning?: string } {
  if (!raw) return { state: createSeedState() };
  try {
    if (raw.length > 5_000_000) throw new Error('Saved data exceeds the demo limit');
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && 'schemaVersion' in parsed && parsed.schemaVersion !== 1) {
      return { state: createSeedState(), warning: 'Saved data uses an incompatible demo version. A fresh demo has been loaded.' };
    }
    const result = demoStateSchema.safeParse(parsed);
    if (!result.success) return { state: createSeedState(), warning: 'Saved demo data could not be restored. A fresh demo has been loaded.' };
    return { state: result.data };
  } catch {
    return { state: createSeedState(), warning: 'Saved demo data could not be restored. A fresh demo has been loaded.' };
  }
}
