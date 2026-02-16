## SERVICE LAYER
**业务逻辑层：实现计费、配额、频道选择、格式转换等核心业务功能，被控制器调用并调用模型层**

## WHERE TO LOOK
| 功能 | 文件 | 说明 |
|------|------|------|
| AI格式转换 | `convert.go` | OpenAI/Claude/Gemini格式互转 |
| 频道选择 | `channel_select.go`, `channel_affinity.go` | 加权随机、用户亲和性 |
| 配额管理 | `quota.go`, `funding_source.go` | 扣费、充值、配额检查 |
| Token计算 | `token_counter.go`, `token_estimator.go` | 精确计数与估算 |
| 计费会话 | `billing_session.go`, `billing.go` | 异步计费、用量统计 |
| 文件处理 | `file_service.go`, `file_decoder.go` | Base64解码、文件存储 |
| OAuth认证 | `codex_oauth.go`, `passkey/` | Codex、Passkey认证 |
| OpenAI兼容 | `openaicompat/` | 聊天→响应格式转换 |
| Midjourney | `midjourney.go` | 任务状态轮询、回调处理 |
| 通知 | `user_notify.go`, `webhook.go` | 配额不足、违规通知 |

## CONVENTIONS
- **纯业务逻辑**: 不处理HTTP，只接收参数返回结果
- **返回值**: 成功返回数据，失败返回 `types/error.go` 定义错误
- **模型调用**: 仅通过 `model/` 操作数据库，不直接使用GORM
- **日志记录**: 使用 `logger.SysLog()`, 严禁 `fmt.Println`
- **异步任务**: 计费、通知等通过后台任务处理
- **Token估算**: 无精确计数器时使用 `token_estimator` 估算
- **配额检查**: 每次API调用前检查配额，超限拒绝服务

## ANTI-PATTERNS
- **Never HTTP处理**: 所有请求/响应由控制器处理
- **No直接返回错误**: 使用 `types.Wrap()` 包装错误
- **不跳过配额检查**: 所有AI请求必须验证配额
- **不硬编码金额**: 使用 `constant/` 中的价格常量
- **不同步计费**: 计费操作放入后台任务避免阻塞
- **No model直接引用**: 只通过 `model/` 包接口访问数据
