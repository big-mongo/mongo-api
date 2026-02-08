# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-08
**Commit:** N/A
**Branch:** N/A

## OVERVIEW
Next-Generation LLM Gateway and AI Asset Management System - monorepo with Go backend (Gin framework), React frontend, and Electron desktop app.

## STRUCTURE
```
mongo-api/
├── controller/    # HTTP request handlers (53 files)
├── service/       # Business logic layer (42 files)
├── model/         # Data persistence & ORM (35 files)
├── middleware/    # Request pipeline (auth, rate limit, i18n)
├── relay/         # Core: AI format conversion & proxying (175 files)
│   └── channel/   # AI provider adapters (33 providers, 148 files)
├── dto/           # Data transfer objects
├── types/         # Type definitions
├── common/        # Shared utilities (47 files)
├── constant/      # Constants & configs
├── oauth/         # OAuth authentication
├── setting/       # Runtime config management
├── router/        # Route definitions
├── web/           # React frontend (361 src files)
├── electron/      # Desktop app wrapper
├── main.go        # Backend entry point
└── go.mod         # Go 1.25.1 dependencies
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add API endpoint | `controller/` + `router/main.go` | Register route, implement handler |
| Business logic | `service/` | Core domain logic, billing, quotas |
| Database model | `model/` | GORM models, migrations |
| AI provider adapter | `relay/channel/{provider}/` | OpenAI, Claude, Gemini, etc. |
| Format conversion | `relay/` handlers + `dto/` | OpenAI ↔ Claude ↔ Gemini |
| Frontend component | `web/src/components/` | Semi UI components |
| Frontend page | `web/src/pages/` | Route components |
| API service calls | `web/src/services/` | Axios wrappers |
| React hooks | `web/src/hooks/` | Custom hooks by domain |

## CONVENTIONS

### Go Backend
- **MVC分层**: controller → service → model (clear separation)
- **Relay层**: Unique to this project - converts AI API formats
- **Embed前端**: React build embedded via `go:embed web/dist`
- **路由**: Use `router.SetRouter()` to register routes
- **错误处理**: Return common errors from `types/error.go`
- **数据库**: Use GORM models in `model/`
- **配置**: Runtime settings via `setting/`, constants in `constant/`
- **日志**: Use `logger/SysLog()`, `logger.FatalLog()`, not `fmt.Println`

### Frontend (React)
- **框架**: React 18 + Vite 5 + Semi UI
- **代码风格**: Single quotes, Prettier formatted, ESLint enforced
- **版权头部**: JS/JSX files must include AGPL 3.0 header (enforced by ESLint)
- **国际化**: Use `i18n/` JSON files, via `web/src/i18n/`
- **路由**: `react-router-dom` in `web/src/contexts/`
- **状态管理**: Context API in `web/src/context/`
- **Hooks**: Custom hooks organized by domain in `web/src/hooks/`
- **API调用**: Use services in `web/src/services/`, not direct Axios
- **构建**: `cd web && bun install && bun run build`

## ANTI-PATTERNS (THIS PROJECT)

### Backend Go
- **NEVER use `router/main.go` as entry**: It's just a router package file, not main()
- **Avoid hardcoded values**: Use `constant/` or `setting/` configs
- **Don't bypass relay layer**: All AI API calls go through `relay/` handlers
- **No TODO in production**: 40+ TODOs exist in `relay/channel/` adapters
- **Clean debug code**: Remove `fmt.Println` before merge

### Frontend React
- **No console.log in production**: 30+ instances need cleanup
- **Don't ignore eslint**: Use `eslint:fix` before committing
- **No native alerts**: Use Semi UI Modal.confirm instead
- **No direct DOM manipulation**: Use React state
- **Don't skip i18n**: Use translation keys, not hardcoded text

## UNIQUE STYLES

### Relay/Adapter Pattern
- **AI Provider Abstraction**: Each provider has adapter in `relay/channel/{provider}/`
- **Format Conversion**: `relay/` converts between OpenAI/Claude/Gemini formats
- **Channel Selection**: Weighted random, affinity-based, retry logic
- **Supports**: 33+ AI providers (OpenAI, Claude, Gemini, Midjourney, etc.)

### Monorepo Architecture
- **Single repository**: Backend, frontend, desktop app together
- **Embedded frontend**: React build packed into Go binary
- **Shared config**: Environment variables control all components
- **Docker single image**: Multi-stage build produces one executable

### Configuration
- **Runtime settings**: Dynamic config in database, loaded via `setting/`
- **Hot reload**: Config syncs periodically
- **Channel cache**: In-memory or Redis cache for performance
- **Multi-language**: Backend YAML + Frontend JSON i18n

## COMMANDS

### Development
```bash
# Start backend (with embedded frontend)
go run main.go

# Start frontend dev server (for development)
cd web && bun install && bun run dev

# Build frontend (embeddable)
cd web && bun run build

# Run tests
go test ./...

# Build all
make all
```

### Docker
```bash
# Build image
docker build -t new-api .

# Run with docker-compose
docker-compose up -d

# Manual run
docker run -p 3000:3000 -v ./data:/data calciumion/new-api:latest
```

### Build
```bash
# Build backend (Linux)
GOOS=linux GOARCH=amd64 go build -o new-api

# Build backend (ARM)
GOOS=linux GOARCH=arm64 go build -o new-api-arm64

# Build Electron app
cd electron && npm run build:mac
```

### Code Quality
```bash
# Backend lint (if golangci-lint installed)
golangci-lint run

# Frontend lint
cd web && bun run eslint
cd web && bun run lint:fix

# Frontend format
cd web && bun run prettier . --check
cd web && bun run prettier . --write
```

## NOTES

### Architecture Highlights
- **Relay层 is核心**: Not standard MVC - it's the AI gateway magic
- **Channel affinity**: Users stick to same provider for session consistency
- **Billing complexity**: Quota tracking, token estimation, cache billing
- **OAuth extensibility**: Custom providers loaded from database

### Gotchas
- **router/main.go不是入口**: Only contains `SetRouter()`, actual main is in `./main.go`
- **Frontend embedded**: `web/dist/` must exist before building Go binary
- **Database migrations**: Handled by GORM AutoMigrate, no separate migration files
- **Redis optional**: Works with in-memory cache if Redis not configured
- **Multi-database**: Supports MySQL, PostgreSQL, SQLite (config via SQL_DSN)

### Testing
- **Test coverage low**: Only 3 test files (`*_test.go`)
- **No CI tests**: GitHub Actions only builds, doesn't run tests
- **Add tests**: Use `*_test.go` naming, place next to source file
- **Test framework**: Go `testing` + `testify` assertions

### Performance
- **Cache critical**: Memory or Redis cache recommended for production
- **Channel pool**: Multiple channels per provider for load distribution
- **Async billing**: Billing updates via background task (billing_session.go)
- **Stream timeout**: Configurable via STREAMING_TIMEOUT env var (default 300s)
