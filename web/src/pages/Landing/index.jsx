import React, { useEffect } from 'react';
import { 
  Play, 
  FileText, 
  CheckCircle, 
  Plus, 
  Minus, 
  Globe, 
  Github, 
  Twitter, 
  Menu, 
  X,
  Zap,
  Shield,
  BarChart3,
  ChevronRight,
  Terminal,
  Sparkles,
  Clock,
  Layers,
  Cpu,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

// --- 业务核心数据 ---

const MODELS = [
  { name: 'GPT-4o', color: 'text-emerald-500' },
  { name: 'Claude 3.5', color: 'text-orange-500' },
  { name: 'Gemini 1.5 Pro', color: 'text-blue-500' },
  { name: 'Llama 3', color: 'text-sky-500' },
  { name: 'DeepSeek V3', color: 'text-indigo-500' },
  { name: 'Qwen 2.5', color: 'text-purple-500' }
];

const PLANS = [
  {
    type: 'PAY_AS_YOU_GO',
    title: '闭源模型 · 按量计费',
    description: '无需月费，仅为您消耗的 Token 买单。深度集成 OpenAI、Claude、Gemini 全系列。',
    features: ['全模型支持', '高并发无限制', '毫秒级切换', '余额永不过期'],
    highlight: '0 门槛接入'
  },
  {
    type: 'WAWA_CODING',
    title: '开源模型 · wawacoding',
    description: '针对开发者设计的极致套餐。支持 Llama, Qwen, DeepSeek 等最强开源模型。',
    features: ['4小时定额重置', '最新模型支持', '包月/季/年可选', '无限次刷新次数'],
    highlight: '每 4 小时自动重置次数',
    isSpecial: true
  }
];

const LANDING_THEME = {
  pageBg: '#f4f7fc',
  surface: '#ffffff',
  surfaceAlt: '#edf3fb',
  text: '#0f172a',
  textMuted: '#475569',
  textSubtle: '#64748b',
  border: '#dbe5f1',
  primary: '#0ea5a8',
  primaryHover: '#0b8b8f',
  accent: '#2563eb',
  accentHover: '#1d4ed8',
  darkPanel: '#0f172a',
  darkPanelHover: '#020617'
};

const getActualTheme = () => {
  const storedTheme = localStorage.getItem('theme-mode') || 'auto';
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const useLandingThemeIsolation = () => {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.remove('dark');
    body.removeAttribute('theme-mode');

    return () => {
      if (getActualTheme() === 'dark') {
        html.classList.add('dark');
        body.setAttribute('theme-mode', 'dark');
      }
    };
  }, []);
};

