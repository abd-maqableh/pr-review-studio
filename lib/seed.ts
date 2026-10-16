import type { Campaign, DemoState, DocumentContent } from './types';

export const NOURA_PARAGRAPHS = [
  'AMMAN, Jordan — Noura, a fictional workspace concept, today introduced a shared knowledge hub designed to help small teams organize project notes, decisions, and useful resources in one place.',
  'The workspace brings notes, project updates, and reference materials together in a searchable library. Teams can connect related ideas, assign an owner to each resource, and keep important context close to the work it supports.',
  '“Good teamwork starts with shared context. We designed Noura to make useful knowledge easier to find and simpler to maintain,” said Lina Haddad, the fictional product lead for this demonstration.',
  'The concept includes a focused reading view, lightweight collections, and clear ownership for shared documents. This demonstration explores the product experience; availability, pricing, and performance have not been announced.',
];

export const MADAR_PARAGRAPHS = [
  'عمّان، الأردن — يقدّم مدار، وهو مفهوم منتج خيالي، مساحة عمل تساعد الفرق الصغيرة على تنظيم ملاحظات المشاريع والقرارات والموارد المفيدة في مكان واحد.',
  'تجمع المساحة الملاحظات وتحديثات المشاريع والمواد المرجعية في مكتبة قابلة للبحث. ويمكن للفريق ربط الأفكار ذات الصلة وتحديد مسؤول عن كل مورد للحفاظ على وضوح المعلومات.',
  '«يبدأ العمل الجماعي بفهم مشترك. صمّمنا مدار لتسهيل الوصول إلى المعرفة وتنظيمها»، قالت سلمى ناصر، مديرة المنتج الخيالية في هذا العرض التجريبي.',
  'يتضمّن المفهوم واجهة قراءة واضحة ومجموعات بسيطة للمستندات. هذا نموذج توضيحي فقط، ولم يُعلن عن موعد الإتاحة أو الأسعار أو نتائج الأداء.',
];

export const TALA_PARAGRAPHS = [
  'DUBAI, United Arab Emirates — Tala, a fictional design toolkit, introduced a collection of accessible interface patterns for small product teams exploring their next digital experience.',
  'The concept pairs reusable layouts with practical writing guidance. Each pattern is intended to help teams discuss structure, content, and accessibility together during early design reviews.',
  'This original sample release is part of PR Review Studio. Tala, its team, and the announcement are fictional; no launch, customer adoption, or measured business results are represented.',
];

export const TEMPLATE_PARAGRAPH_EN = 'This announcement outlines the project, its intended audience, and the next steps for the team. Details should be checked and confirmed by a reviewer before the document is approved.';
export const TEMPLATE_PARAGRAPH_AR = 'يوضح هذا الإعلان المشروع والجمهور المستهدف والخطوات التالية للفريق. وينبغي للمراجع التحقق من التفاصيل وتأكيدها قبل اعتماد المستند.';

const NOURA_TITLE = 'Noura introduces a calmer way for teams to find shared knowledge';
const NOURA_V1: DocumentContent = {
  title: 'Noura introduces a new workspace for shared team knowledge',
  paragraphs: [
    'AMMAN, Jordan — Noura, a fictional workspace concept, today introduced a knowledge hub to help teams collect their project notes and resources.',
    ...NOURA_PARAGRAPHS.slice(1),
  ],
};

