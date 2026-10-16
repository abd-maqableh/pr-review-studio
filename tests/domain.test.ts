import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyProposal, demoReducer, discardProposal } from '../lib/domain';
import { coverageToCsv, escapeCsvCell } from '../lib/csv';
import { restoreState } from '../lib/persistence';
import { createSeedState } from '../lib/seed';
import { getRewrite, streamRewrite } from '../lib/simulation';
import type { Proposal } from '../lib/types';

const at = '2026-10-16T10:00:00.000Z';

test('editing an approved document immediately invalidates approval and saving preserves old versions', () => {
  const seed = createSeedState();
  const original = seed.campaigns.find((campaign) => campaign.id === 'camp-tala')!;
  const invalidated = demoReducer(seed, { type: 'invalidate', id: original.id, at });
  const draft = invalidated.campaigns.find((campaign) => campaign.id === original.id)!;
  assert.equal(draft.status, 'draft');
  assert.equal(draft.approvedAt, null);
  assert.match(draft.activity[0].text, /approval invalidated/);
  assert.equal(draft.versions.length, 1);
  const edited = { ...draft.content, title: 'Revised announcement', paragraphs: [...draft.content.paragraphs] };
  const saved = demoReducer(invalidated, { type: 'save', id: draft.id, content: edited, at });
  const revision = saved.campaigns.find((campaign) => campaign.id === draft.id)!;
  assert.equal(revision.status, 'draft');
  assert.equal(revision.versions.length, 2);
  assert.equal(revision.versions[1].title, edited.title);
  assert.equal(revision.versions[0].title, original.content.title);
  assert.equal(original.status, 'approved');
  assert.equal(demoReducer(saved, { type: 'save', id: draft.id, content: edited, at }), saved);
});

test('workflow guards reject skipped steps and require feedback for requested changes', () => {
  const seed = createSeedState();
  assert.equal(demoReducer(seed, { type: 'approve', id: 'camp-madar', at }), seed);
  assert.equal(demoReducer(seed, { type: 'changes', id: 'camp-noura', feedback: '   ', at }), seed);
  assert.equal(demoReducer(seed, { type: 'review', id: 'camp-noura', at }), seed);
  const requested = demoReducer(seed, { type: 'changes', id: 'camp-noura', feedback: 'Please clarify the opening.', at });
  const campaign = requested.campaigns.find((entry) => entry.id === 'camp-noura')!;
  assert.equal(campaign.status, 'changes-requested');
  assert.equal(campaign.comments.at(-1)?.text, 'Please clarify the opening.');
  const reviewed = demoReducer(requested, { type: 'review', id: campaign.id, at });
  const approved = demoReducer(reviewed, { type: 'approve', id: campaign.id, at });
  assert.equal(approved.campaigns.find((entry) => entry.id === campaign.id)?.approvedAt, at);
  assert.equal(demoReducer(approved, { type: 'review', id: campaign.id, at }), approved);
});

test('proposal apply changes only its paragraph; discard preserves edits; stale proposals cannot overwrite them', () => {
  const content = createSeedState().campaigns[0].content;
  const proposal: Proposal = { paragraph: 0, original: content.paragraphs[0], replacement: getRewrite(content.paragraphs[0], 'concise')!, mode: 'concise' };
  const working = { ...content, title: 'An unsaved title', paragraphs: [...content.paragraphs] };
  working.paragraphs[1] = 'An unrelated unsaved paragraph';
  const applied = applyProposal(working, proposal);
  assert.equal(applied.title, working.title);
  assert.equal(applied.paragraphs[0], proposal.replacement);
  assert.equal(applied.paragraphs[1], working.paragraphs[1]);
  assert.equal(working.paragraphs[0], proposal.original);
  assert.deepEqual(applied.paragraphs.slice(2), working.paragraphs.slice(2));
  assert.equal(discardProposal(working), working);
  const changed = { ...working, paragraphs: ['My own new opening', ...working.paragraphs.slice(1)] };
  assert.throws(() => applyProposal(changed, proposal), /changed after the proposal/);
  assert.equal(changed.paragraphs[0], 'My own new opening');
  assert.throws(() => applyProposal(working, { ...proposal, paragraph: -1 }), /changed after the proposal/);
});

test('state restoration validates nested data and reset returns an independent original seed', () => {
  const seed = createSeedState();
  const modified = demoReducer(seed, { type: 'locale', locale: 'ar' });
  assert.deepEqual(restoreState(JSON.stringify(modified)), { state: modified });
  assert.deepEqual(restoreState(null).state, seed);
  assert.ok(restoreState('{broken').warning);
  assert.ok(restoreState(JSON.stringify({ ...seed, schemaVersion: 2 })).warning);
  assert.ok(restoreState(JSON.stringify({ ...seed, campaigns: [{ ...seed.campaigns[0], versions: [] }] })).warning);
  assert.ok(restoreState(JSON.stringify({ ...seed, agents: [seed.agents[0], seed.agents[0], seed.agents[2]] })).warning);
  const inconsistent = createSeedState();
  inconsistent.campaigns[0].status = 'approved';
  assert.ok(restoreState(JSON.stringify(inconsistent)).warning);
  const mismatchedVersion = createSeedState();
  mismatchedVersion.campaigns[0].content.title = 'Unsaved content must not masquerade as a reviewed version';
  assert.ok(restoreState(JSON.stringify(mismatchedVersion)).warning);
  for (const date of ['2026-99-99', '2026-02-30', 'not-a-date']) {
    const invalidCoverage = createSeedState();
    invalidCoverage.coverage[0].date = date;
    assert.ok(restoreState(JSON.stringify(invalidCoverage)).warning);
  }
  const reset = demoReducer(modified, { type: 'reset' });
  assert.deepEqual(reset, seed);
  reset.campaigns[0].content.paragraphs[0] = 'Modified reset object';
  assert.notEqual(seed.campaigns[0].content.paragraphs[0], reset.campaigns[0].content.paragraphs[0]);
});

