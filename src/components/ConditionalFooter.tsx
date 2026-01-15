"use client";

import { usePathname } from 'next/navigation';
import { Footer } from './layout/footer';

/**
 * ConditionalFooter - Only renders footer on non-admin pages
 */
export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't render footer on admin, client, or CEO dashboard pages
  const isDashboard = pathname?.startsWith('/admin') || 
                      pathname?.startsWith('/client') || 
                      pathname?.startsWith('/ceo');
  
  if (isDashboard) {
    return null;
  }
  
  return <Footer />;
}