// --- 基础 UI 组件 ---
const Button = ({ children, variant = 'primary', size = 'md', className = '', icon, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 active:scale-95";
  const variants = {
    primary: "landing-primary-btn text-white shadow-xl shadow-slate-900/10",
    glass: "bg-white/40 backdrop-blur-xl border border-white/50 text-slate-900 hover:bg-white/60",
    blue: "landing-accent-btn text-white shadow-lg shadow-blue-500/20",
    outline: "bg-transparent text-slate-700 border border-slate-200 hover:border-slate-900",
    dark: "landing-dark-btn text-white rounded-full px-6 py-2 shadow-lg",
  };
  const sizes = {
    sm: "h-9 px-4 text-xs rounded-full",
    md: "h-11 px-6 text-sm rounded-full",
    lg: "h-14 px-8 text-base rounded-full font-bold tracking-tight",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
      {icon && <span className="ml-2">{icon}</span>}
    </button>
  );
};

// --- 动画组件：模型轨道旋转 ---
const ModelOrbit = () => {
  return (
    <div className="relative w-full h-[360px] flex items-center justify-center overflow-hidden">
      <div className="z-10 w-20 h-20 bg-white rounded-[1.5rem] shadow-2xl flex items-center justify-center border border-slate-100 group">
        <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-2xl group-hover:rotate-12 transition-transform duration-500">W</div>
      </div>
      <div className="absolute w-[280px] h-[280px] border border-slate-200/50 rounded-full animate-[spin_20s_linear_infinite]">
        {MODELS.map((m, i) => (
          <div 
            key={i}
            className={`absolute bg-white/80 backdrop-blur-md border border-slate-100 px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold ${m.color}`}
            style={{
              top: `${50 + 50 * Math.sin((i * 60 * Math.PI) / 180)}%`,
              left: `${50 + 50 * Math.cos((i * 60 * Math.PI) / 180)}%`,
              transform: 'translate(-50%, -50%) rotate(0deg)'
            }}
          >
            {m.name}
          </div>
        ))}
      </div>
      <div className="absolute w-[400px] h-[400px] border border-slate-100/30 rounded-full animate-[spin_35s_linear_infinite_reverse]"></div>
    </div>
  );
};

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 px-4 pt-4 pointer-events-none">
    <div className="max-w-7xl mx-auto pointer-events-auto">
      <div className="bg-white/90 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-[2.5rem] px-8 py-2.5 flex items-center justify-between">
        {/* 左侧：品牌 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
             <div className="w-6 h-6 bg-slate-900 rounded-[6px] flex items-center justify-center text-white font-bold text-xs rotate-[-10deg]">W</div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-900 tracking-tighter leading-none">wawacoding</span>
          </div>
        </div>

        {/* 中间：导航链接 */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-50/50 rounded-full border border-slate-100 p-1">
          {['模型状态与计费', '文档', '关于'].map((item) => (
            <a 
              key={item} 
              href="#" 
              className="px-6 py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-white rounded-full transition-all duration-300"
            >
              {item}
            </a>
          ))}
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">登录</a>
          <Button variant="dark" size="sm" className="h-10 px-6" icon={<ChevronRight className="w-4 h-4" />}>
            注册账户
          </Button>
        </div>
      </div>
    </div>
  </nav>
);

const HeroSection = () => (
  <section className="relative pt-20 pb-16 px-6"> {/* 进一步缩小顶部间距 */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-100/30 blur-[100px] rounded-full mix-blend-multiply"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-purple-100/30 blur-[100px] rounded-full mix-blend-multiply"></div>
    </div>
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-8">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-blue-600 text-[12px] font-black uppercase tracking-widest shadow-sm">
          <Sparkles className="w-3.5 h-3.5 mr-2 fill-current" />
          全系模型 · 极致性价比
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tighter leading-[1.05]">
          让每一个开发者 <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">都能用上最顶尖 AI</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium leading-relaxed">
          首创 4 小时循环重置 wawacoding 模式。支持全系闭源模型按量计费，不仅是接口转发，更是你的全能模型枢纽。
        </p>
        <div className="flex items-center gap-5">
          <Button size="lg" className="px-10 h-14">即刻接入</Button>
          <Button size="lg" variant="glass" className="h-14" icon={<Layers className="w-4 h-4" />}>查看费率</Button>
        </div>
      </div>
      <div className="relative flex justify-center lg:justify-end">
        <ModelOrbit />
      </div>
    </div>
  </section>
);

const PricingSection = () => (
  <section className="py-24 px-6 bg-slate-50/50 relative overflow-hidden">
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">灵活的计费模式</h2>
        <p className="text-slate-500 text-lg">无论高频创作还是极客开发，都有最适合你的方案</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
        {PLANS.map((plan, i) => (
          <div key={i} className={`group p-10 rounded-[3rem] border transition-all duration-500 ${
            plan.isSpecial 
            ? 'bg-slate-900 text-white border-slate-800 shadow-2xl shadow-blue-900/20' 
            : 'bg-white text-slate-900 border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50'
          }`}>
            <div className="flex justify-between items-start mb-10">
              <div className={`p-4 rounded-2xl ${plan.isSpecial ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                {plan.isSpecial ? <Cpu className="w-8 h-8" /> : <BarChart3 className="w-8 h-8" />}
              </div>
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                plan.isSpecial ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                {plan.highlight}
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-4">{plan.title}</h3>
            <p className={`mb-10 text-lg leading-relaxed ${plan.isSpecial ? 'text-slate-400' : 'text-slate-500'}`}>
              {plan.description}
            </p>
            <ul className="space-y-4 mb-12">
              {plan.features.map((f, idx) => (
                <li key={idx} className="flex items-center gap-3 font-semibold">
                  <CheckCircle className={`w-5 h-5 ${plan.isSpecial ? 'text-blue-500' : 'text-blue-600'}`} />
                  {f}
                </li>
              ))}
            </ul>
            <Button 
              variant={plan.isSpecial ? 'blue' : 'primary'} 
              className="w-full" 
              size="lg"
              icon={plan.isSpecial ? <RefreshCw className="w-4 h-4 animate-spin-slow" /> : null}
            >
              {plan.isSpecial ? '订购 wawacoding' : '充值余额'}
            </Button>
            {plan.isSpecial && (
              <p className="mt-4 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
                支持包月 / 包季 / 包年 · 最新模型同步
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const App = () => {
  useLandingThemeIsolation();

  return (
    <>
      <div
        className="landing-theme min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden"
        style={{
          '--landing-page-bg': LANDING_THEME.pageBg,
          '--landing-surface': LANDING_THEME.surface,
          '--landing-surface-alt': LANDING_THEME.surfaceAlt,
          '--landing-text': LANDING_THEME.text,
          '--landing-text-muted': LANDING_THEME.textMuted,
          '--landing-text-subtle': LANDING_THEME.textSubtle,
          '--landing-border': LANDING_THEME.border,
          '--landing-primary': LANDING_THEME.primary,
          '--landing-primary-hover': LANDING_THEME.primaryHover,
          '--landing-accent': LANDING_THEME.accent,
          '--landing-accent-hover': LANDING_THEME.accentHover,
          '--landing-dark-panel': LANDING_THEME.darkPanel,
          '--landing-dark-panel-hover': LANDING_THEME.darkPanelHover,
        }}
      >
        <Navbar />
        <main className="pt-24"> {/* 导航栏下方全局 pt 缩小 */}
          <HeroSection />

          {/* 特性展示带 */}
          <section className="py-12 bg-white relative">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="inline-flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white animate-pulse">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-slate-900 leading-tight">4 小时重置机制</div>
                  <p className="text-[12px] text-slate-500 font-bold uppercase tracking-tight">每一秒的等待，都是为了下一次灵感爆发</p>
                </div>
                <div className="ml-4 flex gap-1">
                  {[1,2,3,4].map(i => <div key={i} className="w-1 h-5 bg-blue-200 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}}></div>)}
                </div>
              </div>
            </div>
          </section>

          <PricingSection />

          {/* 底部 CTA */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto bg-slate-900 rounded-[3.5rem] p-16 md:p-20 text-center relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[300px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full"></div>
               <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-8 leading-tight">
                 不仅是工具，更是你的 AI 枢纽。
               </h2>
               <Button size="lg" className="!bg-white !text-slate-900 px-16 h-14 hover:scale-105">即刻注册体验</Button>
            </div>
          </section>
        </main>
        <footer className="bg-white pt-20 pb-12 px-8 border-t border-slate-50 text-center text-slate-400 text-[12px] font-bold uppercase tracking-[0.2em]">
          © 2024 wawacoding Inc. 专注 AI 基础设施建设 · 助力全球开发者
        </footer>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .landing-theme {
          background-color: var(--landing-page-bg);
          color: var(--landing-text);
        }

        .landing-theme .landing-primary-btn {
          background-color: var(--landing-primary) !important;
        }

        .landing-theme .landing-primary-btn:hover {
          background-color: var(--landing-primary-hover) !important;
        }

        .landing-theme .landing-accent-btn {
          background-color: var(--landing-accent) !important;
        }

        .landing-theme .landing-accent-btn:hover {
          background-color: var(--landing-accent-hover) !important;
        }

        .landing-theme .landing-dark-btn {
          background-color: var(--landing-dark-panel) !important;
        }

        .landing-theme .landing-dark-btn:hover {
          background-color: var(--landing-dark-panel-hover) !important;
        }

        .landing-theme .bg-white {
          background-color: var(--landing-surface) !important;
        }

        .landing-theme .bg-slate-50,
        .landing-theme .bg-slate-50\/50 {
          background-color: var(--landing-surface-alt) !important;
        }

        .landing-theme .text-slate-900 {
          color: var(--landing-text) !important;
        }

        .landing-theme .text-slate-600,
        .landing-theme .text-slate-500 {
          color: var(--landing-text-muted) !important;
        }

        .landing-theme .text-slate-400 {
          color: var(--landing-text-subtle) !important;
        }

        .landing-theme .border-slate-100,
        .landing-theme .border-slate-50,
        .landing-theme .border-white\/40,
        .landing-theme .border-white\/50 {
          border-color: var(--landing-border) !important;
        }

        .landing-theme .bg-slate-900 {
          background-color: var(--landing-dark-panel) !important;
        }

        .landing-theme .hover\:bg-slate-800:hover,
        .landing-theme .hover\:bg-black:hover {
          background-color: var(--landing-dark-panel-hover) !important;
        }
      `}} />
    </>
  );
};

export default App;