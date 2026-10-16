'use client';
import { useState } from 'react';
import { diffWords } from 'diff';
import { Clock3, GitCompareArrows, Check, FileText } from 'lucide-react';
import type { Campaign, DocumentContent, Locale } from '@/lib/types';
import { formatDate } from '@/lib/utils';
export function TextDiff({ before, after }: { before: string; after: string }) {
  return <div className="text-diff" dir="auto">{diffWords(before, after).map((part, index) => part.added ? <ins key={index}>{part.value}</ins> : part.removed ? <del key={index}>{part.value}</del> : <span key={index}>{part.value}</span>)}</div>;
}
export function VersionComparison({ campaign, content, locale }: { campaign: Campaign; content: DocumentContent; locale: Locale }) {
  const [fromId, setFromId] = useState(campaign.versions[Math.max(0, campaign.versions.length - 2)]?.id ?? '');
  const [toId, setToId] = useState('working');
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const before = campaign.versions.find(version => version.id === fromId) ?? campaign.versions[0];
  const after = toId === 'working' ? content : campaign.versions.find(version => version.id === toId) ?? content;
  return <div className="version-comparison"><div className="compare-controls"><label className="field"><span className="field-label">{t('Compare from', 'قارن من')}</span><select className="select" value={fromId} onChange={e => setFromId(e.target.value)}>{campaign.versions.map(version => <option key={version.id} value={version.id}>{t('Version', 'النسخة')} {version.number}</option>)}</select></label><GitCompareArrows size={20} aria-hidden="true"/><label className="field"><span className="field-label">{t('Compare to', 'قارن مع')}</span><select className="select" value={toId} onChange={e => setToId(e.target.value)}><option value="working">{t('Current working draft', 'المسودة الحالية')}</option>{campaign.versions.map(version => <option key={version.id} value={version.id}>{t('Version', 'النسخة')} {version.number}</option>)}</select></label></div><div className="diff-legend"><span><i className="added-key"/>{t('Added', 'إضافة')}</span><span><i className="removed-key"/>{t('Removed', 'حذف')}</span></div><div className="diff-document" dir={campaign.language === 'ar' ? 'rtl' : 'ltr'}>{before && <TextDiff before={[before.title, ...before.paragraphs].join('\n\n')} after={[after.title, ...after.paragraphs].join('\n\n')}/>}</div>{before && JSON.stringify([before.title, before.paragraphs]) === JSON.stringify([after.title, after.paragraphs]) && <p className="info-note"><Check size={16}/>{t('These versions are identical.', 'هاتان النسختان متطابقتان.')}</p>}</div>;
}
export function VersionHistory({ campaign, locale }: { campaign: Campaign; locale: Locale }) {
  const [selectedId, setSelectedId] = useState(campaign.versions.at(-1)?.id ?? '');
  const selected = campaign.versions.find(v => v.id === selectedId) ?? campaign.versions.at(-1);
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  return <div className="version-history"><div className="history-heading"><Clock3 size={20}/><div><h3>{t('Every change, kept in context.', 'كل تغيير محفوظ في سياقه.')}</h3><p className="muted small">{t('Saved versions are immutable snapshots of your story.', 'النسخ المحفوظة لقطات ثابتة من قصتك.')}</p></div></div><div className="version-list">{[...campaign.versions].reverse().map((version, index) => <button className={`version-item ${selectedId === version.id ? 'selected' : ''}`} key={version.id} onClick={() => setSelectedId(version.id)} aria-pressed={selectedId === version.id}><FileText size={17}/><span><strong>{t('Version', 'النسخة')} {version.number}</strong><small>{formatDate(version.createdAt, locale, true)}</small></span>{index === 0 && <span className="badge">{t('Latest', 'الأحدث')}</span>}</button>)}</div>{selected && <article className="version-preview" dir={campaign.language === 'ar' ? 'rtl' : 'ltr'} lang={campaign.language}><span className="small muted">{t('Read-only snapshot', 'نسخة للقراءة فقط')} · {t('Version', 'النسخة')} {selected.number}</span><h3>{selected.title}</h3>{selected.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>}</div>;
}
