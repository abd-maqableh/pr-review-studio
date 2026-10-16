'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Bot, CheckCheck, CircleDot, Clock3, FileText, FolderOpen, Plus, Sparkles } from 'lucide-react';
import { useDemo } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmptyState, PageHeading, StatusBadge } from '@/components/shared';
import './supporting.css';

export function Overview() {
  const { state } = useDemo();
  const locale = state.locale;
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const pending = state.campaigns.filter(campaign => campaign.status !== 'approved');
  const awaiting = state.campaigns.filter(campaign => campaign.status === 'in-review');
  const approved = state.campaigns.filter(campaign => campaign.status === 'approved');
  const activeAgents = state.agents.filter(agent => agent.active);
  const recent = [...state.campaigns].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const nextCampaign = pending.find(campaign => campaign.status === 'in-review') || pending[0];
  const activities = state.campaigns.flatMap(campaign => campaign.activity.map(activity => ({ ...activity, campaignName: campaign.name, campaignId: campaign.id }))).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const metrics = [
    { label: t('Total campaigns', 'إجمالي الحملات'), value: state.campaigns.length, icon: FolderOpen, href: '/campaigns', detail: t('Stories in your workspace', 'القصص في مساحة عملك') },
    { label: t('Awaiting approval', 'بانتظار الموافقة'), value: awaiting.length, icon: Clock3, href: '/campaigns?status=in-review', detail: t('Ready for a human perspective', 'بانتظار الرؤية البشرية') },
    { label: t('Approved documents', 'المستندات المعتمدة'), value: approved.length, icon: CheckCheck, href: '/campaigns?status=approved', detail: t('Reviewed with confidence', 'مراجعة ومُعتمدة بثقة') },
    { label: t('Active agents', 'الوكلاء النشطون'), value: activeAgents.length, icon: Bot, href: '/agents?status=active', detail: t('Simulated assistants on hand', 'مساعدون بالمحاكاة جاهزون') },
  ];
  const agentNames = { writer: t('Writer', 'الكاتب'), researcher: t('Media researcher', 'الباحث الإعلامي'), monitor: t('Coverage monitor', 'راصد التغطية') };
  const activityLabels: Record<string, string> = { create: 'أُنشئت الحملة مع مسودة أولية', save: 'حُفظ إصدار جديد من المسودة', review: 'أُرسل المستند للمراجعة', approve: 'اعتُمد المستند لهذا العرض', changes: 'طُلبت تعديلات مع ملاحظات للمراجعة', comment: 'أُضيف تعليق للمراجعة', invalidate: 'أُلغيت الموافقة السابقة بسبب التعديلات' };

  return <>
    <PageHeading eyebrow={t('A little clarity. A better story.', 'رؤية أوضح. وقصة أفضل.')} title={t('Your newsroom, in focus.', 'غرفة أخبارك، بوضوح.')} description={t('A thoughtful workspace for the stories you’re ready to tell.', 'مساحة عمل مدروسة للقصص التي تستعد لروايتها.')}>
      <Button asChild><Link href="/campaigns?new=true"><Plus size={16} aria-hidden="true" />{t('New campaign', 'حملة جديدة')}</Link></Button>
    </PageHeading>

    <div className="metric-grid support-metrics">{metrics.map(metric => <Link key={metric.href} href={metric.href} className="metric-card support-metric"><div className="support-metric-top"><span>{metric.label}</span><metric.icon size={18} aria-hidden="true" /></div><strong>{metric.value.toLocaleString(locale === 'ar' ? 'ar-JO' : 'en-GB')}</strong><div className="support-metric-bottom"><span>{metric.detail}</span><ArrowUpRight size={15} aria-hidden="true" /></div></Link>)}</div>

    <div className="support-overview-grid">
      <section className="support-focus-panel" aria-labelledby="focus-title">
        <div className="support-focus-kicker"><span className="support-live-dot" /><span>{t('In the editor’s chair', 'على مكتب المحرّر')}</span></div>
        {nextCampaign ? <><div className="support-focus-content"><div><h2 id="focus-title">{t('A fresh perspective makes all the difference.', 'رؤية جديدة تصنع الفارق.')}</h2><p>{t('Your next story is waiting for a thoughtful review. Fine-tune the details and make it yours.', 'قصتك التالية بانتظار مراجعة متأنية. اضبط التفاصيل وأضف رؤيتك.')}</p><Button asChild className="support-lime-button"><Link href={`/campaigns/${nextCampaign.id}/review`}>{t('Continue reviewing', 'متابعة المراجعة')}<ArrowRight size={16} aria-hidden="true" /></Link></Button></div><div className="support-mini-document"><div className="support-mini-document-meta"><FileText size={16} aria-hidden="true" /><span>{t('Press release', 'بيان صحفي')}</span><span className="support-mini-dot" /></div><h3 dir="auto">{nextCampaign.content.title}</h3><p dir="auto">{nextCampaign.content.paragraphs[0]}</p><div className="support-mini-document-footer"><span>{t('Your review matters', 'مراجعتك تُحدث فرقًا')}</span><Sparkles size={14} aria-hidden="true" /></div></div></div></> : <><h2 id="focus-title">{t('Everything is up to date.', 'كل شيء مُحدَّث.')}</h2><p>{t('Your stories have been reviewed. Start a new campaign when inspiration strikes.', 'تمت مراجعة قصصك. ابدأ حملة جديدة عندما تحضر الفكرة.')}</p><Button asChild className="support-lime-button"><Link href="/campaigns?new=true">{t('Create a campaign', 'إنشاء حملة')}<Plus size={16} aria-hidden="true" /></Link></Button></>}
      </section>
      <section className="panel support-agent-summary" aria-labelledby="agent-summary-title"><div className="panel-header"><div><h2 id="agent-summary-title" className="section-title">{t('Your small, mighty team', 'فريقك الصغير، أثره كبير')}</h2><p className="small muted">{t('Simulated agents. Human direction.', 'وكلاء بالمحاكاة. توجيه بشري.')}</p></div><Bot size={19} aria-hidden="true" /></div><div className="support-agent-mini-list">{state.agents.map(agent => <div className="support-agent-mini" key={agent.id}><span className={`support-agent-dot ${agent.active ? 'is-active' : ''}`} /><span>{agentNames[agent.id]}</span><span className="small muted">{agent.active ? t('Active', 'نشط') : t('Paused', 'متوقف')}</span></div>)}</div><Link className="support-inline-link" href="/agents">{t('Meet your agents', 'تعرّف على وكلائك')}<ArrowRight size={15} aria-hidden="true" /></Link></section>
    </div>

    <div className="support-overview-lower"><section className="panel" aria-labelledby="recent-campaigns-title"><div className="panel-header"><h2 id="recent-campaigns-title" className="section-title">{t('Recent campaigns', 'الحملات الأخيرة')}</h2><Link className="support-inline-link" href="/campaigns">{t('View all', 'عرض الكل')}<ArrowUpRight size={15} aria-hidden="true" /></Link></div>{recent.length ? <div className="support-recent-list">{recent.map(campaign => <Link href={`/campaigns/${campaign.id}/review`} key={campaign.id} className="support-recent-campaign"><span className="support-file-icon"><FileText size={18} aria-hidden="true" /></span><span className="support-recent-campaign-text"><strong><bdi>{campaign.name}</bdi></strong><span className="muted small"><bdi>{campaign.market}</bdi><span aria-hidden="true"> · </span>{formatDate(campaign.updatedAt, locale)}</span></span><StatusBadge status={campaign.status} /><ArrowUpRight size={16} className="muted" aria-hidden="true" /></Link>)}</div> : <EmptyState icon={FolderOpen} title={t('Your next story starts here', 'قصتك التالية تبدأ هنا')} description={t('Create your first campaign to see it in your workspace.', 'أنشئ حملتك الأولى لتظهر في مساحة عملك.')} />}</section>
      <section className="panel" aria-labelledby="activity-title"><div className="panel-header"><h2 id="activity-title" className="section-title">{t('Latest activity', 'أحدث الأنشطة')}</h2><Clock3 size={17} className="muted" aria-hidden="true" /></div><div className="support-activity-list">{activities.length ? activities.map(activity => <div key={`${activity.campaignId}-${activity.id}`} className="support-activity"><span className="support-activity-icon"><CircleDot size={14} aria-hidden="true" /></span><div><p dir="auto">{locale === 'ar' ? activityLabels[activity.type] || activity.text : activity.text}</p><Link href={`/campaigns/${activity.campaignId}/review`}><bdi>{activity.campaignName}</bdi></Link><time dateTime={activity.createdAt}>{formatDate(activity.createdAt, locale, true)}</time></div></div>) : <p className="muted small">{t('Your campaign milestones will appear here.', 'ستظهر مراحل حملتك هنا.')}</p>}</div></section>
    </div>
  </>;
}
