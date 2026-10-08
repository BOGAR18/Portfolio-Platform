import { useEffect } from "react";
import { MotionConfig, AnimatePresence, motion } from "motion/react";
import { useLocation, useOutlet } from "react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "@/features/chat/ChatWidget";
import CommandPalette from "@/features/search/CommandPalette";
import { useApplyTheme } from "@/hooks/useApplyTheme";
import { track } from "@/lib/analytics";
import { useUiStore } from "@/store/ui";

export default function Layout() {
  useApplyTheme();
  const locale = useUiStore((s) => s.locale);
useEffect(() => {
  document.documentElement.lang = locale;
}, [locale]);

  const { pathname } = useLocation();
  // Halaman aktif sebagai elemen React, dipakai AnimatePresence agar halaman lama
  // masih bisa dianimasikan keluar sebelum halaman baru masuk
  const outlet = useOutlet();

  useEffect(() => {
    // Halaman admin tidak dihitung sebagai kunjungan publik
    if (!pathname.startsWith("/admin")) track("pageview", pathname);
  }, [pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Navbar />

        <main className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
        <ChatWidget />
        <CommandPalette />
      </div>
    </MotionConfig>
  );
}