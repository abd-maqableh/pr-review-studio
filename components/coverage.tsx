'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download, Globe2, Newspaper, Search, TrendingUp } from 'lucide-react';
import { useDemo } from '@/lib/store';
import { coverageToCsv } from '@/lib/csv';
import type { Coverage as CoverageItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState, PageHeading } from '@/components/shared';
import './supporting.css';

export function Coverage() {
  const { state, notify } = useDemo();
  const locale = state.locale;
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const [query, setQuery] = useState('');
  const [sentiment, setSentiment] = useState('all');
  const [detail, setDetail] = useState<CoverageItem | null>(null);
  const detailTrigger = useRef<HTMLButtonElement | null>(null);
  const filtered = state.coverage.filter(item => (sentiment === 'all' || item.sentiment === sentiment) && `${item.outlet} ${item.headline} ${item.excerpt}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const sentimentLabel = (value: string) => value === 'positive' ? t('Positive', 'إيجابي') : value === 'negative' ? t('Negative', 'سلبي') : t('Neutral', 'محايد');
  const outlets = new Set(state.coverage.map(item => item.outlet)).size;
  const positive = state.coverage.filter(item => item.sentiment === 'positive').length;
  const detailCampaign = detail ? state.campaigns.find(campaign => campaign.id === detail.campaignId) : undefined;

  function exportCsv() {
    const blob = new Blob([coverageToCsv(filtered)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pr-review-studio-sample-coverage.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify(t(`Exported ${filtered.length} sample articles.`, `تم تصدير ${filtered.length} مقالات نموذجية.`));
  }

  return <>
    <PageHeading eyebrow={t('SEE THE STORY TRAVEL', 'تابع انتشار القصة')} title={t('Media coverage', 'التغطية الإعلامية')} description={t('A clear view of the conversation around your campaigns.', 'صورة واضحة للنقاش حول حملاتك.')}>
      <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}><Download size={16} aria-hidden="true" />{t('Export CSV', 'تصدير CSV')}</Button>
    </PageHeading>
    <div className="support-coverage-metrics"><div><span className="support-file-icon"><Newspaper size={19} aria-hidden="true" /></span><div><strong>{state.coverage.length}</strong><span>{t('Sample mentions', 'إشارات نموذجية')}</span></div></div><div><span className="support-file-icon"><Globe2 size={19} aria-hidden="true" /></span><div><strong>{outlets}</strong><span>{t('Fictional outlets', 'جهات إعلامية خيالية')}</span></div></div><div><span className="support-file-icon"><TrendingUp size={19} aria-hidden="true" /></span><div><strong>{state.coverage.length ? Math.round(positive / state.coverage.length * 100) : 0}<span className="support-percent">%</span></strong><span>{t('Positive in sample', 'إيجابية ضمن النموذج')}</span></div></div></div>
    <div className="support-fictional-note"><span className="support-note-dot" /><p>{t('A fictional media landscape, built for this demo. All outlets, articles, and sentiment labels are sample data.', 'مشهد إعلامي خيالي صُمّم لهذا العرض. جميع الجهات والمقالات وتصنيفات الانطباع هي بيانات نموذجية.')}</p></div>

    <section className="panel" aria-label={t('Sample media articles', 'المقالات الإعلامية النموذجية')}><div className="support-filter-bar"><div className="search-field support-search"><Search size={17} aria-hidden="true" /><input aria-label={t('Search coverage', 'البحث في التغطية')} placeholder={t('Search headlines or outlets…', 'ابحث في العناوين أو الجهات…')} value={query} onChange={event => setQuery(event.target.value)} /></div><label className="support-filter-label"><span className="sr-only">{t('Sentiment', 'الانطباع')}</span><select className="select" value={sentiment} onChange={event => setSentiment(event.target.value)}><option value="all">{t('All sentiment', 'كل الانطباعات')}</option><option value="positive">{t('Positive', 'إيجابي')}</option><option value="neutral">{t('Neutral', 'محايد')}</option><option value="negative">{t('Negative', 'سلبي')}</option></select></label></div>
      {filtered.length ? <div className="table-wrap"><table className="data-table support-coverage-table"><thead><tr><th>{t('Article', 'المقال')}</th><th>{t('Sentiment', 'الانطباع')}</th><th>{t('Date', 'التاريخ')}</th><th><span className="sr-only">{t('Open article', 'فتح المقال')}</span></th></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td><div className="support-coverage-outlet"><span className="support-outlet-avatar" aria-hidden="true">{item.outlet[0]}</span><bdi>{item.outlet}</bdi><span className="support-sample-label">{t('FICTIONAL', 'خيالي')}</span></div><button className="support-text-button support-headline" dir="auto" onClick={event => { detailTrigger.current = event.currentTarget; setDetail(item); }}>{item.headline}</button></td><td><span className={`support-sentiment support-sentiment-${item.sentiment}`}><span />{sentimentLabel(item.sentiment)}</span></td><td className="muted">{formatDate(item.date, locale)}</td><td><Button variant="ghost" size="icon" aria-label={t(`Read sample article: ${item.headline}`, `قراءة المقال النموذجي: ${item.headline}`)} onClick={event => { detailTrigger.current = event.currentTarget; setDetail(item); }}><ArrowUpRight size={17} aria-hidden="true" /></Button></td></tr>)}</tbody></table></div> : <EmptyState icon={Newspaper} title={t('No coverage matches yet', 'لا توجد تغطية مطابقة')} description={t('Try a different keyword or sentiment to explore the sample coverage.', 'جرّب كلمة أخرى أو انطباعًا مختلفًا لاستكشاف التغطية النموذجية.')}><Button variant="outline" onClick={() => { setQuery(''); setSentiment('all'); }}>{t('Clear filters', 'مسح عوامل التصفية')}</Button></EmptyState>}
      <div className="support-table-footer" role="status">{t(`${filtered.length} of ${state.coverage.length} articles`, `${filtered.length} من ${state.coverage.length} مقالات`)}<span>{t('CSV exports the current view', 'يُصدّر CSV العرض الحالي')}</span></div>
    </section>

    <Dialog open={!!detail} onOpenChange={open => { if (!open) setDetail(null); }}><DialogContent dir={locale === 'ar' ? 'rtl' : 'ltr'} closeLabel={t('Close', 'إغلاق')} onCloseAutoFocus={event => { event.preventDefault(); detailTrigger.current?.focus(); }}>
      <DialogHeader><DialogTitle><bdi>{detail?.headline}</bdi></DialogTitle><DialogDescription>{t('A fictional article excerpt created for this independent portfolio demo.', 'مقتطف مقال خيالي أُنشئ لهذا العرض المستقل ضمن معرض الأعمال.')}</DialogDescription></DialogHeader>
      {detail && <><div className="support-detail-meta"><span><Globe2 size={16} aria-hidden="true" /><bdi>{detail.outlet}</bdi></span><span className={`support-sentiment support-sentiment-${detail.sentiment}`}><span />{sentimentLabel(detail.sentiment)}</span><time dateTime={detail.date}>{formatDate(detail.date, locale)}</time></div><div className="support-brief"><p dir="auto">{detail.excerpt}</p></div>{detailCampaign && <div className="support-related-campaign"><span className="muted small">{t('RELATED CAMPAIGN', 'الحملة المرتبطة')}</span><Link href={`/campaigns/${detailCampaign.id}/review`}><bdi>{detailCampaign.name}</bdi><ArrowUpRight size={16} aria-hidden="true" /></Link></div>}<DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>{t('Close article', 'إغلاق المقال')}</Button></DialogFooter></>}
    </DialogContent></Dialog>
  </>;
}
