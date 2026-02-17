# RELAY/CHANNEL/ - AI 提供商适配器

**Generated:** 2026-02-08
**Commit:** N/A
**Branch:** N/A

## OVERVIEW
37个 AI 提供商适配器，统一接入不同 AI 服务商 API，实现 OpenAI 格式 ↔ 各家格式双向转换

## STRUCTURE
```
relay/channel/
├── adapter.go                 # Adaptor 接口定义
├── api_request.go             # 通用请求构建
├── Providers (37):
│   ├── openai/, claude/, gemini/     # 核心适配器（完整实现）
│   ├── deepseek/, ali/, aws/         # 主流适配器
│   ├── baidu/, cloudflare/, coze/     # 其他适配器
│   ├── dify/, jimeng/, jina/         # 特殊适配器
│   ├── minimax/, mistral/, moonshot/ # 国产适配器
│   ├── ollama/, openrouter/          # 聚合/本地适配器
│   ├── task/                          # 异步任务（Midjourney/Suno）
│   └── tencent/, vertex/, xai/...    # 其余适配器
```

完整列表：ai360, ali, aws, baidu, baidu_v2, claude, cloudflare, codex, cohere, coze, deepseek, dify, gemini, jimeng, jina, lingyiwanwu, minimax, mistral, mokaai, moonshot, ollama, openai, openrouter, palm, perplexity, replicate, siliconflow, submodel, task, tencent, vertex, volcengine, xai, xinference, xunfei, zhipu, zhipu_4v

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| 实现 AI 提供商适配器 | `relay/channel/{provider}/adaptor.go` | 实现 channel.Adaptor 接口 |
| 查看完整实现示例 | `relay/channel/openai/` | 参考最完整的实现 |
| 流式响应处理 | `{provider}/relay-{provider}.go` | SSE 流式解析和转发 |
| 异步任务（图片生成） | `relay/channel/task/` | Midjourney/Suno 等异步任务 |

## CONVENTIONS

### 接口实现
所有适配器必须实现 `channel.Adaptor` 接口：
- 核心方法：`Init()`, `GetRequestURL()`, `SetupRequestHeader()`, `DoRequest()`, `DoResponse()`, `GetModelList()`, `GetChannelName()`
- 格式转换：`ConvertOpenAIRequest()`, `ConvertClaudeRequest()`, `ConvertGeminiRequest()`, `ConvertRerankRequest()`, `ConvertEmbeddingRequest()`, `ConvertAudioRequest()`, `ConvertImageRequest()`

### 文件组织
- `adaptor.go` - 接口实现（必需）
- `constant.go` / `constants.go` - 常量定义（可选）
- `dto.go` - provider 特定数据结构（可选）
- `relay-{provider}.go` - 流式响应处理（通常）

### 格式转换策略
- **输入转换**: OpenAI 格式 → Provider 格式（在 Convert*Request 中）
- **输出转换**: Provider 格式 → OpenAI 格式（在 DoResponse 中）
- **流式响应**: 必须 SSE 解析和转发，不能阻塞流
- **错误处理**: 统一返回 `types.NewAPIError`

### 任务系统
异步任务实现 `channel.TaskAdaptor` 接口：`ValidateRequestAndSetAction()`, `BuildRequestURL/Header/Body()`, `DoRequest()`, `DoResponse()`, `FetchTask()`, `ParseTaskResult()`

## ANTI-PATTERNS

### 接口实现
**不要**跳过必需方法 - 必须实现 `channel.Adaptor` 所有方法，否则编译失败
**不要**在 `adaptor.go` 处理业务逻辑 - 专注格式转换，计费/限流在 relay 层处理
**不要**忽略流式响应 - `DoResponse` 必须正确处理 SSE 流，不能只处理非流式

### 格式转换
**不要**硬编码 provider URL - 用 `GetRequestURL` 动态生成，支持自定义 endpoint
**不要**直接返回上游错误 - 用 `types.NewAPIError` 包装，统一错误格式
**不要**破坏原始请求 - 转换时保留原始 metadata（id, created, model 等）

### 错误处理
**不要**忽略 SSE 解析错误 - 流式解析失败必须返回 error
**不要**返回 provider 原始错误消息 - 避免泄露敏感信息，用统一错误码
**不要**在转换函数中直接返回 error - 包装成 `types.NewAPIError` 后返回

### TODO 清理
当前有 107+ TODOs 需处理（主要在非核心 provider）：图像生成、音频转换、function calling（OpenAI/Claude 原生支持）、streaming

### 日志和调试
**不要**使用 `fmt.Println` - 用 `logger.SysLog()` 统一日志
**不要**输出敏感信息 - API keys, tokens, 请求体需脱敏
**不要**忽略调试代码 - `fmt.Println`, `panic` 等必须在提交前清理
