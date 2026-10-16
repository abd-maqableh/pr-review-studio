import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatDate(value: string, locale: 'en' | 'ar' = 'en', time = false) { return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-GB', { day: 'numeric', month: 'short', ...(time ? { hour: '2-digit', minute: '2-digit' } : {}), timeZone: 'Asia/Amman' }).format(new Date(value)); }
