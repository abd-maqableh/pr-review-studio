import type { Metadata } from 'next';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/newsreader/500.css';
import '@fontsource/noto-sans-arabic/400.css';
import '@fontsource/noto-sans-arabic/600.css';
import './globals.css';
import { DemoProvider } from '@/lib/store';
import { DraftProvider } from '@/lib/drafts';
import { AppShell } from '@/components/app-shell';
export const metadata: Metadata = { title: 'PR Review Studio · Independent concept by Abdallah', description: 'A thoughtful workspace for reviewing press releases. An independent frontend portfolio concept with simulated data, built by Abdallah.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><DemoProvider><DraftProvider><AppShell>{children}</AppShell></DraftProvider></DemoProvider></body></html>; }
