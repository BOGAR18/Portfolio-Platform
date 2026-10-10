import { useEffect } from "react";
import { MotionConfig, motion } from "motion/react";
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
  const { pathname } = useLocation();
  // Halaman aktif sebagai elemen React
  const outlet = useOutlet();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    // Halaman admin tidak dihitung sebagai kunjungan publik
    if (!pathname.startsWith("/admin")) track("pageview", pathname);
  }, [pathname]);

  // Setiap pindah halaman, mulai dari bagian atas
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Navbar />

        <main className="flex-1">
          {/* Halaman baru langsung dipasang. Tidak menunggu animasi halaman lama selesai. */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {outlet}
          </motion.div>
        </main>

        <Footer />
        <ChatWidget />
        <CommandPalette />
      </div>
    </MotionConfig>
  );
}