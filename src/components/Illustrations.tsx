import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

// Ilustrasi garis tipis. Warna mengikuti currentColor agar ikut mode terang dan gelap.

export function HeroArt(props: Props) {
  const dots = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={60 + c * 40}
          cy={60 + r * 40}
          r={1.2}
          fill="currentColor"
          stroke="none"
          opacity={0.3}
        />,
      );
    }
  }
  const nodes: [number, number][] = [
    [240, 96],
    [360, 180],
    [330, 320],
    [150, 320],
    [120, 180],
  ];

  return (
    <svg viewBox="0 0 480 480" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden="true" {...props}>
      {dots}
      <circle cx="240" cy="240" r="170" opacity="0.35" />
      <circle cx="240" cy="240" r="110" opacity="0.6" />
      <circle cx="240" cy="240" r="48" />
      <path d={`M${nodes.map(([x, y]) => `${x} ${y}`).join(" L")} Z`} opacity="0.7" />
      {nodes.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill="var(--color-brand-700)" stroke="none" />
      ))}
      <circle cx="240" cy="240" r={5} fill="var(--color-brand-700)" stroke="none" />
    </svg>
  );
}

// Dipakai sebagai gambar cadangan untuk project yang belum punya foto
export function ProjectArt(props: Props) {
  return (
    <svg
      viewBox="0 0 400 225"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M0 45H400M0 90H400M0 135H400M0 180H400M80 0V225M160 0V225M240 0V225M320 0V225"
        opacity="0.15"
      />
      <rect x="110" y="48" width="180" height="129" rx="4" fill="var(--color-brand-100)" stroke="var(--color-brand-300)" />
      <path d="M110 84H290" stroke="var(--color-brand-300)" />
      <circle cx="136" cy="66" r="4" fill="var(--color-brand-600)" stroke="none" />
      <path d="M134 150L170 118L200 138L236 104L266 126" stroke="var(--color-brand-600)" strokeWidth={1.5} />
    </svg>
  );
}

export function EmptyArt(props: Props) {
  return (
    <svg viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden="true" {...props}>
      <rect x="32" y="28" width="96" height="66" rx="4" />
      <path d="M32 46H128" />
      <path d="M52 62H108M52 74H92" opacity="0.5" />
      <path d="M60 28V20H100V28" opacity="0.5" />
    </svg>
  );
}

export function ContactArt(props: Props) {
  return (
    <svg viewBox="0 0 240 180" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden="true" {...props}>
      <rect x="30" y="50" width="180" height="110" rx="4" />
      <path d="M30 54L120 116L210 54" />
      <path d="M70 30L190 22L150 60" opacity="0.5" />
      <path d="M70 30L120 116" opacity="0.3" />
    </svg>
  );
}

export function NotFoundArt(props: Props) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden="true" {...props}>
      <circle cx="100" cy="100" r="78" />
      <circle cx="100" cy="100" r="58" opacity="0.4" />
      <path d="M100 52L116 100L100 148L84 100Z" />
      <path d="M100 22V34M100 166V178M22 100H34M166 100H178" opacity="0.6" />
    </svg>
  );
}