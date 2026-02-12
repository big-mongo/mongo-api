/**
 * Landing 页面配置文件
 * 集中管理主题、颜色、模型和其他可配置项
 */

// ==================== 颜色主题配置 ====================
export const THEME = {
  // 基础色
  white: '#ffffff',
  black: '#0a0a0b',
  gray: '#f8f9fa',
  
  // 主色调
  primary: '#0071e3',
  techBlue: '#2997ff',
  techGreen: '#10b981',
  techPurple: '#a855f7',
  
  // 边框色
  borderLight: 'rgba(255, 255, 255, 0.7)',
  borderDark: 'rgba(255, 255, 255, 0.1)',
};

// ==================== 渐变色配置 ====================
export const GRADIENTS = {
  primary: 'from-blue-600 via-indigo-500 to-purple-600',
  card: 'from-blue-600 to-purple-600',
  pricingCard: 'from-slate-200 to-white',
};

// ==================== 模型配置 ====================
export const MODELS = [
  { name: 'GPT-4o', color: '#10b981' },
  { name: 'Claude 3.5', color: '#f97316' },
  { name: 'Gemini Pro', color: '#3b82f6' },
  { name: 'Llama 3', color: '#0ea5e9' },
  { name: 'DeepSeek', color: '#6366f1' },
  { name: 'Qwen 2.5', color: '#a855f7' }
];

// ==================== 导航配置 ====================
export const NAV_CONFIG = {
  logo: {
    text: 'wawacoding',
    bgColor: 'bg-blue-600',
    letter: 'W'
  },
  menuItems: ['套餐详情', '订阅中心', 'API文档'],
  buttons: {
    login: { text: '登录', variant: 'ghost' },
    signup: { text: '注册', variant: 'solid' }
  }
};

// ==================== Hero 区域配置 ====================
export const HERO_CONFIG = {
  badge: {
    icon: 'Activity',
    text: 'All Models Online'
  },
  title: {
    main: '你的 AI 模型',
    highlight: '超级枢纽'
  },
  subtitle: {
    text: '首创 4小时循环重置 机制。不仅仅是接口转发，更是为您打造的无限灵感引擎。',
    highlight: '4小时循环重置'
  },
  cta: {
    primary: { text: '免费开始构建', icon: 'ArrowRight' },
    secondary: { text: '查看文档' }
  }
};

// ==================== 定价配置 ====================
export const PRICING_CONFIG = {
  title: '订阅中心',
  subtitle: '技术感十足的定价策略，满足不同阶段的开发需求',
  plans: [
    {
      id: 'pay-as-you-go',
      badge: 'Enterprise Closed-Source',
      title: '按量计费',
      price: { type: 'flexible', text: '灵活', unit: '充值' },
      description: '专为高精度需求设计。提供 全系列顶级闭源模型 (GPT-4o/Claude) 的 1:1 转发。',
      icon: 'Database',
      iconBg: 'bg-slate-50',
      iconColor: 'text-slate-400',
      cardStyle: 'light',
      features: [
        '闭源模型全接入 (GPT/Claude/Gemini)',
        'Token 永久有效',
        '原生并发能力不封顶',
        'API 调用实时审计'
      ],
      button: { text: '立即充值', style: 'light' }
    },
    {
      id: 'code-plan',
      badge: 'High-Performance Open-Source',
      title: 'Code Plan',
      price: { amount: 100, currency: '¥', unit: '/月' },
      description: '专为开源生态优化。支持 Llama/DeepSeek/Qwen 等最新强开源模型循环刷新。',
      icon: 'Crown',
      iconBg: 'bg-white/5',
      iconColor: 'text-blue-400',
      cardStyle: 'dark',
      featured: true,
      features: [
        '开源强模型全速访问',
        '4小时定量配额自动重置',
        '极速本地网关分发',
        '100% 隐私安全隔离'
      ],
      button: { text: '开启专业之路', style: 'dark' }
    }
  ]
};

// ==================== 特性展示配置 ====================
export const FEATURES_CONFIG = {
  closedSource: {
    badge: 'Closed Source Suite',
    title: '按量计费：闭源模型的高性能镜像',
    description: '针对追求极致逻辑能力的场景，我们提供原生闭源模型的 1:1 转发服务。无需复杂配置，按 Token 实际消耗扣费，保障企业级业务的高可靠与高响应。',
    features: [
      { icon: 'Globe', title: '全球分发', description: '毫秒级全球接入点' },
      { icon: 'ShieldCheck', title: '精准计费', description: '1:1 Token 对账单' }
    ]
  },
  codePlan: {
    title: 'Code Plan 开源核心',
    features: [
      {
        icon: 'RefreshCw',
        iconColor: 'text-blue-400',
        title: '开源模型特供',
        description: '深度整合 Llama 3、DeepSeek-V3 等顶级开源模型。在 Code Plan 中，这些强力模型均支持高并发调用与 4 小时循环额度重置。'
      },
      {
        icon: 'Code',
        iconColor: 'text-purple-400',
        title: '4h 循环魔法',
        description: '不再为月度总额度发愁。系统每 4 小时准时刷新您的开源模型配额，让您的开发灵感随刷新频率一起无限跳动。'
      },
      {
        icon: 'Gauge',
        iconColor: 'text-green-400',
        title: '极低延迟',
        description: '基于分布式集群架构，开源模型请求将直接路由至最近的高性能 GPU 节点，提供近乎实时的首字输出体验。'
      }
    ]
  }
};

// ==================== 页脚配置 ====================
export const FOOTER_CONFIG = {
  logo: NAV_CONFIG.logo,
  links: [
    { text: 'Twitter', url: '#' },
    { text: 'GitHub', url: '#' },
    { text: 'Discord', url: '#' },
    { text: 'Privacy', url: '#' }
  ],
  status: 'CONNECTED TO GLOBAL CLUSTER: V2.5.1-STABLE',
  copyright: '© 2024 wawacoding • Empowering Future AI Development'
};

// ==================== 动画配置 ====================
export const ANIMATION_CONFIG = {
  orbit: {
    duration: '25s',
    outerOrbitSize: '520px',
    innerOrbitSize: '320px',
    satelliteDistance: '220px'
  },
  spin: {
    slow: '15s',
    reverseSlow: '20s'
  }
};

// ==================== 样式类配置 ====================
export const STYLE_CLASSES = {
  button: {
    primary: 'h-14 px-10 bg-blue-600 text-white rounded-2xl font-bold shadow-[0_20px_40px_rgba(0,113,227,0.3)] hover:scale-105 transition-all active:scale-95',
    secondary: 'h-14 px-10 bg-white border-2 border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all',
    nav: 'px-5 py-1.5 rounded-full bg-white/60 border border-white/80 text-xs font-bold hover:bg-white hover:scale-105 transition-all shadow-sm'
  },
  card: {
    base: 'rounded-[2.5rem] p-10 md:p-12',
    light: 'bg-white border border-slate-100 shadow-sm',
    dark: 'bg-[#0a0a0b] border border-white/10 text-white shadow-2xl',
    feature: 'p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all'
  },
  badge: {
    base: 'text-[10px] font-black tracking-widest uppercase',
    primary: 'px-4 py-1 rounded-lg bg-blue-50 text-blue-600',
    hero: 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 animate-bounce'
  }
};
