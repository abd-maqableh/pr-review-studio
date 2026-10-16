import Link from 'next/link';
export default function NotFound() { return <section className="empty-state"><h1>This page isn’t in the studio.</h1><p>Return to your campaigns to keep reviewing.</p><Link className="button button--default" href="/campaigns">View campaigns</Link></section>; }
