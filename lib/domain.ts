import { createSeedState, TEMPLATE_PARAGRAPH_AR, TEMPLATE_PARAGRAPH_EN } from './seed';
import type { Activity, Campaign, DemoAction, DemoState, DocumentContent, Proposal } from './types';

export function contentEquals(a: DocumentContent, b: DocumentContent): boolean {
  return a.title === b.title && a.paragraphs.length === b.paragraphs.length && a.paragraphs.every((text, index) => text === b.paragraphs[index]);
}

function activity(campaign: Campaign, type: string, text: string, at: string): Activity[] {
  return [{ id: `${campaign.id}-activity-${campaign.activity.length + 1}-${at}`, type, text, createdAt: at }, ...campaign.activity];
}

function updateCampaign(state: DemoState, id: string, update: (campaign: Campaign) => Campaign): DemoState {
  const current = state.campaigns.find((campaign) => campaign.id === id);
  if (!current) return state;
  const next = update(current);
  return next === current ? state : { ...state, campaigns: state.campaigns.map((campaign) => campaign.id === id ? next : campaign) };
}

export function applyProposal(content: DocumentContent, proposal: Proposal): DocumentContent {
  if (!Number.isInteger(proposal.paragraph) || proposal.paragraph < 0 || content.paragraphs[proposal.paragraph] !== proposal.original) {
    throw new Error('This paragraph changed after the proposal was created. Discard the proposal and request a new rewrite.');
  }
  return { ...content, paragraphs: content.paragraphs.map((text, index) => index === proposal.paragraph ? proposal.replacement : text) };
}

export function discardProposal(content: DocumentContent): DocumentContent { return content; }

/** Workflow rules live here as well as in the controls, so invalid transitions are harmless. */
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'restore': return action.state;
    case 'reset': return createSeedState();
    case 'locale': return action.locale === state.locale ? state : { ...state, locale: action.locale };
    case 'create': {
      if (state.campaigns.some((campaign) => campaign.id === action.id)) return state;
      const input = { ...action.input, name: action.input.name.trim(), brief: action.input.brief.trim(), market: action.input.market.trim() };
      if (!input.name || !input.brief || !input.market) return state;
      const arabic = input.language === 'ar';
      const content: DocumentContent = {
        title: arabic ? `${input.name} — مسودة بيان صحفي` : `${input.name} — press release draft`,
        paragraphs: [
          arabic ? `ملخص المشروع: ${input.brief}` : `Project brief: ${input.brief}`,
          arabic ? TEMPLATE_PARAGRAPH_AR : TEMPLATE_PARAGRAPH_EN,
          arabic ? `السوق المستهدف: ${input.market}. هذه مسودة من قالب ثابت، ويجب إضافة التفاصيل المؤكدة قبل المراجعة.` : `Target market: ${input.market}. This is a fixed-template draft. Add confirmed announcement details before review.`,
        ],
      };
      const campaign: Campaign = {
        ...input, id: action.id, status: 'draft', content,
        versions: [{ ...content, paragraphs: [...content.paragraphs], id: `${action.id}-v1`, number: 1, createdAt: action.at, note: 'Initial template draft' }],
        comments: [],
        activity: [{ id: `${action.id}-activity-1`, type: 'create', text: 'Campaign created from a fixed template', createdAt: action.at }],
        createdAt: action.at, updatedAt: action.at, approvedAt: null,
      };
      return { ...state, campaigns: [campaign, ...state.campaigns] };
    }
    case 'save': return updateCampaign(state, action.id, (campaign) => {
      if (contentEquals(campaign.content, action.content)) return campaign;
      const number = Math.max(0, ...campaign.versions.map((version) => version.number)) + 1;
      const content = { title: action.content.title, paragraphs: [...action.content.paragraphs] };
      return {
        ...campaign, content, status: 'draft', approvedAt: null, updatedAt: action.at,
        versions: [...campaign.versions, { ...content, paragraphs: [...content.paragraphs], id: `${campaign.id}-v${number}`, number, createdAt: action.at, note: 'Saved draft revision' }],
        activity: activity(campaign, 'save', `Version ${number} saved as a draft${campaign.status === 'approved' ? '; previous approval invalidated' : campaign.status === 'in-review' ? '; another review is required' : ''}`, action.at),
      };
    });
    case 'review': return updateCampaign(state, action.id, (campaign) => {
      if (campaign.status !== 'draft' && campaign.status !== 'changes-requested') return campaign;
      return { ...campaign, status: 'in-review', approvedAt: null, updatedAt: action.at, activity: activity(campaign, 'review', `Version ${campaign.versions.at(-1)?.number ?? 1} submitted for review`, action.at) };
    });
    case 'approve': return updateCampaign(state, action.id, (campaign) => {
      if (campaign.status !== 'in-review') return campaign;
      return { ...campaign, status: 'approved', approvedAt: action.at, updatedAt: action.at, activity: activity(campaign, 'approve', `Version ${campaign.versions.at(-1)?.number ?? 1} approved for this demo`, action.at) };
    });
    case 'changes': return updateCampaign(state, action.id, (campaign) => {
      const feedback = action.feedback.trim();
      if (campaign.status !== 'in-review' || !feedback) return campaign;
      return {
        ...campaign, status: 'changes-requested', approvedAt: null, updatedAt: action.at,
        comments: [...campaign.comments, { id: `${campaign.id}-comment-${campaign.comments.length + 1}-${action.at}`, text: feedback, paragraph: null, createdAt: action.at }],
        activity: activity(campaign, 'changes', 'Changes requested with review feedback', action.at),
      };
    });
    case 'comment': return updateCampaign(state, action.id, (campaign) => {
      const text = action.text.trim();
      if (!text || (action.paragraph !== null && (!Number.isInteger(action.paragraph) || action.paragraph < 0 || action.paragraph >= campaign.content.paragraphs.length))) return campaign;
      return {
        ...campaign, updatedAt: action.at,
        comments: [...campaign.comments, { id: `${campaign.id}-comment-${campaign.comments.length + 1}-${action.at}`, text, paragraph: action.paragraph, createdAt: action.at }],
        activity: activity(campaign, 'comment', action.paragraph === null ? 'A review comment was added' : `A review comment was added to paragraph ${action.paragraph + 1}`, action.at),
      };
    });
    case 'invalidate': return updateCampaign(state, action.id, (campaign) => {
      if (campaign.status === 'draft') return campaign;
      const text = campaign.status === 'approved' ? 'Editing started a new draft revision; previous approval invalidated' : 'Editing started a new draft revision; another review is required';
      return { ...campaign, status: 'draft', approvedAt: null, updatedAt: action.at, activity: activity(campaign, 'invalidate', text, action.at) };
    });
    case 'toggle-agent': return { ...state, agents: state.agents.map((agent) => agent.id === action.id ? { ...agent, active: !agent.active } : agent) };
    case 'run-agent': {
      if (!state.agents.some((agent) => agent.id === action.id && agent.active)) return state;
      return { ...state, agents: state.agents.map((agent) => agent.id === action.id ? { ...agent, runs: agent.runs + 1, lastRunAt: action.at } : agent) };
    }
    default: return state;
  }
}
