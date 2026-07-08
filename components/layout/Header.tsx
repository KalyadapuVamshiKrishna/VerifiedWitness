'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/' },
    { label: 'Analyze', href: '/analyze' },
    { label: 'Report', href: '/report' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="container-padding flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">VerifiedWitness</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {active && (
                  <motion.div
                    layoutId="navUnderline"
                    className="absolute inset-0 rounded-md bg-amber-500/15 border border-amber-500/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Empty space for alignment */}
        <div className="w-32" />
      </nav>
    </header>
  );
}
