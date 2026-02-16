# WEB/FRONTEND KNOWLEDGE BASE

**Generated:** 2026-02-08
**Domain:** React 18 + Vite 5 + Semi UI Frontend

## OVERVIEW
React 18 + Vite 5 + Semi UI frontend with 26 pages, 17 custom hooks, 12 component categories.

## STRUCTURE
```
web/src/
├── components/    # 12 categories: auth, common, dashboard, layout, model-deployments, playground, settings, table, topup, setup
├── pages/        # 26 route pages: About, Channel, Chat, Dashboard, Log, Midjourney, Model, Playground, Setting, etc.
├── hooks/        # 17 custom hooks: channels, chat, dashboard, models, users, tokens, redemptions, subscriptions, etc.
├── services/     # API call wrappers (no direct Axios)
├── context/      # User, Theme, Status providers
├── contexts/     # Route context (react-router-dom)
├── helpers/      # Utilities (19 files)
├── constants/    # Constants, configs, API endpoints
├── i18n/         # JSON translation files (i18next)
├── App.jsx       # Root component + ErrorBoundary
└── index.jsx     # Entry point + StrictMode
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| New page | `pages/{Name}/index.jsx` | Route component with table/form |
| Page hook | `hooks/{domain}/use{Domain}.jsx` | Fetch API, manage state, pagination |
| Shared component | `components/{category}/` | Reusable UI elements (auth, table, etc.) |
| API endpoint | `services/API.js` + `constants/` | Add endpoint + export function |
| Translation | `i18n/{lang}.json` | Add keys, use `t()` in code |
| Context provider | `context/` or `contexts/` | User auth, theme toggle, app status |
| Global constants | `constants/` | API URLs, default configs |
| Utility functions | `helpers/` | Format dates, currency, etc. |

## CONVENTIONS
- **代码风格**: Single quotes, Prettier formatted, ESLint enforced
- **版权头部**: JS/JSX files must include AGPL 3.0 header (enforced by ESLint)
- **国际化**: All user-facing text via `i18n/{lang}.json`, use `t('key')`, never hardcode
- **API调用**: ONLY use `services/API.js`, never direct Axios
- **路由**: `react-router-dom` with `<Routes>` in `contexts/`
- **状态管理**: Context API (`context/`), no Redux
- **组件命名**: PascalCase (components/pages), camelCase (helpers/constants)
- **Hooks**: Custom hooks in `hooks/{domain}/` organized by business logic
- **错误处理**: Use `Message.error()`, not native alerts
- **构建**: `cd web && bun install && bun run build`

## ANTI-PATTERNS
- **No console.log**: 30+ instances exist, clean up before commit (use `Message.debug()` or remove)
- **Don't skip eslint**: Run `bun run lint:fix` before committing
- **No native alerts**: Use `Modal.confirm()` from Semi UI
- **No direct DOM manipulation**: Use React state and refs
- **Don't hardcode text**: Always use i18n keys, even in placeholders
- **No direct Axios**: All API calls through `services/`
- **Don't bypass theme**: Use context theme, never inline styles
- **No inline event handlers**: Extract to handlers unless trivial
- **Don't ignore errors**: Always handle API failures gracefully
- **No unused imports**: ESLint will catch, but be proactive
