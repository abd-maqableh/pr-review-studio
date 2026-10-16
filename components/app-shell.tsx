'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderOpen, FileCheck2, Bot, Radio, ArrowUpRight, ChevronsUpDown, BookOpen, RotateCcw, Globe2, Menu, X, ShieldCheck, Check, AlertTriangle, PenLine } from 'lucide-react';
import { useDemo } from '@/lib/store';
import { useDrafts } from '@/lib/drafts';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog';
const navigation = [
  { href: '/overview', icon: LayoutDashboard, en: 'Overview', ar: 'نظرة عامة' },
  { href: '/campaigns', icon: FolderOpen, en: 'Campaigns', ar: 'الحملات' },
  { href: '/campaigns/camp-noura/review', icon: FileCheck2, en: 'Content review', ar: 'مراجعة المحتوى' },
  { href: '/agents', icon: Bot, en: 'AI agents', ar: 'وكلاء الذكاء الاصطناعي' },
  { href: '/coverage', icon: Radio, en: 'Media coverage', ar: 'التغطية الإعلامية' },
];
export function AppShell({ children }: { children: ReactNode }) {
  const { state, ready, storageWarning, notice, dispatch, resetDemo } = useDemo();
  const { clearAll } = useDrafts();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const mainContent = useRef<HTMLElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const resetTrigger = useRef<HTMLElement | null>(null);
  const guideTrigger = useRef<HTMLElement | null>(null);
  const mobileNavigated = useRef(false);
  const locale = state.locale;
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const isReview = pathname.includes('/review');
  const pageName = isReview ? t('Content review', 'مراجعة المحتوى') : navigation.find(item => item.href === pathname)?.[locale] ?? t('Workspace', 'مساحة العمل');
  const awaiting = state.campaigns.filter(c => c.status === 'in-review').length;
  const sessionOnly = Boolean(storageWarning?.includes('unavailable'));
  const storageMessage = sessionOnly
    ? t('Browser storage is unavailable. Changes will only last while this demo remains open.', 'تخزين المتصفح غير متاح. ستبقى التغييرات خلال هذه الجلسة فقط، ولن تُحفظ بعد إغلاق العرض أو إعادة تحميله.')
    : storageWarning?.includes('incompatible')
      ? t('Saved data uses an incompatible demo version. A fresh demo has been loaded.', 'البيانات المحفوظة تستخدم إصداراً غير متوافق من العرض. تم تحميل بيانات نموذجية جديدة.')
      : t('Saved demo data could not be restored. A fresh demo has been loaded.', 'تعذّرت استعادة بيانات العرض المحفوظة. تم تحميل بيانات نموذجية جديدة.');
  function restoreFocus(target: HTMLElement | null) {
    const visible = (element: HTMLElement | null) => element?.isConnected && element.getClientRects().length > 0;
    if (visible(target)) target?.focus({ preventScroll: true });
    else if (visible(mobileTrigger.current)) mobileTrigger.current?.focus({ preventScroll: true });
    else mainContent.current?.focus({ preventScroll: true });
  }
  function openGuide(trigger: HTMLButtonElement, mobile: boolean) {
    guideTrigger.current = mobile ? mobileTrigger.current : trigger;
    setMobileOpen(false);
    setGuideOpen(true);
  }
  function openReset(trigger: HTMLButtonElement, mobile: boolean) {
    resetTrigger.current = mobile ? mobileTrigger.current : trigger;
    setMobileOpen(false);
    setResetOpen(true);
  }
  function navigateFromSidebar() {
    mobileNavigated.current = true;
    setMobileOpen(false);
  }
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'; }, [locale]);
  const sidebar = (mobile = false) => <>
    <Link href="/overview" className="brand" onClick={navigateFromSidebar} aria-label={t('PR Review Studio overview', 'نظرة عامة على الاستوديو')}><span className="brand-mark"><PenLine size={24} strokeWidth={1.8} aria-hidden="true" /></span><span>PR Review<span className="brand-sub">Studio</span></span></Link>
    <div className="workspace-label"><span className="workspace-avatar">A</span><span>{t('Abdallah’s workspace', 'مساحة عمل عبدالله')}<small>{t('Personal workspace', 'مساحة عمل شخصية')}</small></span><ChevronsUpDown size={13} aria-hidden="true" /></div>
    <p className="nav-section-label">{t('Workspace', 'مساحة العمل')}</p>
    <nav aria-label={t('Main navigation', 'التنقل الرئيسي')} className="nav-list">{navigation.map(item => { const active = item.href.includes('/review') ? isReview : pathname === item.href; return <Link key={item.en} href={item.href} className={`nav-item ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined} onClick={navigateFromSidebar}><item.icon size={18} strokeWidth={1.7} aria-hidden="true" /><span>{item[locale]}</span>{item.en === 'Content review' && awaiting > 0 && <span className="nav-count">{awaiting}</span>}</Link>; })}</nav>
    <div className="sidebar-bottom"><div className="studio-note"><span className="small-orbit" aria-hidden="true"><span /></span><h3>{t('Your voice. A little sharper.', 'صوتك. بوضوح أكبر.')}</h3><p>{t('AI lends a hand. You have the final say.', 'الذكاء الاصطناعي يساعدك. والقرار الأخير لك.')}</p><button aria-haspopup="dialog" onClick={event => openGuide(event.currentTarget, mobile)}>{t('Explore the demo', 'استكشف العرض')}<ArrowUpRight size={15} aria-hidden="true" /></button></div>
    <button className="sidebar-reset" aria-haspopup="dialog" onClick={event => openReset(event.currentTarget, mobile)}><RotateCcw size={16} aria-hidden="true" />{t('Reset demo', 'إعادة ضبط العرض')}</button><div className="sidebar-profile"><span className="profile-avatar">A</span><span>Abdallah<small>{t('Senior frontend engineer', 'مهندس واجهات أمامية أول')}</small></span><span className="online-dot" /></div></div>
    {mobile && <DialogClose className="mobile-close" aria-label={t('Close navigation', 'إغلاق التنقل')}><X size={20}/></DialogClose>}
  </>;
  return <div className="app-shell" dir={locale === 'ar' ? 'rtl' : 'ltr'}><a className="skip-link" href="#main-content">{t('Skip to content', 'انتقل إلى المحتوى')}</a><aside className="sidebar">{sidebar()}</aside>
    <div className="app-main"><header className="topbar"><div className="topbar-location"><Button variant="ghost" size="icon" className="mobile-menu" ref={mobileTrigger} aria-label={t('Open navigation', 'فتح التنقل')} aria-haspopup="dialog" aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => { mobileNavigated.current = false; setMobileOpen(true); }}><Menu size={20} aria-hidden="true"/></Button><span className="topbar-home">{t('Workspace', 'مساحة العمل')}</span><span className="breadcrumb-slash">/</span><span>{pageName}</span></div><div className="topbar-actions"><span className="local-chip"><span />{sessionOnly ? t('Session only', 'هذه الجلسة فقط') : t('Local demo', 'عرض محلي')}</span><button className="language-button" onClick={() => dispatch({ type: 'locale', locale: locale === 'en' ? 'ar' : 'en' })} aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}><Globe2 size={16} aria-hidden="true"/><span>{locale === 'en' ? 'العربية' : 'English'}</span></button><Button variant="ghost" size="icon" className="guide-button" onClick={event => openGuide(event.currentTarget, false)} aria-haspopup="dialog" aria-label={t('Demo guide', 'دليل العرض')}><BookOpen size={17} aria-hidden="true"/></Button><span className="header-avatar" aria-label="Abdallah">A</span></div></header>
    <main id="main-content" className="main-content" ref={mainContent} tabIndex={-1}>{storageWarning && <div className="storage-warning" role="alert"><AlertTriangle size={18} aria-hidden="true"/><span>{storageMessage}</span></div>}{ready ? children : <div className="loading-state" role="status"><span className="loading-dot" />{t('Preparing your studio…', 'جارٍ تجهيز الاستوديو…')}</div>}</main>
    <footer className="app-footer"><span>Independent concept by Abdallah · Simulated data.</span><span className="footer-private"><ShieldCheck size={13} aria-hidden="true"/>{sessionOnly ? t('Session only · not saved', 'هذه الجلسة فقط · غير محفوظ') : t('Stored on this browser', 'محفوظ في هذا المتصفح')}</span></footer></div>
    <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite">{notice && <><Check size={17}/><span>{notice}</span></>}</div>
    <Dialog open={mobileOpen} onOpenChange={setMobileOpen}><DialogContent id="mobile-navigation" className="mobile-sidebar" showCloseButton={false} closeLabel={t('Close navigation', 'إغلاق التنقل')} onCloseAutoFocus={event => { event.preventDefault(); if (!resetOpen && !guideOpen) restoreFocus(mobileNavigated.current ? mainContent.current : mobileTrigger.current); }}><DialogHeader className="sr-only"><DialogTitle>{t('Navigation', 'التنقل')}</DialogTitle><DialogDescription>{t('Choose a workspace screen.', 'اختر شاشة من مساحة العمل.')}</DialogDescription></DialogHeader>{sidebar(true)}</DialogContent></Dialog>
    <Dialog open={resetOpen} onOpenChange={setResetOpen}><DialogContent closeLabel={t('Close', 'إغلاق')} onCloseAutoFocus={event => { event.preventDefault(); restoreFocus(resetTrigger.current); }}><DialogHeader><DialogTitle>{t('Start fresh?', 'البدء من جديد؟')}</DialogTitle><DialogDescription>{t('This removes your campaigns, edits, comments and approvals, then restores the fictional sample workspace. This cannot be undone.', 'سيحذف هذا حملاتك وتعديلاتك وتعليقاتك وموافقاتك، ثم يستعيد مساحة العمل الخيالية. لا يمكن التراجع عن هذه الخطوة.')}</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="outline">{t('Keep my work', 'الاحتفاظ بعملي')}</Button></DialogClose><Button variant="destructive" onClick={() => { resetTrigger.current = mainContent.current; clearAll(); resetDemo(); setResetOpen(false); router.push('/campaigns/camp-noura/review'); }}>{t('Reset demo', 'إعادة ضبط العرض')}</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={guideOpen} onOpenChange={setGuideOpen}><DialogContent closeLabel={t('Close', 'إغلاق')} onCloseAutoFocus={event => { event.preventDefault(); restoreFocus(guideTrigger.current); }}><DialogHeader><DialogTitle>{t('A little help. A human decision.', 'القليل من المساعدة. والقرار لك.')}</DialogTitle><DialogDescription>{t('An independent portfolio concept by Abdallah, exploring thoughtful AI-assisted PR workflows.', 'تصور مستقل من أعمال عبدالله، يستكشف مراجعة محتوى العلاقات العامة بمساعدة الذكاء الاصطناعي.')}</DialogDescription></DialogHeader><ol className="guide-steps"><li><strong>{t('Start with the story', 'ابدأ بالقصة')}</strong><p>{t('Open a campaign. Select any paragraph to edit it or try a prewritten rewrite.', 'افتح حملة. اختر فقرة لتعديلها أو تجربة إعادة صياغة مكتوبة مسبقاً.')}</p></li><li><strong>{t('Stay in control', 'ابقَ متحكماً')}</strong><p>{t('Preview, apply or discard suggestions. Save versions, compare changes and leave feedback.', 'عاين الاقتراحات ثم طبقها أو تجاهلها. احفظ النسخ وقارن التغييرات وأضف ملاحظاتك.')}</p></li><li><strong>{t('Give the final word', 'اتخذ القرار الأخير')}</strong><p>{t('Request a review, then approve or ask for changes. Editing invalidates approval.', 'اطلب مراجعة، ثم وافق أو اطلب تغييرات. أي تعديل يلغي الموافقة.')}</p></li></ol><p className="info-note">{t('No real AI, publishing, outreach or tracking. All organizations and coverage are fictional. Only sample text supports simulated rewrites. Your saved data stays in this browser; do not enter sensitive information.', 'لا يوجد ذكاء اصطناعي فعلي أو نشر أو إرسال أو تتبع. جميع الجهات والتغطية خيالية. إعادة الصياغة متاحة للنصوص النموذجية فقط. تبقى بياناتك في هذا المتصفح؛ لا تدخل معلومات حساسة.')}</p><DialogFooter><DialogClose asChild><Button>{t('Let’s review', 'لنبدأ المراجعة')}</Button></DialogClose></DialogFooter></DialogContent></Dialog>
  </div>;
}
