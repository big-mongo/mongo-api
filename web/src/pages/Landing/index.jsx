import React, { useEffect, useState } from 'react';

const MODELS = [
  { name: 'GPT-4o', color: '#00b485' },
  { name: 'Claude 3.5', color: '#ff7a2f' },
  { name: 'Gemini Pro', color: '#377dff' },
  { name: 'Llama 3', color: '#07a3e0' },
  { name: 'DeepSeek', color: '#6367f0' },
  { name: 'Qwen 2.5', color: '#c95fff' },
];

const CLOSED_SOURCE_FEATURES = [
  '闭源模型全接入 (GPT/Claude/Gemini)',
  'Token 永久有效',
  '原生并发能力不封顶',
  'API 调用实时审计',
];

const CODE_PLAN_FEATURES = [
  '开源强模型全速访问',
  '4小时定量配额自动重置',
  '极速本地网关分发',
  '100% 隐私安全隔离',
];

const IconBase = ({ children, className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {children}
  </svg>
);

const IconPulse = ({ className }) => (
  <IconBase className={className}>
    <path d="M3 12h4l2.4-5.4 4.2 10.8 2.2-5.4H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </IconBase>
);

const IconArrowRight = ({ className }) => (
  <IconBase className={className}>
    <path d="M4 12h15" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    <path d="m12 5 7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </IconBase>
);

const IconDatabase = ({ className }) => (
  <IconBase className={className}>
    <ellipse cx="12" cy="5" rx="7" ry="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" stroke="currentColor" strokeWidth="1.8" />
  </IconBase>
);

const IconCrown = ({ className }) => (
  <IconBase className={className}>
    <path d="M3.5 8.5 7.8 13l4.2-5.9L16.2 13l4.3-4.5L19 19H5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </IconBase>
);

const IconCheck = ({ className }) => (
  <IconBase className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="m8.2 12.2 2.6 2.6 5-5.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </IconBase>
);

const IconBolt = ({ className }) => (
  <IconBase className={className}>
    <path d="M13 2 5 13h5l-1 9 8-11h-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </IconBase>
);

const IconLayers = ({ className }) => (
  <IconBase className={className}>
    <path d="m12 4 8 4-8 4-8-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="m4 12 8 4 8-4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="m4 16 8 4 8-4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </IconBase>
);

const IconGlobe = ({ className }) => (
  <IconBase className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3 12h18M12 3c2.7 2.5 4.1 5.5 4.1 9S14.7 18.5 12 21c-2.7-2.5-4.1-5.5-4.1-9S9.3 5.5 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </IconBase>
);

const IconShield = ({ className }) => (
  <IconBase className={className}>
    <path d="M12 3 5 6v6c0 4.4 2.4 7.2 7 9 4.6-1.8 7-4.6 7-9V6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="m8.5 12.2 2.2 2.2 4.8-4.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </IconBase>
);

const IconRefresh = ({ className }) => (
  <IconBase className={className}>
    <path d="M20 6v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 18v-5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 11a7 7 0 0 0-12-4.5L5 8M5 13a7 7 0 0 0 12 4.5L19 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </IconBase>
);

const IconCode = ({ className }) => (
  <IconBase className={className}>
    <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </IconBase>
);

const IconGauge = ({ className }) => (
  <IconBase className={className}>
    <path d="M4 14a8 8 0 1 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="m12 12 4-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </IconBase>
);

const Orbit = () => (
  <div className="landing-iso__orbit" aria-hidden="true">
    <div className="landing-iso__orbit-core">
      W
      <span className="landing-iso__orbit-glow" />
    </div>
    <div className="landing-iso__orbit-ring landing-iso__orbit-ring--inner" />
    <div className="landing-iso__orbit-ring landing-iso__orbit-ring--outer" />
    {MODELS.map((model, index) => (
      <div
        key={model.name}
        className="landing-iso__satellite"
        style={{
          '--orbit-angle': `${(360 / MODELS.length) * index}deg`,
          '--orbit-color': model.color,
        }}
      >
        <div className="landing-iso__satellite-pill">
          <span className="landing-iso__satellite-dot" />
          <span>{model.name}</span>
        </div>
      </div>
    ))}
  </div>
);

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // 强制重置 body 样式，防止主题系统影响
    const originalBodyBg = document.body.style.backgroundColor;
    const originalBodyColor = document.body.style.color;
    const originalHtmlBg = document.documentElement.style.backgroundColor;
    
    document.body.style.backgroundColor = '#f5f7fb';
    document.body.style.color = '#0f1828';
    document.documentElement.style.backgroundColor = '#f5f7fb';
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      // 恢复原来的样式
      document.body.style.backgroundColor = originalBodyBg;
      document.body.style.color = originalBodyColor;
      document.documentElement.style.backgroundColor = originalHtmlBg;
    };
  }, []);

  return (
    <div className="landing-iso" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <style>{`
        /* 完全隔离和重置 Landing 页面样式，避免被主题系统和 Semi Design 影响 */
        .landing-iso {
          --bg-main: #f5f7fb;
          --bg-panel: #ffffff;
          --bg-panel-soft: rgba(255, 255, 255, 0.76);
          --ink-main: #0f1828;
          --ink-soft: #556174;
          --line-soft: rgba(20, 44, 80, 0.12);
          --line-strong: rgba(20, 44, 80, 0.2);
          --blue: #0c70f2;
          --blue-glow: rgba(12, 112, 242, 0.33);
          --dark: #0b0f17;
          --dark-soft: #161f30;
          --radius-xl: 40px;
          --radius-lg: 28px;
          --radius-md: 18px;
          --shadow-card: 0 24px 64px rgba(13, 31, 58, 0.11);
          --content-width: min(1120px, 92vw);
          position: relative;
          min-height: 100vh;
          width: 100%;
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden;
          color: var(--ink-main);
          background:
            radial-gradient(circle at 12% 8%, rgba(61, 139, 255, 0.2), transparent 32%),
            radial-gradient(circle at 86% 22%, rgba(141, 97, 255, 0.14), transparent 30%),
            linear-gradient(180deg, #f8faff 0%, var(--bg-main) 40%, #f6f8fc 100%);
          font-family: "Sora", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
          line-height: 1.45;
          letter-spacing: 0.01em;
        }

        .landing-iso * {
          box-sizing: border-box;
        }

        .landing-iso a {
          color: inherit;
          text-decoration: none;
        }

        .landing-iso__container {
          width: var(--content-width);
          margin: 0 auto;
        }

        .landing-iso__nav-wrap {
          position: fixed;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          width: var(--content-width);
        }

        .landing-iso__nav {
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 10px 18px;
          transition: background 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
        }

        .landing-iso__nav.is-scrolled {
          background: rgba(255, 255, 255, 0.82);
          border-color: var(--line-soft);
          box-shadow: 0 10px 34px rgba(8, 21, 39, 0.14);
        }

        .landing-iso__brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .landing-iso__brand-badge {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(145deg, #0b7df9 0%, #0b58db 100%);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.86rem;
          box-shadow: 0 10px 20px rgba(13, 107, 239, 0.3);
        }

        .landing-iso__menu {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
          margin-right: auto;
        }

        .landing-iso__menu-link {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          padding: 9px 15px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.78);
          font-weight: 700;
          color: #35435a;
          transition: transform 180ms ease, background 180ms ease;
        }

        .landing-iso__menu-link:hover {
          transform: translateY(-1px);
          background: #fff;
        }

        .landing-iso__actions {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .landing-iso__btn {
          border: 0;
          border-radius: 999px;
          font: inherit;
          cursor: pointer;
          white-space: nowrap;
          transition: transform 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .landing-iso__btn--ghost {
          background: transparent;
          padding: 10px 14px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #2d3a50;
        }

        .landing-iso__btn--ghost:hover {
          color: #101925;
        }

        .landing-iso__btn--solid {
          background: #0e1625 !important;
          color: #fff !important;
          padding: 10px 18px;
          font-size: 0.75rem;
          font-weight: 700;
          box-shadow: 0 10px 22px rgba(11, 17, 30, 0.25);
        }

        .landing-iso__btn--solid:hover {
          transform: translateY(-1px);
        }

        .landing-iso__hero {
          padding: 148px 0 34px;
          position: relative;
          z-index: 10;
        }

        .landing-iso__hero-copy {
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
        }

        .landing-iso__badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #d5e8ff;
          background: #edf5ff;
          border-radius: 999px;
          padding: 6px 12px;
          margin-bottom: 22px;
          font-size: 0.64rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #0b69e4;
          font-weight: 700;
          animation: landingIso-float 3.6s ease-in-out infinite;
        }

        .landing-iso__icon-inline {
          width: 13px;
          height: 13px;
          flex: 0 0 auto;
        }

        .landing-iso__hero-title {
          margin: 0;
          font-size: clamp(2.7rem, 7vw, 5.6rem);
          line-height: 0.94;
          letter-spacing: -0.048em;
          font-weight: 900;
        }

        .landing-iso__title-gradient {
          display: inline-block;
          background: linear-gradient(90deg, #0c6df0 0%, #3f72ff 45%, #8a4dff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .landing-iso__hero-desc {
          max-width: 690px;
          margin: 24px auto 0;
          color: var(--ink-soft);
          font-size: clamp(1rem, 2.5vw, 1.22rem);
          line-height: 1.7;
          font-weight: 500;
        }

        .landing-iso__hero-desc em {
          color: var(--ink-main);
          font-style: normal;
          font-weight: 800;
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-decoration-color: #3f8eff;
          text-underline-offset: 4px;
        }

        .landing-iso__hero-cta {
          margin-top: 34px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
        }

        .landing-iso__btn--hero-primary,
        .landing-iso__btn--hero-secondary {
          height: 54px;
          padding: 0 28px;
          border-radius: 18px;
          font-size: 0.92rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .landing-iso__btn--hero-primary {
          background: linear-gradient(140deg, #0f7bfa 0%, #0a5cdd 100%);
          color: #fff;
          box-shadow: 0 20px 38px var(--blue-glow);
        }

        .landing-iso__btn--hero-primary:hover {
          transform: translateY(-1px) scale(1.01);
        }

        .landing-iso__btn--hero-secondary {
          border: 1px solid var(--line-soft);
          background: #fff;
          color: #162235;
        }

        .landing-iso__btn--hero-secondary:hover {
          background: #f9fbff;
        }

        .landing-iso__orbit {
          --orbit-radius: 215px;
          margin: 28px auto 8px;
          width: min(620px, 95vw);
          height: 430px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 5;
        }

        .landing-iso__orbit-core {
          width: 94px;
          height: 94px;
          border-radius: 30px;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #0d77f8 0%, #0a58db 100%);
          border: 2px solid rgba(255, 255, 255, 0.35);
          color: #fff;
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.06em;
          box-shadow: 0 0 45px rgba(12, 112, 242, 0.4);
          z-index: 5;
          animation: landingIso-pulse 2.5s ease-in-out infinite;
        }

        .landing-iso__orbit-glow {
          position: absolute;
          inset: -16px;
          border-radius: 999px;
          background: rgba(18, 127, 255, 0.28);
          filter: blur(20px);
          z-index: -1;
        }

        .landing-iso__orbit-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(10, 101, 228, 0.16);
        }

        .landing-iso__orbit-ring--inner {
          width: 320px;
          height: 320px;
          animation: landingIso-spin 18s linear infinite;
        }

        .landing-iso__orbit-ring--outer {
          width: 510px;
          height: 510px;
          border-color: rgba(143, 115, 255, 0.13);
          animation: landingIso-spin-reverse 24s linear infinite;
        }

        .landing-iso__satellite {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: center;
          animation: landingIso-orbit 23s linear infinite;
        }

        .landing-iso__satellite-pill {
          transform: translate(-50%, -50%);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 15px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 12px 24px rgba(15, 30, 51, 0.16);
          color: #102038;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0;
        }

        .landing-iso__satellite-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--orbit-color);
          box-shadow: 0 0 12px var(--orbit-color);
          flex: 0 0 auto;
        }

        .landing-iso__section {
          position: relative;
          z-index: 10;
        }

        .landing-iso__section-title {
          margin: 0;
          text-align: center;
          font-size: clamp(2rem, 5vw, 3.2rem);
          letter-spacing: -0.03em;
          font-weight: 850;
        }

        .landing-iso__section-subtitle {
          margin: 12px auto 0;
          text-align: center;
          max-width: 630px;
          color: var(--ink-soft);
          font-size: 1rem;
        }

        .landing-iso__pricing {
          margin-top: 34px;
          padding: 96px 0 110px;
          border-top: 1px solid rgba(24, 53, 92, 0.07);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.53) 0%, rgba(247, 250, 255, 0.86) 100%);
          position: relative;
          z-index: 10;
        }

        .landing-iso__cards {
          margin-top: 44px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .landing-iso__card {
          position: relative;
          border-radius: var(--radius-xl);
          padding: 34px 34px 30px;
          min-height: 540px;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--line-soft);
        }

        .landing-iso__card--light {
          background: var(--bg-panel);
          box-shadow: var(--shadow-card);
        }

        .landing-iso__card--dark {
          background: linear-gradient(155deg, #080d16 0%, #111a2b 75%);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.13);
          box-shadow: 0 35px 90px rgba(6, 12, 22, 0.45);
        }

        .landing-iso__card--dark::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: var(--radius-xl);
          background: linear-gradient(130deg, rgba(16, 132, 255, 0.5), rgba(142, 70, 255, 0.4));
          z-index: -1;
          filter: blur(22px);
          opacity: 0.7;
        }

        .landing-iso__card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 26px;
        }

        .landing-iso__card-kicker {
          font-size: 0.63rem;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-weight: 800;
          margin-bottom: 9px;
          color: #2f7dfd;
        }

        .landing-iso__card--dark .landing-iso__card-kicker {
          color: #67b8ff;
        }

        .landing-iso__card-title {
          margin: 0;
          font-size: 1.95rem;
          letter-spacing: -0.03em;
        }

        .landing-iso__card-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          border: 1px solid var(--line-soft);
          background: #f4f8ff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .landing-iso__card--dark .landing-iso__card-icon-box {
          border-color: rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
        }

        .landing-iso__icon-lg {
          width: 26px;
          height: 26px;
          color: #60718d;
        }

        .landing-iso__card--dark .landing-iso__icon-lg {
          color: #69b4ff;
        }

        .landing-iso__price-block {
          margin-bottom: 26px;
        }

        .landing-iso__price-main {
          font-size: 3.2rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          margin: 0;
          line-height: 1;
        }

        .landing-iso__price-main small {
          font-size: 1rem;
          color: inherit;
          opacity: 0.52;
          font-weight: 600;
        }

        .landing-iso__card-copy {
          margin: 12px 0 0;
          color: #556174;
          line-height: 1.7;
        }

        .landing-iso__card--dark .landing-iso__card-copy {
          color: rgba(224, 232, 255, 0.65);
        }

        .landing-iso__feature-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 12px;
          flex: 1;
        }

        .landing-iso__feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          font-weight: 700;
        }

        .landing-iso__feature-icon-wrap {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(14, 109, 235, 0.1);
          color: #0f71f0;
          flex: 0 0 auto;
        }

        .landing-iso__feature-icon {
          width: 15px;
          height: 15px;
        }

        .landing-iso__card--dark .landing-iso__feature-icon-wrap {
          background: rgba(78, 158, 255, 0.2);
          color: #7ec0ff;
        }

        .landing-iso__card-cta {
          margin-top: 22px;
          height: 52px;
          border-radius: 16px;
          border: 0;
          font: inherit;
          font-weight: 800;
          font-size: 0.9rem;
          cursor: pointer;
          transition: transform 180ms ease, background 180ms ease, color 180ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .landing-iso__card-cta--light {
          background: #eff3fb;
          color: #162238;
        }

        .landing-iso__card-cta--light:hover {
          background: #0f72f2;
          color: #fff;
        }

        .landing-iso__card-cta--dark {
          background: linear-gradient(130deg, #0f79f9 0%, #0b62e4 100%);
          color: #fff;
          box-shadow: 0 16px 35px rgba(13, 105, 232, 0.45);
        }

        .landing-iso__card-cta--dark:hover {
          transform: translateY(-1px);
        }

        .landing-iso__closed {
          padding: 100px 0;
          background: #fff;
          border-top: 1px solid rgba(20, 44, 80, 0.08);
          border-bottom: 1px solid rgba(20, 44, 80, 0.08);
        }

        .landing-iso__split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 44px;
          align-items: center;
        }

        .landing-iso__code-window {
          position: relative;
          border-radius: 34px;
          background: linear-gradient(160deg, #f5f8ff 0%, #eef4ff 100%);
          border: 1px solid rgba(22, 56, 98, 0.11);
          padding: 26px;
          box-shadow: var(--shadow-card);
          font-family: "Fira Code", "JetBrains Mono", monospace;
          font-size: 0.84rem;
          color: #29384f;
          overflow: hidden;
        }

        .landing-iso__code-bg-icon {
          position: absolute;
          right: 10px;
          top: 8px;
          width: 140px;
          height: 140px;
          opacity: 0.06;
          color: #17427b;
        }

        .landing-iso__code-dots {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .landing-iso__code-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
        }

        .landing-iso__code-dot--red { background: #ff6b6b; }
        .landing-iso__code-dot--yellow { background: #ffbd4a; }
        .landing-iso__code-dot--green { background: #14cc89; }

        .landing-iso__code-line {
          margin: 0;
          line-height: 1.7;
          white-space: nowrap;
        }

        .landing-iso__code-keyword { color: #7950f2; }
        .landing-iso__code-string { color: #0a9f74; }
        .landing-iso__code-comment { color: #0b6ee8; }

        .landing-iso__progress {
          margin-top: 8px;
          width: 88%;
          height: 7px;
          border-radius: 999px;
          background: rgba(44, 82, 129, 0.15);
          overflow: hidden;
        }

        .landing-iso__progress > span {
          display: block;
          height: 100%;
          background: linear-gradient(90deg, #0e72f1 0%, #63a4ff 100%);
          animation: landingIso-progress 2.8s ease-in-out infinite;
        }

        .landing-iso__kicker {
          display: inline-block;
          padding: 7px 12px;
          border-radius: 10px;
          background: #ebf4ff;
          color: #0b70ec;
          font-size: 0.62rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 800;
          margin-bottom: 16px;
        }

        .landing-iso__headline {
          margin: 0;
          font-size: clamp(2rem, 4.6vw, 3rem);
          line-height: 1.14;
          letter-spacing: -0.035em;
        }

        .landing-iso__body {
          margin-top: 18px;
          color: var(--ink-soft);
          line-height: 1.76;
        }

        .landing-iso__mini-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 24px;
        }

        .landing-iso__mini-card {
          border-radius: 18px;
          border: 1px solid var(--line-soft);
          background: #f8fbff;
          padding: 18px;
          transition: border-color 180ms ease, transform 180ms ease;
        }

        .landing-iso__mini-card:hover {
          border-color: #9bc5ff;
          transform: translateY(-2px);
        }

        .landing-iso__mini-icon {
          width: 24px;
          height: 24px;
          color: #0d70ee;
          margin-bottom: 8px;
        }

        .landing-iso__mini-title {
          margin: 0;
          font-size: 0.92rem;
          font-weight: 800;
        }

        .landing-iso__mini-text {
          margin: 3px 0 0;
          font-size: 0.76rem;
          color: #6b7d95;
        }

        .landing-iso__opensource {
          padding: 100px 0;
          position: relative;
          background: linear-gradient(165deg, #070d17 0%, #0f1728 58%, #0b1423 100%);
          color: #fff;
          overflow: hidden;
        }

        .landing-iso__opensource::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.12;
          background:
            repeating-linear-gradient(
              to bottom,
              transparent 0,
              transparent 3px,
              rgba(105, 133, 184, 0.35) 3px,
              rgba(105, 133, 184, 0.35) 4px
            );
          pointer-events: none;
        }

        .landing-iso__section-subtitle--light {
          color: rgba(226, 237, 255, 0.66);
        }

        .landing-iso__tri-grid {
          margin-top: 48px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .landing-iso__dark-card {
          border-radius: 26px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          padding: 26px;
          transition: transform 180ms ease, background 180ms ease;
        }

        .landing-iso__dark-card:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.09);
        }

        .landing-iso__dark-icon {
          width: 32px;
          height: 32px;
          margin-bottom: 16px;
          color: #73b7ff;
        }

        .landing-iso__dark-card:nth-child(2) .landing-iso__dark-icon {
          color: #bc8bff;
        }

        .landing-iso__dark-card:nth-child(3) .landing-iso__dark-icon {
          color: #56d39c;
        }

        .landing-iso__dark-title {
          margin: 0;
          font-size: 1.5rem;
          letter-spacing: -0.02em;
        }

        .landing-iso__dark-copy {
          margin: 10px 0 0;
          color: rgba(224, 235, 255, 0.68);
          line-height: 1.74;
          font-size: 0.9rem;
        }

        .landing-iso__subscription-plans {
          padding: 90px 0;
          background: #fff;
        }

        .landing-iso__plan-cards {
          margin-top: 48px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .landing-iso__plan-card {
          position: relative;
          border-radius: 24px;
          border: 1px solid rgba(20, 44, 80, 0.12);
          background: #fff;
          padding: 32px 28px;
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }

        .landing-iso__plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(13, 31, 58, 0.15);
          border-color: #0c70f2;
        }

        .landing-iso__plan-card--featured {
          border: 2px solid #0c70f2;
          background: linear-gradient(180deg, #f8fbff 0%, #fff 100%);
          box-shadow: 0 16px 40px rgba(12, 112, 242, 0.18);
        }

        .landing-iso__plan-popular {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #0c70f2 0%, #0a58db 100%);
          color: #fff;
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          box-shadow: 0 8px 20px rgba(12, 112, 242, 0.35);
        }

        .landing-iso__plan-badge-top {
          position: absolute;
          top: -12px;
          right: 20px;
          background: linear-gradient(135deg, #ff6b6b 0%, #ff4d4f 100%);
          color: #fff;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          box-shadow: 0 8px 20px rgba(255, 77, 79, 0.35);
        }

        .landing-iso__plan-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }

        .landing-iso__plan-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .landing-iso__icon-md {
          width: 24px;
          height: 24px;
          color: #fff;
        }

        .landing-iso__plan-name {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .landing-iso__plan-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .landing-iso__plan-symbol {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--ink-main);
        }

        .landing-iso__plan-amount {
          font-size: 3.2rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: var(--ink-main);
        }

        .landing-iso__plan-period {
          font-size: 1rem;
          color: var(--ink-soft);
          font-weight: 600;
        }

        .landing-iso__plan-badge {
          background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
          color: #fff;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          margin-left: 8px;
        }

        .landing-iso__plan-original {
          font-size: 0.85rem;
          margin-bottom: 16px;
          color: #666;
        }

        .landing-iso__plan-desc {
          margin: 8px 0 4px;
          font-size: 0.9rem;
          color: var(--ink-main);
          font-weight: 600;
        }

        .landing-iso__plan-subdesc {
          margin: 0 0 20px;
          font-size: 0.82rem;
          color: var(--ink-soft);
        }

        .landing-iso__plan-btn {
          width: 100%;
          height: 48px;
          border-radius: 14px;
          border: 0;
          font: inherit;
          font-weight: 800;
          font-size: 0.95rem;
          cursor: pointer;
          transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .landing-iso__plan-btn--outline {
          background: #fff;
          border: 2px solid var(--line-strong);
          color: var(--ink-main);
        }

        .landing-iso__plan-btn--outline:hover {
          background: #f8fbff;
          border-color: #0c70f2;
          color: #0c70f2;
        }

        .landing-iso__plan-btn--solid {
          background: linear-gradient(135deg, #0c70f2 0%, #0a58db 100%);
          color: #fff;
          box-shadow: 0 12px 28px rgba(12, 112, 242, 0.35);
        }

        .landing-iso__plan-btn--solid:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(12, 112, 242, 0.45);
        }

        .landing-iso__plan-btn--premium {
          background: linear-gradient(135deg, #ffa940 0%, #ff7a45 100%);
          color: #fff;
          box-shadow: 0 12px 28px rgba(255, 122, 69, 0.35);
        }

        .landing-iso__plan-btn--premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(255, 122, 69, 0.45);
        }

        .landing-iso__plan-quota {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(12, 112, 242, 0.08);
          margin-bottom: 20px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #0c70f2;
        }

        .landing-iso__icon-sm {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .landing-iso__plan-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .landing-iso__plan-features li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--ink-soft);
        }

        .landing-iso__check-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          color: #52c41a;
          margin-top: 2px;
        }

        .landing-iso__footer {
          border-top: 1px solid rgba(23, 47, 81, 0.09);
          background: #fff;
          padding: 62px 0 36px;
        }

        .landing-iso__footer-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .landing-iso__footer-links {
          display: inline-flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
          font-size: 0.66rem;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          color: #71829a;
          font-weight: 700;
        }

        .landing-iso__footer-links a:hover {
          color: #0d70ee;
        }

        .landing-iso__footer-status {
          font-family: "Fira Code", "JetBrains Mono", monospace;
          font-size: 0.64rem;
          letter-spacing: 0.09em;
          color: #9aabc0;
        }

        .landing-iso__copyright {
          margin-top: 28px;
          text-align: center;
          font-size: 0.61rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #9fb0c5;
          font-weight: 700;
        }

        @keyframes landingIso-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes landingIso-pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }

        @keyframes landingIso-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes landingIso-spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes landingIso-orbit {
          from {
            transform: rotate(var(--orbit-angle)) translate(var(--orbit-radius)) rotate(calc(-1 * var(--orbit-angle)));
          }
          to {
            transform: rotate(calc(360deg + var(--orbit-angle))) translate(var(--orbit-radius)) rotate(calc(-360deg - var(--orbit-angle)));
          }
        }

        @keyframes landingIso-progress {
          0% {
            width: 35%;
          }
          50% {
            width: 92%;
          }
          100% {
            width: 65%;
          }
        }

        @media (max-width: 1080px) {
          .landing-iso__menu {
            display: none;
          }

          .landing-iso__cards,
          .landing-iso__split,
          .landing-iso__tri-grid,
          .landing-iso__plan-cards {
            grid-template-columns: 1fr;
          }

          .landing-iso__card {
            min-height: 0;
          }

          .landing-iso__hero {
            padding-top: 132px;
          }

          .landing-iso__orbit {
            --orbit-radius: 176px;
            height: 385px;
          }

          .landing-iso__orbit-ring--outer {
            width: 420px;
            height: 420px;
          }

          .landing-iso__satellite-pill {
            font-size: 0.73rem;
            padding: 8px 11px;
          }
        }

        @media (max-width: 760px) {
          .landing-iso {
            --content-width: min(1120px, 94vw);
          }

          .landing-iso__nav-wrap {
            top: 12px;
          }

          .landing-iso__nav {
            padding: 8px 10px;
          }

          .landing-iso__actions {
            gap: 2px;
          }

          .landing-iso__btn--ghost,
          .landing-iso__btn--solid {
            padding-inline: 11px;
            font-size: 0.67rem;
          }

          .landing-iso__hero {
            padding-top: 120px;
          }

          .landing-iso__hero-desc {
            font-size: 0.95rem;
          }

          .landing-iso__orbit {
            --orbit-radius: 142px;
            height: 340px;
          }

          .landing-iso__orbit-ring--inner {
            width: 250px;
            height: 250px;
          }

          .landing-iso__orbit-ring--outer {
            width: 330px;
            height: 330px;
          }

          .landing-iso__satellite-pill {
            font-size: 0.67rem;
            padding: 7px 10px;
            box-shadow: 0 9px 18px rgba(15, 30, 51, 0.14);
          }

          .landing-iso__pricing,
          .landing-iso__closed,
          .landing-iso__opensource,
          .landing-iso__subscription-plans {
            padding: 72px 0;
          }

          .landing-iso__card,
          .landing-iso__dark-card,
          .landing-iso__code-window,
          .landing-iso__plan-card {
            border-radius: 24px;
            padding: 22px;
          }

          .landing-iso__mini-grid {
            grid-template-columns: 1fr;
          }

          .landing-iso__footer {
            padding: 48px 0 28px;
          }

          .landing-iso__footer-main {
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>

      <div className="landing-iso__nav-wrap">
        <nav className={`landing-iso__nav ${scrolled ? 'is-scrolled' : ''}`}>
          <a href="#" className="landing-iso__brand">
            <span className="landing-iso__brand-badge">F</span>
            <span>frog-api</span>
          </a>

          <div className="landing-iso__menu">
            <a href="/pricing" className="landing-iso__menu-link">
              价格详情
            </a>
            <a href="/console" className="landing-iso__menu-link">
              控制台
            </a>
            <a href="#API文档" className="landing-iso__menu-link">
              API文档
            </a>
          </div>

          <div className="landing-iso__actions">
            <a href="/login" className="landing-iso__btn landing-iso__btn--ghost">
              登录
            </a>
            <a href="/register" className="landing-iso__btn landing-iso__btn--solid">
              注册
            </a>
          </div>
        </nav>
      </div>

      <header className="landing-iso__hero">
        <div className="landing-iso__container landing-iso__hero-copy">
          <div className="landing-iso__badge">
            <IconPulse className="landing-iso__icon-inline" />
            <span>All Models Online</span>
          </div>

          <h1 className="landing-iso__hero-title">
            你的 AI 模型
            <br />
            <span className="landing-iso__title-gradient">超级枢纽</span>
          </h1>

          <p className="landing-iso__hero-desc">
            开源模型 <em>4小时循环重置</em> 机制。<br />
            不仅仅是接口转发，更是为您打造的无限灵感引擎。
          </p>
        </div>

        <Orbit />
      </header>

      <section id="订阅中心" className="landing-iso__section landing-iso__pricing">
        <div className="landing-iso__container">
          <h2 className="landing-iso__section-title">订阅中心</h2>
          <p className="landing-iso__section-subtitle">技术感十足的定价策略，满足不同阶段的开发需求</p>

          <div className="landing-iso__cards">
            <article className="landing-iso__card landing-iso__card--light">
              <div className="landing-iso__card-head">
                <div>
                  <div className="landing-iso__card-kicker">Enterprise Closed-Source</div>
                  <h3 className="landing-iso__card-title">按量计费</h3>
                </div>
                <span className="landing-iso__card-icon-box">
                  <IconDatabase className="landing-iso__icon-lg" />
                </span>
              </div>

              <div className="landing-iso__price-block">
                <p className="landing-iso__price-main">灵活 <small>充值</small></p>
                <p className="landing-iso__card-copy">
                  专为高精度需求设计。提供 <strong>全系列顶级闭源模型</strong> (GPT-4o/Claude) 的 1:1 转发。
                </p>
              </div>

              <ul className="landing-iso__feature-list">
                {CLOSED_SOURCE_FEATURES.map((feature) => (
                  <li key={feature} className="landing-iso__feature-item">
                    <span className="landing-iso__feature-icon-wrap">
                      <IconCheck className="landing-iso__feature-icon" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a href="/console" className="landing-iso__card-cta landing-iso__card-cta--light">
                立即充值
              </a>
            </article>

            <article className="landing-iso__card landing-iso__card--dark">
              <div className="landing-iso__card-head">
                <div>
                  <div className="landing-iso__card-kicker">High-Performance Open-Source</div>
                  <h3 className="landing-iso__card-title">Code Plan</h3>
                </div>
                <span className="landing-iso__card-icon-box">
                  <IconCrown className="landing-iso__icon-lg" />
                </span>
              </div>

              <div className="landing-iso__price-block">
                <p className="landing-iso__price-main">按需订阅 <small>灵活计费</small></p>
                <p className="landing-iso__card-copy">
                  专为开源生态优化。支持 <strong>Llama/DeepSeek/Qwen</strong> 等最新强开源模型循环刷新。
                </p>
              </div>

              <ul className="landing-iso__feature-list">
                {CODE_PLAN_FEATURES.map((feature) => (
                  <li key={feature} className="landing-iso__feature-item">
                    <span className="landing-iso__feature-icon-wrap">
                      <IconBolt className="landing-iso__feature-icon" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a href="/console" className="landing-iso__card-cta landing-iso__card-cta--dark">
                开启专业之路
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-iso__section landing-iso__subscription-plans">
        <div className="landing-iso__container">
          <h2 className="landing-iso__section-title">灵活订阅方案</h2>
          <p className="landing-iso__section-subtitle">选择最适合您的订阅周期，享受长期优惠</p>

          <div className="landing-iso__plan-cards">
            <article className="landing-iso__plan-card">
              <div className="landing-iso__plan-header">
                <div className="landing-iso__plan-icon">
                  <IconDatabase className="landing-iso__icon-md" />
                </div>
                <h3 className="landing-iso__plan-name">入门版</h3>
              </div>

              <div className="landing-iso__plan-price">
                <span className="landing-iso__plan-symbol">¥</span>
                <span className="landing-iso__plan-amount">18</span>
                <span className="landing-iso__plan-period">/月</span>
                <span className="landing-iso__plan-badge">新春特惠立享5折</span>
              </div>

              <div className="landing-iso__plan-original">
                原价: <span style={{ textDecoration: 'line-through' }}>¥36/月</span>
                <span style={{ color: '#ff4d4f', marginLeft: '8px' }}>立省 ¥18.00/月</span>
              </div>

              <p className="landing-iso__plan-desc">支持按月订阅，随时取消</p>
              <p className="landing-iso__plan-subdesc">适合个人开发者的轻量使用</p>

              <a href="/console" className="landing-iso__plan-btn landing-iso__plan-btn--outline">开始使用</a>

              <div className="landing-iso__plan-quota">
                <IconBolt className="landing-iso__icon-sm" />
                <span>每 4 小时 100 Prompts 配额</span>
              </div>

              <ul className="landing-iso__plan-features">
                <li><IconCheck className="landing-iso__check-icon" /> 高质量开源模型，覆盖主流编码场景</li>
                <li><IconCheck className="landing-iso__check-icon" /> 稳定响应速度，持续在线可用</li>
                <li><IconCheck className="landing-iso__check-icon" /> 兼容 10+ 主流 AI 编码工具</li>
                <li><IconCheck className="landing-iso__check-icon" /> 模型能力持续更新，长期可用</li>
                <li><IconCheck className="landing-iso__check-icon" /> 资源包折扣取整: 9 折</li>
              </ul>
            </article>

            <article className="landing-iso__plan-card landing-iso__plan-card--featured">
              <div className="landing-iso__plan-popular">最受欢迎 ⚡</div>
              <div className="landing-iso__plan-header">
                <div className="landing-iso__plan-icon">
                  <IconLayers className="landing-iso__icon-md" />
                </div>
                <h3 className="landing-iso__plan-name">专业版</h3>
              </div>

              <div className="landing-iso__plan-price">
                <span className="landing-iso__plan-symbol">¥</span>
                <span className="landing-iso__plan-amount">90</span>
                <span className="landing-iso__plan-period">/月</span>
                <span className="landing-iso__plan-badge">新春特惠立享5折</span>
              </div>

              <div className="landing-iso__plan-original">
                原价: <span style={{ textDecoration: 'line-through' }}>¥180/月</span>
                <span style={{ color: '#ff4d4f', marginLeft: '8px' }}>立省 ¥90.00/月</span>
              </div>

              <p className="landing-iso__plan-desc">支持按月订阅，随时取消</p>
              <p className="landing-iso__plan-subdesc">适合专业团队的高密度使用</p>

              <a href="/console" className="landing-iso__plan-btn landing-iso__plan-btn--solid">立即订阅</a>

              <div className="landing-iso__plan-quota">
                <IconBolt className="landing-iso__icon-sm" />
                <span>每 4 小时 500 Prompts 配额 (5x Lite)</span>
              </div>

              <ul className="landing-iso__plan-features">
                <li><IconCheck className="landing-iso__check-icon" /> 高质量开源模型，覆盖主流编码场景</li>
                <li><IconCheck className="landing-iso__check-icon" /> 稳定响应速度，持续在线可用</li>
                <li><IconCheck className="landing-iso__check-icon" /> 兼容 10+ 主流 AI 编码工具</li>
                <li><IconCheck className="landing-iso__check-icon" /> 模型能力持续更新，长期可用</li>
                <li><IconCheck className="landing-iso__check-icon" /> 资源包折扣取整: 8 折</li>
              </ul>
            </article>

            <article className="landing-iso__plan-card">
              <div className="landing-iso__plan-badge-top">超大用量 🔥</div>
              <div className="landing-iso__plan-header">
                <div className="landing-iso__plan-icon" style={{ background: 'linear-gradient(135deg, #ffa940 0%, #ff7a45 100%)' }}>
                  <IconCrown className="landing-iso__icon-md" />
                </div>
                <h3 className="landing-iso__plan-name">旗舰版</h3>
              </div>

              <div className="landing-iso__plan-price">
                <span className="landing-iso__plan-symbol">¥</span>
                <span className="landing-iso__plan-amount">180</span>
                <span className="landing-iso__plan-period">/月</span>
                <span className="landing-iso__plan-badge">新春特惠立享5折</span>
              </div>

              <div className="landing-iso__plan-original">
                原价: <span style={{ textDecoration: 'line-through' }}>¥360/月</span>
                <span style={{ color: '#ff4d4f', marginLeft: '8px' }}>立省 ¥180.00/月</span>
              </div>

              <p className="landing-iso__plan-desc">支持按月订阅，随时取消</p>
              <p className="landing-iso__plan-subdesc">适合资深开发的海量工作负载</p>

              <a href="/console" className="landing-iso__plan-btn landing-iso__plan-btn--premium">立即订阅</a>

              <div className="landing-iso__plan-quota">
                <IconBolt className="landing-iso__icon-sm" />
                <span>每 4 小时 2000 Prompts 配额 (20x Lite)</span>
              </div>

              <ul className="landing-iso__plan-features">
                <li><IconCheck className="landing-iso__check-icon" /> 高质量开源模型，覆盖主流编码场景</li>
                <li><IconCheck className="landing-iso__check-icon" /> 稳定响应速度，持续在线可用</li>
                <li><IconCheck className="landing-iso__check-icon" /> 兼容 10+ 主流 AI 编码工具</li>
                <li><IconCheck className="landing-iso__check-icon" /> 模型能力持续更新，长期可用</li>
                <li><IconCheck className="landing-iso__check-icon" /> 资源包折扣取整: 6 折</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-iso__section landing-iso__closed">
        <div className="landing-iso__container landing-iso__split">
          <div className="landing-iso__code-window">
            <IconLayers className="landing-iso__code-bg-icon" />
            <div className="landing-iso__code-dots">
              <span className="landing-iso__code-dot landing-iso__code-dot--red" />
              <span className="landing-iso__code-dot landing-iso__code-dot--yellow" />
              <span className="landing-iso__code-dot landing-iso__code-dot--green" />
            </div>
            <p className="landing-iso__code-line landing-iso__code-comment">// 闭源模型集群配置 (Closed-Source)</p>
            <p className="landing-iso__code-line"><span className="landing-iso__code-keyword">const</span> config = {'{'}</p>
            <p className="landing-iso__code-line">&nbsp;&nbsp;pricing: <span className="landing-iso__code-string">"PAY_AS_YOU_GO"</span>,</p>
            <p className="landing-iso__code-line">&nbsp;&nbsp;access: <span className="landing-iso__code-string">"FULL_API_MIRROR"</span>,</p>
            <p className="landing-iso__code-line">&nbsp;&nbsp;models: [<span className="landing-iso__code-string">"gpt-4o", "claude-3-5-sonnet"</span>],</p>
            <p className="landing-iso__code-line">{'}'};</p>
            <p className="landing-iso__code-line landing-iso__code-comment">// 实时推理链路监控...</p>
            <div className="landing-iso__progress">
              <span />
            </div>
          </div>

          <div>
            <span className="landing-iso__kicker">Closed Source Suite</span>
            <h2 className="landing-iso__headline">按量计费：闭源模型的高性能镜像</h2>
            <p className="landing-iso__body">
              针对追求极致逻辑能力的场景，我们提供原生闭源模型的 1:1 转发服务。无需复杂配置，按 Token 实际消耗扣费，保障企业级业务的高可靠与高响应。
            </p>

            <div className="landing-iso__mini-grid">
              <article className="landing-iso__mini-card">
                <IconGlobe className="landing-iso__mini-icon" />
                <h4 className="landing-iso__mini-title">全球分发</h4>
                <p className="landing-iso__mini-text">毫秒级全球接入点</p>
              </article>

              <article className="landing-iso__mini-card">
                <IconShield className="landing-iso__mini-icon" />
                <h4 className="landing-iso__mini-title">精准计费</h4>
                <p className="landing-iso__mini-text">1:1 Token 对账单</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="套餐详情" className="landing-iso__section landing-iso__opensource">
        <div className="landing-iso__container">
          <h2 className="landing-iso__section-title">Code Plan 开源核心</h2>
          <p className="landing-iso__section-subtitle landing-iso__section-subtitle--light">
            打磨高并发、低延迟、可循环刷新的开源模型方案，覆盖从原型到生产的开发周期。
          </p>

          <div className="landing-iso__tri-grid">
            <article className="landing-iso__dark-card">
              <IconRefresh className="landing-iso__dark-icon" />
              <h3 className="landing-iso__dark-title">开源模型特供</h3>
              <p className="landing-iso__dark-copy">
                深度整合 Llama 3、DeepSeek-V3 等顶级开源模型。Code Plan 支持高并发调用与 4 小时循环额度重置。
              </p>
            </article>

            <article className="landing-iso__dark-card">
              <IconCode className="landing-iso__dark-icon" />
              <h3 className="landing-iso__dark-title">4h 循环魔法</h3>
              <p className="landing-iso__dark-copy">
                不再为月度总额度发愁。系统每 4 小时准时刷新配额，让开发灵感随刷新频率持续在线。
              </p>
            </article>

            <article className="landing-iso__dark-card">
              <IconGauge className="landing-iso__dark-icon" />
              <h3 className="landing-iso__dark-title">极低延迟</h3>
              <p className="landing-iso__dark-copy">
                基于分布式集群架构，请求直接路由至最近的高性能 GPU 节点，提供近乎实时的首字输出体验。
              </p>
            </article>
          </div>
        </div>
      </section>

      <footer className="landing-iso__footer" id="API文档">
        <div className="landing-iso__container">
          <div className="landing-iso__footer-main">
            <a href="#" className="landing-iso__brand">
              <span className="landing-iso__brand-badge">W</span>
              <span>frog-api</span>
            </a>

            <div className="landing-iso__footer-links">
              <a href="#">Twitter</a>
              <a href="#">GitHub</a>
              <a href="#">Discord</a>
              <a href="#">Privacy</a>
            </div>

            <div className="landing-iso__footer-status">CONNECTED TO GLOBAL CLUSTER: V2.5.1-STABLE</div>
          </div>

          <div className="landing-iso__copyright">© 2024 frog-api • Empowering Future AI Development</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
