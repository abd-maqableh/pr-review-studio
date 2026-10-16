import { MADAR_PARAGRAPHS, NOURA_PARAGRAPHS, TALA_PARAGRAPHS, TEMPLATE_PARAGRAPH_AR, TEMPLATE_PARAGRAPH_EN } from './seed';
import type { RewriteMode } from './types';

type Example = { original: string; concise: string; formal: string; simple: string };

/** Original editorial examples, deliberately finite: this module does not call an AI service. */
const examples: Example[] = [
  {
    original: NOURA_PARAGRAPHS[0],
    concise: 'AMMAN, Jordan — Noura, a fictional workspace concept, introduced a shared hub for small teams to organize notes, decisions, and resources.',
    formal: 'AMMAN, Jordan — Noura, a fictional workspace concept, today announced a shared knowledge hub intended to support small teams in organizing project documentation, decisions, and reference resources.',
    simple: 'AMMAN, Jordan — Noura is a fictional workspace for small teams. It gives them one place to keep project notes, decisions, and useful resources.',
  },
  {
    original: NOURA_PARAGRAPHS[1],
    concise: 'Noura brings notes, updates, and resources into one searchable library, with links between ideas and clear ownership.',
    formal: 'The workspace consolidates project notes, updates, and reference materials within a searchable library. Related information can be linked, and each resource can be assigned an owner to maintain relevant context.',
    simple: 'Teams can keep their notes and resources in one searchable place. They can link related ideas and choose someone to keep each item up to date.',
  },
  {
    original: NOURA_PARAGRAPHS[2],
    concise: '“Shared context helps teams work together. Noura makes knowledge easier to find and maintain,” said Lina Haddad, the fictional product lead.',
    formal: '“Effective collaboration depends on shared context. Noura is designed to improve access to useful knowledge and support its ongoing maintenance,” said Lina Haddad, the fictional product lead for this demonstration.',
    simple: '“Teams work better when everyone has the information they need. Noura helps people find and update that information,” said Lina Haddad, a fictional product lead in this demo.',
  },
  {
    original: NOURA_PARAGRAPHS[3],
    concise: 'The concept offers focused reading, simple collections, and document ownership. Availability, pricing, and performance remain unannounced.',
    formal: 'The proposed experience includes a focused reading interface, lightweight document collections, and defined ownership. This demonstration illustrates the product concept; availability, pricing, and performance information have not been announced.',
    simple: 'The idea includes a clear reading page and simple ways to group documents and name their owners. This is a demo. There are no announced prices, release dates, or performance results.',
  },
  {
    original: MADAR_PARAGRAPHS[0],
    concise: 'عمّان، الأردن — يقدّم مدار، وهو مفهوم خيالي، مكانًا مشتركًا لتنظيم ملاحظات الفرق الصغيرة وقراراتها ومواردها.',
    formal: 'عمّان، الأردن — أعلن مدار، وهو مفهوم منتج خيالي، عن مساحة معرفة مشتركة تهدف إلى دعم الفرق الصغيرة في تنظيم وثائق المشاريع والقرارات والموارد المرجعية.',
    simple: 'عمّان، الأردن — مدار فكرة خيالية لمساحة عمل. تساعد الفرق الصغيرة على جمع الملاحظات والقرارات والموارد في مكان واحد.',
  },
  {
    original: MADAR_PARAGRAPHS[1],
    concise: 'يجمع مدار الملاحظات والموارد في مكتبة قابلة للبحث، مع ربط الأفكار وتحديد مسؤول واضح عن كل مورد.',
    formal: 'توحّد المساحة الملاحظات وتحديثات المشاريع والمواد المرجعية ضمن مكتبة قابلة للبحث، وتتيح ربط المعلومات ذات الصلة وتحديد المسؤوليات للحفاظ على وضوح المحتوى.',
    simple: 'يستطيع الفريق حفظ ملاحظاته وموارده في مكان يسهل البحث فيه. ويمكنه ربط الأفكار المتشابهة واختيار شخص لتحديث كل مورد.',
  },
  {
    original: MADAR_PARAGRAPHS[2],
    concise: '«المعرفة المشتركة أساس التعاون. يسهّل مدار الوصول إليها وتنظيمها»، قالت سلمى ناصر، مديرة المنتج الخيالية.',
    formal: '«يعتمد التعاون الفعّال على فهم مشترك. وقد صُمّم مدار لتحسين الوصول إلى المعرفة ودعم تنظيمها المستمر»، صرّحت سلمى ناصر، مديرة المنتج الخيالية في هذا العرض.',
    simple: '«يعمل الفريق بشكل أفضل عندما تتوفر المعلومات للجميع. يساعد مدار على إيجادها وترتيبها»، قالت سلمى ناصر، وهي شخصية خيالية في هذا العرض.',
  },
  {
    original: MADAR_PARAGRAPHS[3],
    concise: 'يشمل المفهوم واجهة قراءة واضحة ومجموعات للمستندات. ولم تُعلن مواعيد الإتاحة أو الأسعار أو نتائج الأداء.',
    formal: 'يتضمّن التصوّر واجهة مخصّصة للقراءة ومجموعات مبسّطة لتنظيم المستندات. ويقتصر هذا العرض على توضيح المفهوم، دون الإعلان عن الإتاحة أو الأسعار أو نتائج الأداء.',
    simple: 'تتضمن الفكرة صفحة سهلة للقراءة وطريقة بسيطة لجمع المستندات. هذا عرض توضيحي فقط، ولا توجد أسعار أو مواعيد إطلاق أو نتائج معلنة.',
  },
  {
    original: TALA_PARAGRAPHS[0],
    concise: 'DUBAI, United Arab Emirates — Tala, a fictional design toolkit, introduced accessible interface patterns for small product teams.',
    formal: 'DUBAI, United Arab Emirates — Tala, a fictional design toolkit, announced a collection of accessible interface patterns intended to support small teams in the early stages of digital product development.',
    simple: 'DUBAI, United Arab Emirates — Tala is a fictional toolkit with design patterns that consider accessibility. It gives small teams a place to start designing digital products.',
  },
  {
    original: TALA_PARAGRAPHS[1],
    concise: 'Reusable layouts and writing guidance help teams review structure, content, and accessibility together.',
    formal: 'The concept combines reusable layouts with practical content guidance, enabling teams to consider information structure, written content, and accessibility during initial design reviews.',
    simple: 'Teams can start with ready-made layouts and clear writing tips. They can use these to discuss how a design works and how people will use it.',
  },
  {
    original: TALA_PARAGRAPHS[2],
    concise: 'This PR Review Studio sample is entirely fictional and makes no claims about a real launch, customers, or business results.',
    formal: 'This original release was prepared for the PR Review Studio demonstration. The product, team, and announcement are fictional and do not represent a commercial launch, customer adoption, or measured business outcomes.',
    simple: 'This is a sample written for PR Review Studio. Tala and its team are made up. The text does not describe real customers, a real launch, or business results.',
  },
  {
    original: TEMPLATE_PARAGRAPH_EN,
    concise: 'This announcement covers the project, audience, and next steps. A reviewer should confirm every detail before approval.',
    formal: 'This announcement describes the project, its intended audience, and the proposed next steps. All details should be verified and confirmed by a reviewer prior to approval.',
    simple: 'This announcement explains the project, who it is for, and what happens next. Someone should check the facts before approving it.',
  },
  {
    original: TEMPLATE_PARAGRAPH_AR,
    concise: 'يلخّص الإعلان المشروع والجمهور والخطوات التالية. ويجب تأكيد التفاصيل قبل الاعتماد.',
    formal: 'يستعرض هذا الإعلان المشروع والفئة المستهدفة والخطوات المقترحة. ويُرجى التحقق من جميع التفاصيل وتأكيدها من قِبل المراجع قبل الاعتماد.',
    simple: 'يشرح هذا الإعلان المشروع ولمن هو موجّه وما الذي سيحدث لاحقًا. يجب أن يراجع شخص التفاصيل قبل الموافقة عليه.',
  },
  {
    original: 'AMMAN, Jordan — Noura, a fictional workspace concept, today introduced a knowledge hub to help teams collect their project notes and resources.',
    concise: 'AMMAN, Jordan — Noura, a fictional concept, introduced a hub for team notes and resources.',
    formal: 'AMMAN, Jordan — Noura, a fictional workspace concept, announced a knowledge hub intended to support the collection and organization of team project notes and resources.',
    simple: 'AMMAN, Jordan — Noura is a fictional workspace. It helps teams keep their project notes and resources together.',
  },
];