function seedCampaigns(): Campaign[] {
  return [
    {
      id: 'camp-noura', name: 'Noura · Workspace launch',
      brief: 'Introduce a fictional shared knowledge workspace for small teams. Keep the story useful, grounded, and clear about the product concept.',
      market: 'Jordan · MENA', language: 'en', status: 'in-review',
      content: { title: NOURA_TITLE, paragraphs: [...NOURA_PARAGRAPHS] },
      versions: [
        { id: 'noura-v1', number: 1, ...NOURA_V1, paragraphs: [...NOURA_V1.paragraphs], createdAt: '2026-10-14T09:00:00.000Z', note: 'Initial draft' },
        { id: 'noura-v2', number: 2, title: NOURA_TITLE, paragraphs: [...NOURA_PARAGRAPHS], createdAt: '2026-10-15T10:30:00.000Z', note: 'Refined the launch story and opening paragraph' },
      ],
      comments: [{ id: 'noura-comment-1', text: 'The opening is clear. Let’s make the product description a little more concise before approval.', paragraph: 1, createdAt: '2026-10-15T11:05:00.000Z' }],
      activity: [
        { id: 'noura-a3', type: 'review', text: 'Version 2 submitted for review', createdAt: '2026-10-15T10:45:00.000Z' },
        { id: 'noura-a2', type: 'save', text: 'Version 2 saved', createdAt: '2026-10-15T10:30:00.000Z' },
        { id: 'noura-a1', type: 'create', text: 'Campaign created with an original sample draft', createdAt: '2026-10-14T09:00:00.000Z' },
      ],
      createdAt: '2026-10-14T09:00:00.000Z', updatedAt: '2026-10-15T10:45:00.000Z', approvedAt: null,
    },
    {
      id: 'camp-madar', name: 'مدار · مساحة للمعرفة المشتركة',
      brief: 'تقديم مفهوم خيالي لمساحة معرفة مشتركة للفرق الصغيرة، بلغة عربية أصلية وواضحة.',
      market: 'الأردن · المنطقة العربية', language: 'ar', status: 'draft',
      content: { title: 'مدار يقدّم مساحة أبسط لتنظيم معرفة الفريق', paragraphs: [...MADAR_PARAGRAPHS] },
      versions: [{ id: 'madar-v1', number: 1, title: 'مدار يقدّم مساحة أبسط لتنظيم معرفة الفريق', paragraphs: [...MADAR_PARAGRAPHS], createdAt: '2026-10-14T13:00:00.000Z', note: 'المسودة الأولى' }],
      comments: [],
      activity: [{ id: 'madar-a1', type: 'create', text: 'Campaign created with an original Arabic sample draft', createdAt: '2026-10-14T13:00:00.000Z' }],
      createdAt: '2026-10-14T13:00:00.000Z', updatedAt: '2026-10-14T13:00:00.000Z', approvedAt: null,
    },
    {
      id: 'camp-tala', name: 'Tala · Design toolkit',
      brief: 'Explain a fictional toolkit for accessible interface design. Show a reviewed, approved document without implying a real product launch.',
      market: 'United Arab Emirates', language: 'en', status: 'approved',
      content: { title: 'Tala presents a thoughtful starting point for accessible product design', paragraphs: [...TALA_PARAGRAPHS] },
      versions: [{ id: 'tala-v1', number: 1, title: 'Tala presents a thoughtful starting point for accessible product design', paragraphs: [...TALA_PARAGRAPHS], createdAt: '2026-10-12T08:00:00.000Z', note: 'Initial draft' }],
      comments: [{ id: 'tala-comment-1', text: 'The fictional context and accessibility focus are clear. Ready to approve for this demo.', paragraph: null, createdAt: '2026-10-13T09:15:00.000Z' }],
      activity: [
        { id: 'tala-a3', type: 'approve', text: 'Version 1 approved for this demo', createdAt: '2026-10-13T09:30:00.000Z' },
        { id: 'tala-a2', type: 'review', text: 'Version 1 submitted for review', createdAt: '2026-10-12T14:00:00.000Z' },
        { id: 'tala-a1', type: 'create', text: 'Campaign created with an original sample draft', createdAt: '2026-10-12T08:00:00.000Z' },
      ],
      createdAt: '2026-10-12T08:00:00.000Z', updatedAt: '2026-10-13T09:30:00.000Z', approvedAt: '2026-10-13T09:30:00.000Z',
    },
  ];
}

/** Fresh nested objects on every call keep reset and reducer updates independent. */
export function createSeedState(): DemoState {
  return {
    schemaVersion: 1, locale: 'en', campaigns: seedCampaigns(),
    agents: [
      { id: 'writer', active: true, runs: 4, lastRunAt: '2026-10-15T10:20:00.000Z' },
      { id: 'researcher', active: true, runs: 2, lastRunAt: '2026-10-14T12:00:00.000Z' },
      { id: 'monitor', active: true, runs: 3, lastRunAt: '2026-10-15T08:00:00.000Z' },
    ],
    coverage: [
      { id: 'coverage-1', outlet: 'The Amman Brief · Fictional', headline: 'Noura explores a quieter home for team knowledge', sentiment: 'positive', date: '2026-10-15', campaignId: 'camp-noura', excerpt: 'A fictional editorial sample discussing the workspace concept and its focus on shared context.' },
      { id: 'coverage-2', outlet: 'Product Notebook · Fictional', headline: 'A closer look at the Noura workspace concept', sentiment: 'neutral', date: '2026-10-15', campaignId: 'camp-noura', excerpt: 'An invented product note summarizing the proposed features. This is not a real published article.' },
      { id: 'coverage-3', outlet: 'Design Dispatch · Fictional', headline: 'Tala places accessible patterns at the start of design', sentiment: 'positive', date: '2026-10-13', campaignId: 'camp-tala', excerpt: 'A sample coverage item about the fictional design toolkit’s intended direction.' },
      { id: 'coverage-4', outlet: 'The Interface Review · Fictional', headline: 'Tala concept leaves questions about implementation', sentiment: 'negative', date: '2026-10-14', campaignId: 'camp-tala', excerpt: 'A deliberately critical fictional sample asking for more detail on how the proposed patterns would be maintained.' },
      { id: 'coverage-5', outlet: 'دفتر التقنية · وسيلة خيالية', headline: 'مدار يستكشف تنظيم المعرفة داخل الفرق الصغيرة', sentiment: 'neutral', date: '2026-10-14', campaignId: 'camp-madar', excerpt: 'مادة توضيحية أصلية عن مفهوم خيالي، وليست تغطية إعلامية منشورة.' },
    ],
  };
}
