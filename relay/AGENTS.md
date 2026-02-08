# RELAY/ - AI API 格式转换和代理层

**核心创新**: 统一 AI 接口格式转换和请求代理，支持 33+ AI 提供商无缝接入

## OVERVIEW
AI API 格式转换和请求代理层，将不同 AI 提供商的 API 统一转换为兼容格式，支持 OpenAI、Claude、Gemini 等 33+ 提供商

## STRUCTURE
```
relay/
├── channel/                  # 37 个 AI 提供商适配器
│   ├── openai/              # OpenAI 适配器
│   ├── claude/              # Claude 适配器
│   ├── gemini/              # Gemini 适配器
│   ├── deepseek/            # DeepSeek 适配器
│   ├── ali/                 # 通义千问适配器
│   ├── aws/                 # Bedrock 适配器
│   └── ... (34 more)
├── compatible_handler.go    # OpenAI 兼容格式处理器
├── claude_handler.go        # Claude 格式处理器
├── gemini_handler.go        # Gemini 格式处理器
├── relay_adaptor.go         # 适配器路由器 (Adaptor 工厂)
├── relay_task.go            # 异步任务处理器
├── common/                  # 通用工具
│   ├── relay_utils.go       # 通用工具函数
│   ├── billing.go           # 计费逻辑
│   └── override.go          # 参数覆盖逻辑
├── helper/                  # 辅助函数
│   ├── stream_scanner.go    # 流式响应扫描
│   ├── price.go             # 价格计算
│   └── model_mapped.go      # 模型映射
└── common_handler/          # 共享处理器
    └── rerank.go            # Rerank 处理
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| 添加新的 AI 提供商 | `relay/channel/{provider}/adaptor.go` | 实现 channel.Adaptor 接口 |
| OpenAI 兼容请求 | `compatible_handler.go` | 通用 OpenAI 格式处理 |
| Claude 请求转换 | `claude_handler.go` | Claude 格式 → OpenAI 格式 |
| Gemini 请求转换 | `gemini_handler.go` | Gemini 格式 → OpenAI 格式 |
| 异步任务处理 | `relay_task.go` | 图片/视频生成等长时任务 |
| 流式响应处理 | `helper/stream_scanner.go` | SSE 流式解析 |
| 计费逻辑 | `common/billing.go` | Token 计费、缓存计费 |
| 格式转换 | `common/request_conversion.go` | 请求格式转换 |

## CONVENTIONS

### Adaptor 接口
所有 AI 提供商适配器必须实现 `channel.Adaptor` 接口：Init(), GetRequestURL(), SetupRequestHeader(), Convert*Request(), DoRequest(), DoResponse(), GetModelList(), GetChannelName()

### 格式转换
OpenAI ↔ Claude ↔ Gemini 双向转换，function calling 仅 OpenAI 原生支持

### 任务系统
异步任务（图片/视频生成）通过 `relay_task.go`：Submit/Query/Fetch 流程，实现 `channel.TaskAdaptor` 接口

### 计费
`billing.go` 统一计费，支持 cache billing（OpenAI、Azure、DeepSeek、Claude、Qwen），`reasonmap/` 处理 reasoning token

## ANTI-PATTERNS

### 格式转换
不要硬编码 URL（用 GetRequestURL），不要跳过流式处理（必须 SSE），不要直接返回上游错误（用 types.NewAPIError 包装）

### Adaptor 实现
不要破坏接口契约（必须实现所有方法），不要在 adaptor.go 处理业务逻辑（专注格式转换），不要忽略流式响应（DoResponse 必须处理流式）

### 任务系统
不要同步等待长时任务（用 relay_task.go），不要忽略任务状态管理（pending/running/failed/succeeded）

### 计费
不要重复计费（用 billing.go 统一），不要忽略 reasoning token（用 reasonmap/），不要跳过缓存计费

### 日志
不要使用 fmt.Println（用 logger.SysLog），不要输出敏感信息（API keys），不要忽略流式扫描错误（helper/stream_scanner.go）
