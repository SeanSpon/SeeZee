"use client";

import { usePathname } from 'next/navigation';
import { Footer } from './layout/footer';

/**
 * ConditionalFooter - Only renders footer on non-admin pages
 */
export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't render footer on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Footer />;
}
