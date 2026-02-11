import React from 'react';
import { Button, Card, Collapse, Tag, Typography } from '@douyinfe/semi-ui';
import {
  IconCheckCircleStroked,
  IconFile,
  IconMinus,
  IconPlay,
  IconPlus,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';

const { Text } = Typography;

const HERO_CONTENT = {
  badge: 'NEW API · 营销落地页',
  title: '一个网关，加速上线你的 AI 产品',
  subtitle:
    '通过一个稳定端点接入 OpenAI 兼容、Claude、Gemini、Midjourney 等模型。',
  primaryAction: {
    label: '获取 API Key',
    to: '/console',
  },
  secondaryAction: {
    label: '查看定价',
    to: '/pricing',
  },
  supportNotes: ['统一的密钥与额度管理', '多供应商故障切换与重试', 'OpenAI 兼容 API 接口'],
  stats: [
    { value: '30+', label: '模型供应商' },
    { value: '99.9%', label: '网关可用性目标' },
    { value: '1', label: '集成基准 URL' },
  ],
};

const FEATURE_CARDS = [
  {
    tag: '稳定性',
    title: '智能路由，保障生产流量稳定',
    description:
      '通过加权渠道选择与自动重试，在上游波动时仍尽量保持应用在线。',
    bullets: ['多供应商自动兜底', '细粒度状态码重试范围', '按模型与用户精细化控制'],
  },
  {
    tag: '运营',
    title: '在一个控制台管理计费、模型与用户',
    description:
      '额度、价格与访问控制集中配置，不再依赖零散脚本和临时工具。',
    bullets: ['额度预扣与结算流程', '管理员与私有路由权限', '结构化设置与热更新'],
  },
  {
    tag: '兼容性',
    title: '现有客户端可低成本接入',
    description:
      '保留当前 SDK 工作流，仅替换 base URL 即可获得路由治理与可观测能力。',
    bullets: ['OpenAI 兼容接口', 'Claude 与 Gemini 中继适配', 'Realtime 与多模态扩展'],
  },
];

const USE_CASES = [
  {
    title: 'SaaS 团队',
    summary:
      '借助模型路由和灵活费率快速上线 AI 功能，同时更好地守住利润空间。',
    outcomes: ['降低供应商绑定风险', '成本治理更可预期'],
  },
  {
    title: '内部平台团队',
    summary:
      '为各业务团队提供统一的 API 协议与权限模型，无需重复实现网关逻辑。',
    outcomes: ['统一鉴权与额度体系', '新产品接入更快'],
  },
  {
    title: 'AI 运维团队',
    summary:
      '跨供应商做实验、评估质量并迁移流量，客户端只需极少改动。',
    outcomes: ['可控的渐进式发布', '统一日志与用量复盘'],
  },
];

const FAQ_ITEMS = [
  {
    question: '需要大幅改动现有 SDK 代码吗？',
    answer:
      '通常不需要。大多数团队保留现有 OpenAI 风格客户端代码，仅更新 base URL 和密钥。',
  },
  {
    question: '可以只向特定用户开放部分模型吗？',
    answer:
      '可以。你可以组合令牌分组、模型限制和角色权限来划定访问边界。',
  },
  {
    question: '这个页面方便改成我们的活动页吗？',
    answer:
      '方便。页面可见文案和列表数据都集中在文件顶部常量里，便于快速调整。',
  },
];

const CTA_CONTENT = {
  title: '准备统一你的 AI 技术栈了吗？',
  description:
    '部署 New API，签发首个密钥，几分钟内就能把流量汇聚到同一个端点。',
  action: {
    label: '进入控制台',
    to: '/console',
  },
};

const FOOTER_INFO = {
  title: 'New API 落地页',
  description:
    '基于 Semi UI 组件与响应式工具类构建，聚焦转化且便于二次编辑。',
  links: [
    { label: '控制台', to: '/console' },
    { label: '定价', to: '/pricing' },
    { label: '关于我们', to: '/about' },
    { label: '隐私政策', to: '/privacy-policy' },
  ],
};

const Landing = () => {
  return (
    <div className='relative w-full overflow-x-hidden bg-semi-color-bg-0 text-semi-color-text-0'>
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute left-[-8rem] top-[-10rem] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl' />
        <div className='absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl' />
        <div className='absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl' />
      </div>

      <div className='relative mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 pb-14 pt-20 md:px-6 md:pt-24'>
        <section className='grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end'>
          <div className='space-y-6'>
            <Tag color='cyan' shape='circle' size='large'>
              {HERO_CONTENT.badge}
            </Tag>
            <h1 className='text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl'>
              {HERO_CONTENT.title}
            </h1>
            <p className='max-w-2xl text-base text-semi-color-text-1 md:text-lg'>
              {HERO_CONTENT.subtitle}
            </p>
            <div className='flex flex-wrap items-center gap-3'>
              <Link to={HERO_CONTENT.primaryAction.to}>
                <Button
                  icon={<IconPlay />}
                  theme='solid'
                  type='primary'
                  size='large'
                  className='!rounded-full px-6'
                >
                  {HERO_CONTENT.primaryAction.label}
                </Button>
              </Link>
              <Link to={HERO_CONTENT.secondaryAction.to}>
                <Button
                  icon={<IconFile />}
                  size='large'
                  className='!rounded-full px-6'
                >
                  {HERO_CONTENT.secondaryAction.label}
                </Button>
              </Link>
            </div>
          </div>

          <Card className='border border-semi-color-border bg-semi-color-bg-1/90 shadow-sm backdrop-blur'>
            <div className='space-y-4'>
              <Text strong className='text-semi-color-text-0'>
                为什么团队选择 New API
              </Text>
              <div className='space-y-3'>
                {HERO_CONTENT.supportNotes.map((note) => (
                  <div key={note} className='flex items-start gap-2'>
                    <IconCheckCircleStroked className='mt-0.5 text-emerald-500' />
                    <Text className='text-semi-color-text-1'>{note}</Text>
                  </div>
                ))}
              </div>
              <div className='grid grid-cols-3 gap-2 border-t border-dashed border-semi-color-border pt-4'>
                {HERO_CONTENT.stats.map((stat) => (
                  <div key={stat.label} className='rounded-xl bg-semi-color-fill-0 p-3 text-center'>
                    <p className='text-lg font-semibold text-semi-color-text-0 md:text-xl'>
                      {stat.value}
                    </p>
                    <p className='text-xs text-semi-color-text-2'>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section className='space-y-5'>
          <div className='space-y-2'>
            <h2 className='text-2xl font-semibold md:text-3xl'>核心能力亮点</h2>
            <p className='max-w-3xl text-semi-color-text-1'>
              下方卡片内容由顶部常量驱动，文案可快速调整。
            </p>
          </div>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {FEATURE_CARDS.map((feature) => (
              <Card
                key={feature.title}
                className='h-full border border-semi-color-border bg-semi-color-bg-1/80 shadow-sm'
              >
                <div className='space-y-4'>
                  <Tag color='green' shape='circle'>
                    {feature.tag}
                  </Tag>
                  <h3 className='text-lg font-semibold text-semi-color-text-0'>
                    {feature.title}
                  </h3>
                  <p className='text-sm text-semi-color-text-1'>{feature.description}</p>
                  <div className='space-y-2'>
                    {feature.bullets.map((bullet) => (
                      <div key={bullet} className='flex items-start gap-2'>
                        <IconCheckCircleStroked className='mt-0.5 text-cyan-600' />
                        <p className='text-sm text-semi-color-text-1'>{bullet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className='space-y-5'>
          <h2 className='text-2xl font-semibold md:text-3xl'>适用场景</h2>
          <div className='grid gap-4 lg:grid-cols-3'>
            {USE_CASES.map((item) => (
              <Card
                key={item.title}
                className='h-full border border-semi-color-border bg-semi-color-bg-1/75 shadow-sm'
              >
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold text-semi-color-text-0'>
                    {item.title}
                  </h3>
                  <p className='text-sm text-semi-color-text-1'>{item.summary}</p>
                  <div className='space-y-2 border-t border-semi-color-border pt-3'>
                    {item.outcomes.map((outcome) => (
                      <div key={outcome} className='flex items-start gap-2'>
                        <IconCheckCircleStroked className='mt-0.5 text-emerald-500' />
                        <p className='text-sm text-semi-color-text-1'>{outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className='space-y-5'>
          <h2 className='text-2xl font-semibold md:text-3xl'>常见问题</h2>
          <Card className='border border-semi-color-border bg-semi-color-bg-1/80 shadow-sm'>
            <Collapse accordion expandIcon={<IconPlus />} collapseIcon={<IconMinus />}>
              {FAQ_ITEMS.map((item, index) => (
                <Collapse.Panel
                  key={item.question}
                  header={item.question}
                  itemKey={`faq-${index}`}
                >
                  <p className='text-sm leading-6 text-semi-color-text-1'>{item.answer}</p>
                </Collapse.Panel>
              ))}
            </Collapse>
          </Card>
        </section>

        <section>
          <Card className='overflow-hidden border border-semi-color-border bg-gradient-to-r from-cyan-500/15 via-emerald-500/10 to-transparent shadow-sm'>
            <div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between'>
              <div className='max-w-2xl space-y-2'>
                <h2 className='text-2xl font-semibold text-semi-color-text-0 md:text-3xl'>
                  {CTA_CONTENT.title}
                </h2>
                <p className='text-semi-color-text-1'>{CTA_CONTENT.description}</p>
              </div>
              <Link to={CTA_CONTENT.action.to}>
                <Button
                  icon={<IconPlay />}
                  theme='solid'
                  type='primary'
                  size='large'
                  className='!rounded-full px-6'
                >
                  {CTA_CONTENT.action.label}
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        <footer className='rounded-2xl border border-semi-color-border bg-semi-color-bg-1/75 p-5 md:p-6'>
          <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold text-semi-color-text-0'>
                {FOOTER_INFO.title}
              </h3>
              <p className='max-w-xl text-sm text-semi-color-text-1'>
                {FOOTER_INFO.description}
              </p>
            </div>
            <div className='flex flex-wrap gap-2'>
              {FOOTER_INFO.links.map((item) => (
                <Link key={item.label} to={item.to}>
                  <Button className='!rounded-full' type='tertiary' icon={<IconFile />}>
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
