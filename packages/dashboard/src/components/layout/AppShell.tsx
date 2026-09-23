/**
 * The frame around every page: a fixed sidebar on desktop, a slide-in drawer on
 * mobile, the command palette, and an entrance transition on each route change.
 */
import { List } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { Dialog } from 'radix-ui';
import { useEffect, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';

import { Button } from '@/components/ui/button';
import { useLiveUpdates } from '@/lib/live';

import { CommandPalette } from './CommandPalette';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const live = useLiveUpdates();
  const { pathname } = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ⌘K / Ctrl+K anywhere, and "/" when not typing, open the palette.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const typing =
        event.target instanceof HTMLElement && event.target.closest('input, textarea, [contenteditable]');
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const openPalette = () => {
    setDrawerOpen(false);
    setPaletteOpen(true);
  };

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-line bg-canvas lg:block">
        <Sidebar live={live} onSearch={openPalette} />
      </aside>

      {/* Mobile top bar + drawer */}
      <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-line bg-canvas/85 px-3 backdrop-blur lg:hidden">
        <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Dialog.Trigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation">
              <List size={18} />
            </Button>
          </Dialog.Trigger>
          <AnimatePresence>
            {drawerOpen && (
              <Dialog.Portal forceMount>
                <Dialog.Overlay asChild forceMount>
                  <motion.div
                    className="fixed inset-0 z-40 bg-black/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                </Dialog.Overlay>
                <Dialog.Content asChild forceMount aria-describedby={undefined}>
                  <motion.aside
                    className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-line bg-canvas"
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 40 }}
                  >
                    <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                    <Sidebar live={live} onSearch={openPalette} onNavigate={() => setDrawerOpen(false)} />
                  </motion.aside>
                </Dialog.Content>
              </Dialog.Portal>
            )}
          </AnimatePresence>
        </Dialog.Root>
        <img src="/favicon.svg" alt="" className="size-5 rounded ring-1 ring-line" />
        <span className="text-[14px] font-semibold tracking-tight">Ionio Skills</span>
      </header>

      <main className="lg:pl-60">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-[1180px] px-4 pt-6 pb-24 sm:px-8 lg:pt-10"
        >
          <Outlet />
        </motion.div>
      </main>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <ScrollRestoration />
    </div>
  );
}
