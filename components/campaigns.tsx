'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowUpRight, FileText, FolderOpen, Globe2, Plus, Search } from 'lucide-react';
import { useDemo } from '@/lib/store';
import type { Campaign, CampaignInput } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState, PageHeading, StatusBadge } from '@/components/shared';
import './supporting.css';

export function Campaigns() {
  const { state, createCampaign } = useDemo();
  const locale = state.locale;
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const status = searchParams.get('status') || 'all';
  const setStatus = (value: string) => router.replace(value === 'all' ? '/campaigns' : `/campaigns?status=${encodeURIComponent(value)}`, { scroll: false });
  const [createOpen, setCreateOpen] = useState(searchParams.get('new') === 'true');
  const [detail, setDetail] = useState<Campaign | null>(null);
  const createTrigger = useRef<HTMLElement | null>(null);
  const detailTrigger = useRef<HTMLButtonElement | null>(null);
  const primaryCreateTrigger = useRef<HTMLButtonElement | null>(null);
  const schema = z.object({
    name: z.string().trim().min(3, t('Use at least 3 characters.', 'استخدم ٣ أحرف على الأقل.')).max(80, t('Keep the name under 80 characters.', 'يجب ألا يتجاوز الاسم ٨٠ حرفًا.')),
    brief: z.string().trim().min(20, t('Add a brief of at least 20 characters.', 'أضف موجزًا من ٢٠ حرفًا على الأقل.')).max(2000, t('Keep the brief under 2,000 characters.', 'يجب ألا يتجاوز الموجز ٢٠٠٠ حرف.')),
    market: z.string().trim().min(2, t('Enter a target market.', 'أدخل السوق المستهدف.')).max(80, t('Keep the market under 80 characters.', 'يجب ألا يتجاوز السوق ٨٠ حرفًا.')),
    language: z.enum(['en', 'ar']),
  });
  const form = useForm<CampaignInput>({ resolver: zodResolver(schema), defaultValues: { name: '', brief: '', market: '', language: locale } });
  const filtered = state.campaigns.filter(campaign => {
    const statusMatches = status === 'all' || (status === 'pending' ? campaign.status !== 'approved' : campaign.status === status);
    return statusMatches && `${campaign.name} ${campaign.brief} ${campaign.market}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  });

  function submit(input: CampaignInput) {
    const id = createCampaign(input);
    setCreateOpen(false);
    form.reset();
    router.push(`/campaigns/${id}/review`);
  }

  function openCreate() {
    createTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    form.clearErrors();
    setCreateOpen(true);
  }

  return <>
    <PageHeading eyebrow={t('Your workspace', 'مساحة عملك')} title={t('Campaigns', 'الحملات')} description={t('Every story, from the first brief to the final approval.', 'كل قصة، من الموجز الأول إلى الموافقة النهائية.')}>
      <Button ref={primaryCreateTrigger} onClick={openCreate}><Plus size={16} aria-hidden="true" />{t('New campaign', 'حملة جديدة')}</Button>
    </PageHeading>

    <section className="panel" aria-label={t('Campaign library', 'مكتبة الحملات')}>
      <div className="support-filter-bar">
        <div className="search-field support-search"><Search size={17} aria-hidden="true" /><input aria-label={t('Search campaigns', 'البحث في الحملات')} placeholder={t('Search campaigns…', 'ابحث عن حملة…')} value={query} onChange={event => setQuery(event.target.value)} /></div>
        <label className="support-filter-label"><span className="sr-only">{t('Campaign status', 'حالة الحملة')}</span><select className="select" value={status} onChange={event => setStatus(event.target.value)}>
          <option value="all">{t('All statuses', 'كل الحالات')}</option><option value="pending">{t('Not yet approved', 'لم تُعتمد بعد')}</option><option value="draft">{t('Draft', 'مسودة')}</option><option value="in-review">{t('In review', 'قيد المراجعة')}</option><option value="approved">{t('Approved', 'معتمد')}</option><option value="changes-requested">{t('Changes requested', 'تعديلات مطلوبة')}</option>
        </select></label>
      </div>
      {filtered.length ? <div className="table-wrap"><table className="data-table support-campaign-table">
        <thead><tr><th>{t('Campaign', 'الحملة')}</th><th>{t('Market', 'السوق')}</th><th>{t('Status', 'الحالة')}</th><th>{t('Updated', 'آخر تحديث')}</th><th><span className="sr-only">{t('Actions', 'الإجراءات')}</span></th></tr></thead>
        <tbody>{filtered.map(campaign => <tr key={campaign.id}>
          <td><div className="support-table-title"><span className="support-file-icon"><FileText size={18} aria-hidden="true" /></span><div><button className="support-text-button" onClick={event => { detailTrigger.current = event.currentTarget; setDetail(campaign); }}><bdi>{campaign.name}</bdi></button><span className="support-table-subtitle">{campaign.language === 'ar' ? t('Arabic press release', 'بيان صحفي بالعربية') : t('English press release', 'بيان صحفي بالإنجليزية')}<span aria-hidden="true"> · </span>{t(`${campaign.versions.length} versions`, `${campaign.versions.length} إصدارات`)}</span></div></div></td>
          <td><bdi>{campaign.market}</bdi></td><td><StatusBadge status={campaign.status} /></td><td className="muted">{formatDate(campaign.updatedAt, locale)}</td>
          <td><Link className="support-review-link" href={`/campaigns/${campaign.id}/review`}>{t('Review', 'مراجعة')}<ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> {campaign.name}</span></Link></td>
        </tr>)}</tbody>
      </table></div> : <EmptyState icon={FolderOpen} title={t('No campaigns found', 'لم يتم العثور على حملات')} description={query || status !== 'all' ? t('Try another search or clear your filters.', 'جرّب بحثًا آخر أو امسح عوامل التصفية.') : t('Start with a brief. Your first draft is one step away.', 'ابدأ بموجز. مسودتك الأولى على بُعد خطوة واحدة.')}>
        {query || status !== 'all' ? <Button variant="outline" onClick={() => { setQuery(''); setStatus('all'); }}>{t('Clear filters', 'مسح عوامل التصفية')}</Button> : <Button onClick={openCreate}><Plus size={16} aria-hidden="true" />{t('Create a campaign', 'إنشاء حملة')}</Button>}
      </EmptyState>}
      <div className="support-table-footer" role="status">{t(`${filtered.length} of ${state.campaigns.length} campaigns`, `${filtered.length} من ${state.campaigns.length} حملات`)}<span>{t('All work stays in this browser', 'يُحفظ العمل في هذا المتصفح')}</span></div>
    </section>

    <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent dir={locale === 'ar' ? 'rtl' : 'ltr'} closeLabel={t('Close', 'إغلاق')} onCloseAutoFocus={event => { event.preventDefault(); (createTrigger.current || primaryCreateTrigger.current)?.focus(); }}>
      <DialogHeader><DialogTitle>{t('Start a new story', 'ابدأ قصة جديدة')}</DialogTitle><DialogDescription>{t('Give your campaign a clear brief. We’ll prepare an editable starter draft.', 'أضف موجزًا واضحًا لحملتك. سنجهّز مسودة أولية قابلة للتحرير.')}</DialogDescription></DialogHeader>
      <form onSubmit={form.handleSubmit(submit)} className="support-campaign-form" noValidate>
        <div className="field"><label className="field-label" htmlFor="campaign-name">{t('Campaign name', 'اسم الحملة')}</label><input id="campaign-name" className="input" dir="auto" autoComplete="off" placeholder={t('e.g. A new chapter for Nawa', 'مثال: فصل جديد لنواة')} {...form.register('name')} aria-invalid={!!form.formState.errors.name} aria-describedby={form.formState.errors.name ? 'name-error' : undefined} />{form.formState.errors.name && <p className="support-field-error" id="name-error" role="alert">{form.formState.errors.name.message}</p>}</div>
        <div className="field"><label className="field-label" htmlFor="campaign-brief">{t('Campaign brief', 'موجز الحملة')}</label><textarea id="campaign-brief" className="textarea" rows={4} dir="auto" placeholder={t('What’s the announcement, who is it for, and why does it matter?', 'ما الإعلان؟ لمن يتوجه؟ ولماذا هو مهم؟')} {...form.register('brief')} aria-invalid={!!form.formState.errors.brief} aria-describedby={form.formState.errors.brief ? 'brief-error' : 'brief-help'} /><p id="brief-help" className="small muted">{t('Use fictional, non-sensitive information for this demo.', 'استخدم معلومات خيالية وغير حساسة في هذا العرض.')}</p>{form.formState.errors.brief && <p className="support-field-error" id="brief-error" role="alert">{form.formState.errors.brief.message}</p>}</div>
        <div className="form-grid"><div className="field"><label className="field-label" htmlFor="campaign-market">{t('Target market', 'السوق المستهدف')}</label><input id="campaign-market" className="input" dir="auto" placeholder={t('e.g. Jordan & GCC', 'مثال: الأردن والخليج')} {...form.register('market')} aria-invalid={!!form.formState.errors.market} aria-describedby={form.formState.errors.market ? 'market-error' : undefined} />{form.formState.errors.market && <p className="support-field-error" id="market-error" role="alert">{form.formState.errors.market.message}</p>}</div><div className="field"><label className="field-label" htmlFor="campaign-language">{t('Content language', 'لغة المحتوى')}</label><select id="campaign-language" className="select" {...form.register('language')}><option value="en">{t('English', 'الإنجليزية')}</option><option value="ar">{t('Arabic', 'العربية')}</option></select></div></div>
        <div className="support-form-note"><Globe2 size={16} aria-hidden="true" /><p>{t('A simulated template gets you started. You control every word before approval.', 'قالب محاكاة يساعدك على البدء. أنت تتحكم بكل كلمة قبل الموافقة.')}</p></div>
        <DialogFooter><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>{t('Cancel', 'إلغاء')}</Button><Button type="submit" disabled={form.formState.isSubmitting}>{t('Create campaign', 'إنشاء حملة')}<ArrowUpRight size={16} aria-hidden="true" /></Button></DialogFooter>
      </form>
    </DialogContent></Dialog>

    <Dialog open={!!detail} onOpenChange={open => { if (!open) setDetail(null); }}><DialogContent dir={locale === 'ar' ? 'rtl' : 'ltr'} closeLabel={t('Close', 'إغلاق')} onCloseAutoFocus={event => { event.preventDefault(); detailTrigger.current?.focus(); }}>
      <DialogHeader><DialogTitle><bdi>{detail?.name}</bdi></DialogTitle><DialogDescription>{t('Campaign details and the brief behind the story.', 'تفاصيل الحملة والموجز الذي تستند إليه القصة.')}</DialogDescription></DialogHeader>
      {detail && <><div className="support-detail-meta"><StatusBadge status={detail.status} /><span><Globe2 size={15} aria-hidden="true" /><bdi>{detail.market}</bdi></span><span>{detail.language === 'en' ? t('English', 'الإنجليزية') : t('Arabic', 'العربية')}</span></div><div className="support-brief"><h3>{t('The brief', 'الموجز')}</h3><p dir="auto">{detail.brief}</p></div><p className="small muted">{t('Created', 'أُنشئت في')} {formatDate(detail.createdAt, locale)}<span aria-hidden="true"> · </span>{detail.versions.length} {t('saved versions', 'إصدارات محفوظة')}</p><DialogFooter><Button onClick={() => router.push(`/campaigns/${detail.id}/review`)}>{t('Open review workspace', 'فتح مساحة المراجعة')}<ArrowUpRight size={16} aria-hidden="true" /></Button></DialogFooter></>}
    </DialogContent></Dialog>
  </>;
}