test('new campaign templates work throughout review and include a supported rewrite example', () => {
  const created = demoReducer(createSeedState(), { type: 'create', id: 'camp-new', at, input: { name: 'A new concept', brief: 'An original announcement to review.', market: 'Jordan', language: 'en' } });
  const campaign = created.campaigns[0];
  assert.equal(campaign.id, 'camp-new');
  assert.match(campaign.content.paragraphs[0], /Project brief:/);
  assert.equal(getRewrite(campaign.content.paragraphs[0], 'formal'), null);
  assert.ok(getRewrite(campaign.content.paragraphs[1], 'formal'));
  const saved = demoReducer(created, { type: 'save', id: campaign.id, at, content: { ...campaign.content, title: 'Ready for review' } });
  const reviewed = demoReducer(saved, { type: 'review', id: campaign.id, at });
  const approved = demoReducer(reviewed, { type: 'approve', id: campaign.id, at });
  assert.equal(approved.campaigns[0].status, 'approved');
  assert.equal(approved.campaigns[0].versions.length, 2);
  assert.deepEqual(restoreState(JSON.stringify(approved)), { state: approved });
  assert.equal(approved.campaigns[0].activity[0].type, 'approve');
  assert.equal(approved.campaigns[0].activity.at(-1)?.type, 'create');
});

test('all seeded paragraphs have three deterministic transformations; paused agents do not run', () => {
  const seed = createSeedState();
  for (const campaign of seed.campaigns) for (const paragraph of campaign.content.paragraphs) {
    for (const mode of ['concise', 'formal', 'simple'] as const) {
      const rewritten = getRewrite(paragraph, mode);
      assert.ok(rewritten);
      assert.equal(getRewrite(paragraph, mode), rewritten);
    }
  }
  assert.equal(getRewrite('An unsupported custom paragraph.', 'concise'), null);
  const paused = demoReducer(seed, { type: 'toggle-agent', id: 'writer' });
  assert.equal(demoReducer(paused, { type: 'run-agent', id: 'writer', at }), paused);
  const resumed = demoReducer(paused, { type: 'toggle-agent', id: 'writer' });
  const ran = demoReducer(resumed, { type: 'run-agent', id: 'writer', at });
  assert.equal(ran.agents[0].runs, seed.agents[0].runs + 1);
});

test('CSV quotes delimiters and line breaks, preserves Arabic, and neutralizes formulas', () => {
  assert.equal(escapeCsvCell('hello, "world"\nnext'), '"hello, ""world""\nnext"');
  for (const input of ['=SUM(A1)', ' +SUM(A1)', '-1+2', '@SUM(A1)', '\t=SUM(A1)', '\rpayload']) {
    assert.ok(escapeCsvCell(input).startsWith('"\''));
  }
  assert.equal(escapeCsvCell('معرفة الفريق'), '"معرفة الفريق"');
  const csv = coverageToCsv(createSeedState().coverage);
  assert.ok(csv.startsWith('\uFEFF"Date","Outlet"'));
  assert.match(csv, /وسيلة خيالية/);
  assert.ok(csv.endsWith('\r\n'));
});

test('simulated generation streams cumulative text and cleans up cancellation', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const controller = new AbortController();
  const removeListener = context.mock.method(controller.signal, 'removeEventListener');
  const clearTimer = context.mock.method(globalThis, 'clearTimeout');
  const chunks: string[] = [];
  const generation = streamRewrite('A deterministic replacement with enough text to stream.', (chunk) => chunks.push(chunk), controller.signal);
  context.mock.timers.tick(100);
  assert.equal(chunks.length, 1);
  const rejection = assert.rejects(generation, { name: 'AbortError' });
  controller.abort();
  await rejection;
  const count = chunks.length;
  context.mock.timers.tick(3000);
  assert.equal(chunks.length, count);
  assert.equal(clearTimer.mock.callCount(), 1);
  assert.equal(removeListener.mock.calls[0].arguments[0], 'abort');

  const fromCallback = new AbortController();
  const callbackChunks: string[] = [];
  const callbackGeneration = streamRewrite('Cancel from inside the first streaming callback.', (chunk) => { callbackChunks.push(chunk); fromCallback.abort(); }, fromCallback.signal);
  const callbackRejection = assert.rejects(callbackGeneration, { name: 'AbortError' });
  context.mock.timers.tick(100);
  await callbackRejection;
  context.mock.timers.tick(3000);
  assert.equal(callbackChunks.length, 1);

  const alreadyAborted = new AbortController();
  alreadyAborted.abort();
  await assert.rejects(streamRewrite('No chunks', () => assert.fail('Aborted work emitted a chunk'), alreadyAborted.signal), { name: 'AbortError' });

  const completed = new AbortController();
  const completionListener = context.mock.method(completed.signal, 'removeEventListener');
  const original = 'نص عربي أصلي لاختبار عرض الاستجابة التدريجية مع رمز 🌿 دون فقدان أي جزء.';
  const completedChunks: string[] = [];
  const complete = streamRewrite(original, (chunk) => completedChunks.push(chunk), completed.signal);
  for (let step = 0; step < 24; step += 1) context.mock.timers.tick(100);
  await complete;
  assert.equal(completedChunks.at(-1), original);
  assert.ok(completedChunks.length > 1);
  assert.ok(completedChunks.every((chunk, index) => index === 0 || chunk.startsWith(completedChunks[index - 1])));
  assert.equal(completionListener.mock.calls[0].arguments[0], 'abort');
});