const rewriteIndex = new Map<string, Example>();
for (const example of examples) {
  for (const text of [example.original, example.concise, example.formal, example.simple]) rewriteIndex.set(text, example);
}

export function getRewrite(text: string, mode: RewriteMode): string | null {
  return rewriteIndex.get(text.trim())?.[mode] ?? null;
}

/** Emits cumulative text for 2.4 seconds. Abort stops the only timer and removes its listener. */
export function streamRewrite(text: string, onChunk: (text: string) => void, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const characters = Array.from(text);
    const steps = Math.min(24, Math.max(1, characters.length));
    const interval = 2400 / steps;
    let step = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cleanup = () => { if (timer !== undefined) clearTimeout(timer); signal.removeEventListener('abort', abort); };
    const abort = () => { cleanup(); reject(new DOMException('Simulated rewrite cancelled', 'AbortError')); };
    const tick = () => {
      if (signal.aborted) { abort(); return; }
      step += 1;
      try { onChunk(characters.slice(0, Math.ceil(characters.length * step / steps)).join('')); }
      catch (error) { cleanup(); reject(error); return; }
      if (signal.aborted) return;
      if (step >= steps) { cleanup(); resolve(); }
      else timer = setTimeout(tick, interval);
    };
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort, { once: true });
    timer = setTimeout(tick, interval);
  });
}
