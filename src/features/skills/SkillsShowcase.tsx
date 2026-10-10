import { Link } from "react-router";
import { motion } from "motion/react";
import type { SkillDto } from "@shared/types";
import Reveal from "@/components/Reveal";
import { useT } from "@/i18n";

export default function SkillsShowcase({ skills }: { skills: SkillDto[] }) {
  const t = useT();

  const groups = skills.reduce<Record<string, SkillDto[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(groups).map(([category, items], gi) => (
        <Reveal key={category} delay={gi * 0.08} className="h-full">
          <div className="h-full rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="eyebrow">{t(`category.${category}`)}</h3>
              <span className="text-xs text-slate-400">{items.length}</span>
            </div>

            <ul className="space-y-4">
              {items.map((s, i) => (
                <li key={s.id}>
                  <Link
                    to={`/projects?skill=${encodeURIComponent(s.name)}`}
                    className="group block rounded-md transition-colors hover:text-brand-700 dark:hover:text-brand-300"
                  >
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs text-slate-500">{t(`level.${s.level}`)}</span>
                    </div>

                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <motion.span
                          key={n}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: gi * 0.08 + i * 0.05 + n * 0.05,
                            duration: 0.4,
                            ease: "easeOut",
                          }}
                          style={{ originX: 0 }}
                          className={`h-1 flex-1 ${
                            n <= s.level
                              ? "bg-brand-700 dark:bg-brand-300"
                              : "bg-slate-200 dark:bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}