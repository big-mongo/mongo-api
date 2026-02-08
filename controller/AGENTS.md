# CONTROLLER LAYER

**Generated:** 2026-02-08

## OVERVIEW
HTTP request handlers using Gin framework for API endpoints.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add HTTP endpoint | Create controller function + `router/main.go` | Register route, implement handler |
| Channel management | channel.go (2096 lines) | CRUD, status, affinity cache |
| User authentication | user.go (1144 lines) | Login, logout, register, profile |
| Deployment operations | deployment.go (810 lines) | Deploy, rollback, status |
| Billing & quota | billing.go, channel-billing.go | Usage tracking, quota calc |
| OAuth providers | oauth.go, custom_oauth.go, codex_oauth.go | 3rd party auth (Discord, LinuxDO, Telegram) |
| Subscription & payment | subscription.go + *_payment_*.go | Creem, Stripe, EPay integration |
| Two-factor auth | twofa.go | TOTP, recovery codes |
| Relay proxy | relay.go | AI API format conversion gateway |

## CONVENTIONS
- **Gin Context**: Always use `*gin.Context` for request/response
- **JSON Response Format**: `c.JSON(http.StatusOK, gin.H{"success": bool, "message": string, "data": any})`
- **Input Validation**: Struct tags with gin validator, `c.ShouldBindJSON(&req)`
- **Error Handling**: Use `common.ApiErrorI18n()` for i18n errors, `common.SysError()` for logging
- **Pagination**: Use `common.GetPageQuery(c)` helper
- **Service Layer**: All business logic delegated to `service/`, never in controller
- **Logging**: `logger.SysLog()`, `logger.FatalLog()`, never `fmt.Println`

## ANTI-PATTERNS
- **NEVER add business logic**: Controller → Service → Model only, no logic in handlers
- **Don't use raw errors**: Wrap with common error types from `types/error.go`
- **No hardcoding**: Use `constant/` or `setting/` for all config values
- **Don't bypass validation**: Always validate input before processing
- **No direct model access**: Use service layer, not `model.*` directly
- **Don't ignore i18n**: Use `common.ApiErrorI18n()` with i18n message keys
