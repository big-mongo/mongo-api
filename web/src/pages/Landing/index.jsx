import React, { useEffect, useState, useRef, useCallback } from 'react';

const MODELS = [
  { name: 'gpt-5.1', color: '#10a37f' },
  { name: 'gpt-5.1-codex', color: '#0c70f2' },
  { name: 'gpt-5.2', color: '#8a4dff' },
  { name: 'gpt-5.2-codex', color: '#d97757' },
  { name: 'gpt-5.3-codex', color: '#f5b041' },
];

const BRAND_ICON_URL = 'https://tncache1-f1.v3mh.com/image/2026/03/01/34da420726354d2ee43328b73faa130b.jpg';

const CLOSED_SOURCE_FEATURES = [
  'OpenAI 协议 1:1 兼容接入',
  '按量计费，无隐形及阶梯消费',
  '请求级日志追踪与可视化面板',
  '基础的多节点故障切换支持',
];

const ENTERPRISE_FEATURES = [
  '企业专属高可用专线与优先队列',
  '自定义限流策略与高并发控制',
  '团队级 Token 成本拆分与对账',
  'IP 白名单 + 密钥按期轮换安全策略',
];

// --- Icons ---
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

// --- Components ---
const Orbit = () => (
  <div className="landing-iso__orbit" aria-hidden="true">
    <div className="landing-iso__orbit-core">
      F
      <span className="landing-iso__orbit-glow" />
    </div>
    <div className="landing-iso__orbit-ring landing-iso__orbit-ring--inner" />
    <div className="landing-iso__orbit-ring landing-iso__orbit-ring--outer" />
    
    {/* 卫星容器，用于计算旋转 */}
    {MODELS.map((model, index) => {
      const angle = (360 / MODELS.length) * index;
      return (
        <div 
          key={model.name} 
          className="landing-iso__satellite-container"
          style={{ '--start-angle': `${angle}deg` }}
        >
          <div
            className="landing-iso__satellite"
            style={{ '--orbit-color': model.color }}
          >
            <div className="landing-iso__satellite-pill">
              <span className="landing-iso__satellite-dot" />
              <span>{model.name}</span>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const handleCopyUrl = useCallback((url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  }, []);

  // 滚动渐显 Hook
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 交叉观察器：实现元素滚动到可视区域时添加 .active 类
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            // 可选：如果不希望重复触发，可以在这里 unobserve
            // observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    // 隔离外部全局样式干扰
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#030712'; // 深邃星空黑
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, []);

  return (
    <div className="landing-iso">
      <style>{`
        /* --- 变量与基础重置 --- */
        .landing-iso {
          --bg-main: #030712;
          --bg-panel: rgba(15, 23, 42, 0.4);
          --ink-main: #f8fafc;
          --ink-soft: #94a3b8;
          --line-soft: rgba(255, 255, 255, 0.08);
          --accent: #0c70f2;
          --accent-hover: #3b82f6;
          --accent-purple: #8b5cf6;
          --content-width: 1200px;
          --radius-lg: 24px;
          --radius-xl: 32px;
          --shadow-glow: 0 0 80px -20px rgba(12, 112, 242, 0.5);

          position: relative;
          min-height: 100vh;
          width: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          color: var(--ink-main);
          background-color: var(--bg-main);
          font-family: "Inter", "Sora", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
        }

        .landing-iso *, .landing-iso *::before, .landing-iso *::after {
          box-sizing: border-box;
        }

        .landing-iso a {
          color: inherit;
          text-decoration: none;
        }

        /* 全局网格背景底纹 */
        .landing-iso::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle at 50% 20%, black 20%, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at 50% 20%, black 20%, transparent 80%);
          pointer-events: none;
          z-index: 0;
        }

        .landing-iso__container {
          width: 100%;
          max-width: var(--content-width);
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }

        /* --- 滚动入场动画 --- */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), 
                      transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .reveal-active {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }

        /* --- 导航栏 --- */
        .landing-iso__nav-wrap {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          width: 100%;
          max-width: var(--content-width);
          padding: 0 24px;
          transition: top 0.3s;
        }

        .landing-iso__nav {
          /* 常驻毛玻璃效果 */
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        }

        .landing-iso__nav.is-scrolled {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
          padding: 10px 24px;
        }

        .landing-iso__brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .landing-iso__brand-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .landing-iso__brand-logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .landing-iso__menu {
          display: flex;
          gap: 8px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .landing-iso__menu-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--ink-soft);
          padding: 8px 16px;
          border-radius: 999px;
          transition: all 0.2s;
        }

        .landing-iso__menu-link:hover {
          color: var(--ink-main);
          background: rgba(255, 255, 255, 0.05);
        }

        .landing-iso__actions {
          display: flex;
          gap: 12px;
        }

        .landing-iso__btn {
          border: none;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .landing-iso__btn--ghost {
          background: transparent;
          color: var(--ink-main);
          padding: 8px 16px;
        }

        .landing-iso__btn--ghost:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .landing-iso__btn--solid {
          background: linear-gradient(135deg, var(--accent), var(--accent-purple));
          color: #ffffff;
          padding: 8px 20px;
          box-shadow: 0 4px 15px rgba(12, 112, 242, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .landing-iso__btn--solid:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }

        /* --- 英雄区域 (Hero) --- */
        .landing-iso__hero {
          position: relative;
          padding-top: 180px;
          padding-bottom: 80px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
        }

        /* 顶部模糊光晕 */
        .landing-iso__hero::before {
          content: '';
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 500px;
          background: radial-gradient(circle, rgba(12, 112, 242, 0.15) 0%, rgba(138, 77, 255, 0.1) 40%, transparent 70%);
          filter: blur(60px);
          z-index: 0;
          pointer-events: none;
        }

        .landing-iso__badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          background: rgba(59, 130, 246, 0.1);
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #60a5fa;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 24px;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
          backdrop-filter: blur(10px);
        }

        .landing-iso__icon-inline {
          width: 14px;
          height: 14px;
        }

        .landing-iso__hero-title {
          font-size: clamp(3rem, 6vw, 5.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin: 0 0 24px 0;
        }

        .landing-iso__title-gradient {
          background: linear-gradient(135deg, #fff 0%, #94a3b8 50%, #60a5fa 100%);
          -webkit-background-clip: text;
          color: transparent;
        }

        .landing-iso__hero-desc {
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: var(--ink-soft);
          max-width: 600px;
          margin: 0 auto 40px;
          line-height: 1.6;
        }

        /* --- 轨道动画组件 (Orbit) --- */
        .landing-iso__orbit {
          --orbit-radius: 240px;
          position: relative;
          width: 100%;
          max-width: 700px;
          height: 480px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          pointer-events: none;
        }

        .landing-iso__orbit-core {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          background: linear-gradient(145deg, var(--accent), #0950b3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.8rem;
          font-weight: 900;
          box-shadow: 0 0 40px rgba(12, 112, 242, 0.5), inset 0 2px 10px rgba(255,255,255,0.3);
          position: relative;
          z-index: 10;
        }

        .landing-iso__orbit-glow {
          position: absolute;
          inset: -20px;
          background: rgba(12, 112, 242, 0.4);
          border-radius: 50%;
          filter: blur(20px);
          z-index: -1;
          animation: pulse-glow 3s infinite alternate;
        }

        @keyframes pulse-glow {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.2); opacity: 0.8; }
        }

        .landing-iso__orbit-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px dashed rgba(255, 255, 255, 0.1);
        }

        .landing-iso__orbit-ring--inner {
          width: calc(var(--orbit-radius) * 1.3);
          height: calc(var(--orbit-radius) * 1.3);
        }

        .landing-iso__orbit-ring--outer {
          width: calc(var(--orbit-radius) * 2);
          height: calc(var(--orbit-radius) * 2);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .landing-iso__satellite-container {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          /* 外层容器旋转 */
          animation: orbit-spin 30s linear infinite;
        }

        .landing-iso__satellite {
          position: absolute;
          top: 0;
          left: 0;
          /* 将元素推向轨道边缘并应用初始角度 */
          transform: rotate(var(--start-angle)) translateX(var(--orbit-radius));
        }

        .landing-iso__satellite-pill {
          /* 内层反向旋转，抵消外层旋转，使文字始终保持水平 */
          animation: orbit-spin-reverse 30s linear infinite;
          transform-origin: center;
          
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 999px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          /* 居中对齐处理 */
          margin-top: -16px;
          margin-left: -50%;
          white-space: nowrap;
        }

        .landing-iso__satellite-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--orbit-color);
          box-shadow: 0 0 10px var(--orbit-color);
        }

        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes orbit-spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        /* --- 标题与区块公用 --- */
        .landing-iso__section {
          padding: 100px 0;
          position: relative;
          z-index: 10;
        }

        .landing-iso__section-title {
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 800;
          text-align: center;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }

        .landing-iso__section-subtitle {
          text-align: center;
          color: var(--ink-soft);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto 48px;
        }

        /* --- 价格/方案卡片 --- */
        .landing-iso__pricing {
          position: relative;
        }

        .landing-iso__pricing::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }

        .landing-iso__cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          align-items: stretch;
        }

        .landing-iso__card {
          background: var(--bg-panel);
          border: 1px solid var(--line-soft);
          border-radius: var(--radius-xl);
          padding: 40px;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .landing-iso__card:hover {
          transform: translateY(-8px);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .landing-iso__card--dark {
          background: linear-gradient(160deg, rgba(15, 23, 42, 0.8) 0%, rgba(3, 7, 18, 0.9) 100%);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .landing-iso__card--dark::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--accent), var(--accent-purple));
          opacity: 0.8;
        }

        .landing-iso__card--dark:hover {
          box-shadow: 0 20px 60px -10px rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
        }

        .landing-iso__card-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .landing-iso__card-kicker {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--ink-soft);
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .landing-iso__card--dark .landing-iso__card-kicker {
          color: #a78bfa;
        }

        .landing-iso__card-title {
          font-size: 2rem;
          font-weight: 800;
          margin: 0;
        }

        .landing-iso__icon-lg {
          width: 32px;
          height: 32px;
          color: var(--ink-main);
          opacity: 0.8;
        }

        .landing-iso__card--dark .landing-iso__icon-lg {
          color: #a78bfa;
          opacity: 1;
        }

        .landing-iso__price-block {
          margin-bottom: 32px;
        }

        .landing-iso__price-main {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 12px;
          line-height: 1;
        }

        .landing-iso__price-main small {
          font-size: 1rem;
          color: var(--ink-soft);
          font-weight: 500;
          margin-left: 8px;
        }

        .landing-iso__card-copy {
          color: var(--ink-soft);
          font-size: 0.95rem;
          margin: 0;
        }

        .landing-iso__feature-list {
          list-style: none;
          padding: 0;
          margin: 0 0 40px 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }

        .landing-iso__feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.95rem;
          color: var(--ink-main);
        }

        .landing-iso__feature-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          flex-shrink: 0;
        }

        .landing-iso__card--dark .landing-iso__feature-icon-wrap {
          background: rgba(139, 92, 246, 0.2);
          color: #c4b5fd;
        }

        .landing-iso__feature-icon {
          width: 14px;
          height: 14px;
        }

        .landing-iso__card-cta {
          display: block;
          text-align: center;
          padding: 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          transition: all 0.2s;
          cursor: pointer;
        }

        .landing-iso__card-cta--light {
          background: rgba(255, 255, 255, 0.1);
          color: var(--ink-main);
        }

        .landing-iso__card-cta--light:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .landing-iso__card-cta--dark {
          background: linear-gradient(135deg, var(--accent), var(--accent-purple));
          color: #ffffff;
          box-shadow: 0 4px 20px -5px rgba(12, 112, 242, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .landing-iso__card-cta--dark:hover {
          box-shadow: 0 8px 25px -5px rgba(139, 92, 246, 0.5);
          transform: translateY(-2px);
        }

        /* --- 统计数据 --- */
        .landing-iso__stats-section {
          background: linear-gradient(to bottom, transparent, rgba(15, 23, 42, 0.5), transparent);
        }

        .landing-iso__stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .landing-iso__stat-card {
          text-align: center;
          padding: 32px 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          transition: transform 0.3s;
        }

        .landing-iso__stat-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .landing-iso__stat-value {
          font-size: 3rem;
          font-weight: 900;
          margin-bottom: 8px;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          color: transparent;
        }

        .landing-iso__stat-value span {
          font-size: 1.5rem;
        }

        .landing-iso__stat-label {
          color: var(--ink-soft);
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* --- 无缝对接 (Marquee) --- */
        .landing-iso__marquee-wrapper {
          overflow: hidden;
          padding: 40px 0;
          position: relative;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }

        .landing-iso__marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        
        .landing-iso__marquee:hover {
          animation-play-state: paused;
        }

        .landing-iso__integration-tag {
          padding: 12px 24px;
          margin: 0 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          font-weight: 600;
          color: var(--ink-main);
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          transition: all 0.3s ease;
          cursor: default;
        }

        .landing-iso__integration-tag:hover {
          background: rgba(12, 112, 242, 0.1);
          border-color: var(--accent);
          color: #fff;
          box-shadow: 0 0 15px rgba(12, 112, 242, 0.3);
        }

        @keyframes marquee {
          to { transform: translateX(-50%); }
        }

        /* --- 核心能力左右分栏 --- */
        .landing-iso__split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .landing-iso__code-window {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          font-family: "Fira Code", "JetBrains Mono", monospace;
          font-size: 0.85rem;
          color: #e2e8f0;
          position: relative;
        }

        .landing-iso__code-window::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }

        .landing-iso__code-dots {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .landing-iso__code-dot {
          width: 12px; height: 12px; border-radius: 50%;
        }
        .landing-iso__code-dot--red { background: #ef4444; }
        .landing-iso__code-dot--yellow { background: #eab308; }
        .landing-iso__code-dot--green { background: #22c55e; }

        .landing-iso__code-line {
          margin: 8px 0;
          line-height: 1.6;
        }

        .landing-iso__code-keyword { color: #c678dd; }
        .landing-iso__code-string { color: #98c379; }
        .landing-iso__code-comment { color: #5c6370; font-style: italic; }
        .landing-iso__code-property { color: #e06c75; }

        /* 闪烁光标 */
        .landing-iso__cursor {
          display: inline-block;
          width: 8px;
          height: 15px;
          background: #61afef;
          vertical-align: middle;
          margin-left: 4px;
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          50% { opacity: 0; }
        }

        .landing-iso__kicker {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 8px;
          background: rgba(12, 112, 242, 0.15);
          color: #60a5fa;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .landing-iso__headline {
          font-size: clamp(2rem, 3.5vw, 2.5rem);
          font-weight: 800;
          line-height: 1.2;
          margin: 0 0 16px;
        }

        .landing-iso__body {
          color: var(--ink-soft);
          font-size: 1.1rem;
          line-height: 1.7;
          margin: 0 0 32px;
        }

        .landing-iso__mini-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .landing-iso__mini-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 20px;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .landing-iso__mini-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .landing-iso__mini-icon {
          width: 28px; height: 28px;
          color: var(--accent);
          margin-bottom: 12px;
        }

        .landing-iso__mini-title {
          font-size: 1.05rem;
          font-weight: 700;
          margin: 0 0 6px;
        }

        .landing-iso__mini-text {
          color: var(--ink-soft);
          font-size: 0.85rem;
          margin: 0;
        }

        /* --- 三列特色 (Tri Grid) --- */
        .landing-iso__tri-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .landing-iso__dark-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-lg);
          padding: 32px;
          transition: all 0.3s ease;
        }

        .landing-iso__dark-card:hover {
          transform: translateY(-5px);
          background: rgba(30, 41, 59, 0.5);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .landing-iso__dark-icon {
          width: 36px; height: 36px;
          margin-bottom: 20px;
          color: #60a5fa;
        }
        
        .landing-iso__dark-card:nth-child(2) .landing-iso__dark-icon { color: #a78bfa; }
        .landing-iso__dark-card:nth-child(3) .landing-iso__dark-icon { color: #34d399; }

        .landing-iso__dark-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 12px;
        }

        .landing-iso__dark-copy {
          color: var(--ink-soft);
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }

        /* --- API 站点入口卡片 --- */
        .landing-iso__endpoints {
          text-align: center;
        }

        .landing-iso__endpoints-subtitle {
          font-size: 0.95rem;
          color: var(--ink-soft);
          margin: 0 auto 32px;
        }

        .landing-iso__endpoints-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          max-width: 960px;
          margin: 0 auto;
        }

        @media (max-width: 600px) {
          .landing-iso__endpoints-grid { grid-template-columns: 1fr; }
        }

        .landing-iso__endpoint-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 32px 36px;
          border-radius: 20px;
          cursor: pointer;
          user-select: none;
          text-decoration: none;
          color: var(--ink-main);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        /* Animated gradient border via pseudo */
        .landing-iso__endpoint-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1.5px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5), rgba(244, 63, 94, 0.3));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0.5;
          transition: opacity 0.3s;
        }

        .landing-iso__endpoint-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          pointer-events: none;
          transition: opacity 0.3s;
          opacity: 0;
        }

        .landing-iso__endpoint-card--cn {
          background: linear-gradient(145deg, rgba(244, 63, 94, 0.08), rgba(251, 146, 60, 0.06));
        }
        .landing-iso__endpoint-card--cn::after {
          background: radial-gradient(ellipse at 30% 50%, rgba(244, 63, 94, 0.15), transparent 70%);
        }

        .landing-iso__endpoint-card--global {
          background: linear-gradient(145deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.06));
        }
        .landing-iso__endpoint-card--global::after {
          background: radial-gradient(ellipse at 30% 50%, rgba(59, 130, 246, 0.15), transparent 70%);
        }

        .landing-iso__endpoint-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.4);
        }
        .landing-iso__endpoint-card:hover::before { opacity: 1; }
        .landing-iso__endpoint-card:hover::after { opacity: 1; }

        .landing-iso__endpoint-card:active {
          transform: translateY(-1px) scale(0.99);
        }

        .landing-iso__endpoint-flag {
          width: 64px; height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.7rem;
          line-height: 1;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        }
        .landing-iso__endpoint-card--cn .landing-iso__endpoint-flag {
          background: rgba(244, 63, 94, 0.12);
          box-shadow: 0 0 20px rgba(244, 63, 94, 0.15);
        }
        .landing-iso__endpoint-card--global .landing-iso__endpoint-flag {
          background: rgba(59, 130, 246, 0.12);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
        }

        .landing-iso__endpoint-info {
          text-align: left;
          flex: 1;
          min-width: 0;
          position: relative;
          z-index: 2;
        }

        .landing-iso__endpoint-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }
        .landing-iso__endpoint-card--cn .landing-iso__endpoint-label { color: #fb7185; }
        .landing-iso__endpoint-card--global .landing-iso__endpoint-label { color: #60a5fa; }

        .landing-iso__endpoint-url {
          font-size: 1.4rem;
          font-weight: 700;
          font-family: "Fira Code", "JetBrains Mono", ui-monospace, monospace;
          color: #fff;
          line-height: 1.3;
        }

        .landing-iso__endpoint-url-proto {
          color: var(--ink-soft);
          font-weight: 500;
          font-size: 0.9em;
        }

        .landing-iso__endpoint-desc {
          font-size: 0.85rem;
          color: var(--ink-soft);
          margin-top: 3px;
        }

        .landing-iso__endpoint-copy {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.88rem;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 12px;
          color: var(--ink-soft);
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.25s;
          white-space: nowrap;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        }

        .landing-iso__endpoint-copy svg {
          width: 14px; height: 14px;
        }

        .landing-iso__endpoint-card:hover .landing-iso__endpoint-copy {
          color: #fff;
          border-color: transparent;
        }
        .landing-iso__endpoint-card--cn:hover .landing-iso__endpoint-copy {
          background: rgba(244, 63, 94, 0.3);
        }
        .landing-iso__endpoint-card--global:hover .landing-iso__endpoint-copy {
          background: rgba(59, 130, 246, 0.3);
        }

        .landing-iso__endpoint-copy--copied {
          color: #fff !important;
          background: rgba(16, 185, 129, 0.4) !important;
          border-color: rgba(16, 185, 129, 0.6) !important;
        }

        /* --- 页脚 --- */
        .landing-iso__footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 60px 0 40px;
          margin-top: 60px;
        }

        .landing-iso__footer-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 24px;
        }

        .landing-iso__footer-links {
          display: flex;
          gap: 24px;
        }

        .landing-iso__footer-links a {
          color: var(--ink-soft);
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .landing-iso__footer-links a:hover {
          color: var(--ink-main);
        }

        .landing-iso__footer-status {
          font-family: monospace;
          font-size: 0.8rem;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .landing-iso__footer-status::before {
          content: '';
          display: block;
          width: 8px; height: 8px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 10px #10b981;
          animation: blink 2s infinite;
        }

        .landing-iso__copyright {
          text-align: center;
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.85rem;
        }

        /* --- 响应式 --- */
        @media (max-width: 1024px) {
          .landing-iso__split { grid-template-columns: 1fr; gap: 40px; }
          .landing-iso__split > div:first-child { order: 2; }
          .landing-iso__split > div:last-child { order: 1; }
        }

        @media (max-width: 900px) {
          .landing-iso__menu { display: none; }
          .landing-iso__cards { grid-template-columns: 1fr; max-width: 500px; margin: 0 auto; }
          .landing-iso__tri-grid { grid-template-columns: 1fr; }
          .landing-iso__stats-grid { grid-template-columns: repeat(2, 1fr); }
          .landing-iso__footer-main { flex-direction: column; text-align: center; }
        }

        @media (max-width: 600px) {
          .landing-iso__hero { padding-top: 140px; }
          .landing-iso__hero-title { font-size: 2.5rem; }
          .landing-iso__stats-grid { grid-template-columns: 1fr; }
          .landing-iso__mini-grid { grid-template-columns: 1fr; }
          .landing-iso__orbit { transform: scale(0.7); height: 320px; }
        }
      `}</style>

      {/* 导航栏 */}
      <div className="landing-iso__nav-wrap">
        <nav className={`landing-iso__nav ${scrolled ? 'is-scrolled' : ''}`}>
          <a href="/index" className="landing-iso__brand">
            <span className="landing-iso__brand-badge">
              <img src={BRAND_ICON_URL} alt="Frog API" className="landing-iso__brand-logo" />
            </span>
            <span>Frog API</span>
          </a>

          <div className="landing-iso__menu">
            <a href="/pricing" className="landing-iso__menu-link">价格方案</a>
            <a href="/features" className="landing-iso__menu-link">核心能力</a>
            <a href="/docs" className="landing-iso__menu-link">API 文档</a>
          </div>

          <div className="landing-iso__actions">
            <a href="/login" className="landing-iso__btn landing-iso__btn--ghost">登录</a>
            <a href="/register" className="landing-iso__btn landing-iso__btn--solid">立即注册</a>
          </div>
        </nav>
      </div>

      {/* Hero 区域 */}
      <header className="landing-iso__hero">
        <div className="landing-iso__container">
          <div className="reveal">
            <div className="landing-iso__badge">
              <IconPulse className="landing-iso__icon-inline" />
              <span>Enterprise AI Gateway</span>
            </div>
            <h1 className="landing-iso__hero-title">
              专精 GPT 模型的
              <br />
              <span className="landing-iso__title-gradient">高可用聚合中转站</span>
            </h1>
            <p className="landing-iso__hero-desc">
              统一 OpenAI 协议入口，完美支持 gpt-5.x 系列及 Codex 等核心模型。<br />
              从开发调试到生产流量，提供低延迟、防封锁、完全可观测的 API 调用体验。
            </p>
          </div>
        </div>

        <div className="reveal reveal-delay-2">
          <Orbit />
        </div>
      </header>

      {/* 统计数据 */}
      <section className="landing-iso__section landing-iso__stats-section reveal">
        <div className="landing-iso__container">
          {/* API 站点入口 */}
          <div className="landing-iso__endpoints reveal" style={{ marginBottom: 60 }}>
            <h2 className="landing-iso__section-title" style={{ fontSize: '1.8rem', marginBottom: 8 }}>
              接入地址
            </h2>
            <p className="landing-iso__endpoints-subtitle">点击卡片一键复制 Base URL</p>
            <div className="landing-iso__endpoints-grid">
              {/* 国内站点 */}
              <div
                className="landing-iso__endpoint-card landing-iso__endpoint-card--cn"
                onClick={() => handleCopyUrl('https://frogapi.cn')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCopyUrl('https://frogapi.cn')}
              >
                <div className="landing-iso__endpoint-flag">🇨🇳</div>
                <div className="landing-iso__endpoint-info">
                  <div className="landing-iso__endpoint-label">国内站点</div>
                  <div className="landing-iso__endpoint-url"><span className="landing-iso__endpoint-url-proto">https://</span>frogapi.cn</div>
                  <div className="landing-iso__endpoint-desc">国内加速 · 低延迟</div>
                </div>
                <div className={`landing-iso__endpoint-copy ${copiedUrl === 'https://frogapi.cn' ? 'landing-iso__endpoint-copy--copied' : ''}`}>
                  {copiedUrl === 'https://frogapi.cn' ? '✓ 已复制' : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>复制</>}
                </div>
              </div>
              {/* 国外站点 */}
              <div
                className="landing-iso__endpoint-card landing-iso__endpoint-card--global"
                onClick={() => handleCopyUrl('https://api.frog.cn')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCopyUrl('https://api.frog.cn')}
              >
                <div className="landing-iso__endpoint-flag">🌍</div>
                <div className="landing-iso__endpoint-info">
                  <div className="landing-iso__endpoint-label">国外站点</div>
                  <div className="landing-iso__endpoint-url"><span className="landing-iso__endpoint-url-proto">https://</span>api.frog.cn</div>
                  <div className="landing-iso__endpoint-desc">全球节点 · 高可用</div>
                </div>
                <div className={`landing-iso__endpoint-copy ${copiedUrl === 'https://api.frog.cn' ? 'landing-iso__endpoint-copy--copied' : ''}`}>
                  {copiedUrl === 'https://api.frog.cn' ? '✓ 已复制' : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>复制</>}
                </div>
              </div>
            </div>
          </div>

          <div className="landing-iso__stats-grid">
            <div className="landing-iso__stat-card">
              <div className="landing-iso__stat-value">99.99<span>%</span></div>
              <div className="landing-iso__stat-label">SLA 服务可用性</div>
            </div>
            <div className="landing-iso__stat-card">
              <div className="landing-iso__stat-value">&lt;30<span>ms</span></div>
              <div className="landing-iso__stat-label">网关层处理延迟</div>
            </div>
            <div className="landing-iso__stat-card">
              <div className="landing-iso__stat-value">1:1</div>
              <div className="landing-iso__stat-label">原生协议无损兼容</div>
            </div>
            <div className="landing-iso__stat-card">
              <div className="landing-iso__stat-value">24/7</div>
              <div className="landing-iso__stat-label">全球多节点路由兜底</div>
            </div>
          </div>
        </div>
      </section>

      {/* 跑马灯集成展示 */}
      <section className="landing-iso__section reveal" style={{ padding: '60px 0' }}>
        <div className="landing-iso__container">
          <h2 className="landing-iso__section-title" style={{ fontSize: '1.5rem', color: 'var(--ink-soft)' }}>
            一次配置，无缝对接现有生态
          </h2>
        </div>
        <div className="landing-iso__marquee-wrapper">
          <div className="landing-iso__marquee">
            {/* 列表重复两遍以实现无缝滚动 */}
            {['OpenAI SDK', 'LangChain', 'LlamaIndex', 'Next.js AI SDK', 'Cursor', 'Cline', 'Chatbox', 'Cherry Studio',
              'OpenAI SDK', 'LangChain', 'LlamaIndex', 'Next.js AI SDK', 'Cursor', 'Cline', 'Chatbox', 'Cherry Studio'].map((tag, i) => (
              <span key={i} className="landing-iso__integration-tag">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 特性详情展示 */}
      <section id="features" className="landing-iso__section">
        <div className="landing-iso__container landing-iso__split reveal">
          <div className="landing-iso__code-window">
            <div className="landing-iso__code-dots">
              <span className="landing-iso__code-dot landing-iso__code-dot--red" />
              <span className="landing-iso__code-dot landing-iso__code-dot--yellow" />
              <span className="landing-iso__code-dot landing-iso__code-dot--green" />
            </div>
            <p className="landing-iso__code-line landing-iso__code-comment"># Python 环境无缝切换</p>
            <p className="landing-iso__code-line">
              <span className="landing-iso__code-keyword">import</span> os
            </p>
            <p className="landing-iso__code-line">
              <span className="landing-iso__code-keyword">from</span> openai <span className="landing-iso__code-keyword">import</span> OpenAI
            </p>
            <br />
            <p className="landing-iso__code-line landing-iso__code-comment"># 只需修改 BaseURL 和 Token</p>
            <p className="landing-iso__code-line">
              client = OpenAI(
            </p>
            <p className="landing-iso__code-line">
              &nbsp;&nbsp;<span className="landing-iso__code-property">api_key</span>=<span className="landing-iso__code-string">"sk-frog-xxxxxx"</span>,
            </p>
            <p className="landing-iso__code-line">
              &nbsp;&nbsp;<span className="landing-iso__code-property">base_url</span>=<span className="landing-iso__code-string">"https://api.frog.com/v1"</span>
            </p>
            <p className="landing-iso__code-line">
              )
            </p>
            <br/>
            <p className="landing-iso__code-line">
              response = client.chat.completions.create(
            </p>
            <p className="landing-iso__code-line">
              &nbsp;&nbsp;<span className="landing-iso__code-property">model</span>=<span className="landing-iso__code-string">"gpt-5.3-codex"</span>,<span className="landing-iso__cursor"></span>
            </p>
          </div>

          <div>
            <span className="landing-iso__kicker">Frog AI Engine</span>
            <h2 className="landing-iso__headline">极简接入：稳定、兼容、可观测</h2>
            <p className="landing-iso__body">
              我们专注于 GPT 模型 API 的聚合代理，统一标准协议入口，专供全系列 GPT 与 Codex 接口。在高并发场景下依然保持低抖动和极高成功率。
            </p>

            <div className="landing-iso__mini-grid">
              <article className="landing-iso__mini-card">
                <IconGlobe className="landing-iso__mini-icon" />
                <h4 className="landing-iso__mini-title">全球加速</h4>
                <p className="landing-iso__mini-text">美/亚/欧多可用区节点，就近动态路由解析</p>
              </article>

              <article className="landing-iso__mini-card">
                <IconShield className="landing-iso__mini-icon" />
                <h4 className="landing-iso__mini-title">精准流控</h4>
                <p className="landing-iso__mini-text">多维度 Token 对账，支持 IP/密钥级限流防刷</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* 核心能力三栏 */}
      <section className="landing-iso__section reveal">
        <div className="landing-iso__container">
          <h2 className="landing-iso__section-title">企业级代理能力</h2>
          <p className="landing-iso__section-subtitle">
            不仅仅是转发，我们围绕稳定性、安全性与成本效率，提供了完整的网关治理体系。
          </p>

          <div className="landing-iso__tri-grid">
            <article className="landing-iso__dark-card reveal reveal-delay-1">
              <IconRefresh className="landing-iso__dark-icon" />
              <h3 className="landing-iso__dark-title">智能重试与熔断</h3>
              <p className="landing-iso__dark-copy">
                内置上游健康检查与自动容灾机制。遇到限流或超时，毫秒级自动切换备用通道，业务零感知。
              </p>
            </article>

            <article className="landing-iso__dark-card reveal reveal-delay-2">
              <IconCode className="landing-iso__dark-icon" />
              <h3 className="landing-iso__dark-title">全景数据分析</h3>
              <p className="landing-iso__dark-copy">
                提供细粒度到请求级的可视化仪表盘。实时监控 QPS、延迟分布与 Token 成本流水，杜绝糊涂账。
              </p>
            </article>

            <article className="landing-iso__dark-card reveal reveal-delay-3">
              <IconGauge className="landing-iso__dark-icon" />
              <h3 className="landing-iso__dark-title">性能极致优化</h3>
              <p className="landing-iso__dark-copy">
                自研 Rust 网关核心，支持连接池复用与流式传输 (Stream) 优化，首字响应时间 (TTFT) 降低 30%。
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 订阅/价格套餐 */}
      <section id="pricing" className="landing-iso__section landing-iso__pricing reveal">
        <div className="landing-iso__container">
          <h2 className="landing-iso__section-title">灵活的接入方案</h2>
          <p className="landing-iso__section-subtitle">无论是个人极客还是大型企业，都能找到最匹配的引擎</p>

          <div className="landing-iso__cards">
            {/* 标准版卡片 */}
            <article className="landing-iso__card">
              <div className="landing-iso__card-head">
                <div>
                  <div className="landing-iso__card-kicker">Pay As You Go</div>
                  <h3 className="landing-iso__card-title">开发者按量</h3>
                </div>
                <IconDatabase className="landing-iso__icon-lg" />
              </div>

              <div className="landing-iso__price-block">
                <p className="landing-iso__price-main">$0 <small>起充即用</small></p>
                <p className="landing-iso__card-copy">
                  面向个人与独立开发者，提供标准共享链路，随用随付，不设资源下限。
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
                创建 API Key
              </a>
            </article>

            {/* 企业版卡片 */}
            <article className="landing-iso__card landing-iso__card--dark">
              <div className="landing-iso__card-head">
                <div>
                  <div className="landing-iso__card-kicker">Enterprise</div>
                  <h3 className="landing-iso__card-title">企业专线</h3>
                </div>
                <IconCrown className="landing-iso__icon-lg" />
              </div>

              <div className="landing-iso__price-block">
                <p className="landing-iso__price-main">定制包月 <small>更高 SLA</small></p>
                <p className="landing-iso__card-copy">
                  面向生产级业务，分配独立机房出口 IP，独享带宽与专属技术群支持。
                </p>
              </div>

              <ul className="landing-iso__feature-list">
                {ENTERPRISE_FEATURES.map((feature) => (
                  <li key={feature} className="landing-iso__feature-item">
                    <span className="landing-iso__feature-icon-wrap">
                      <IconBolt className="landing-iso__feature-icon" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a href="/contact" className="landing-iso__card-cta landing-iso__card-cta--dark">
                咨询企业架构师
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-iso__footer" id="docs">
        <div className="landing-iso__container">
          <div className="landing-iso__footer-main">
            <a href="#" className="landing-iso__brand">
              <span className="landing-iso__brand-badge" style={{ transform: 'scale(0.8)' }}>
                <img src={BRAND_ICON_URL} alt="Frog API" className="landing-iso__brand-logo" />
              </span>
              <span>Frog API</span>
            </a>

            <div className="landing-iso__footer-links">
              <a href="#">文档中心</a>
              <a href="#">计费说明</a>
              <a href="#">服务条款 (SLA)</a>
              <a href="#">隐私政策</a>
            </div>

            <div className="landing-iso__footer-status">API CLUSTER: STABLE RUNNING</div>
          </div>

          <div className="landing-iso__copyright">© 2026 Frog API Network. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;