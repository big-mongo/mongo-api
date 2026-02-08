# MODEL LAYER

**Generated:** 2026-02-08
**Commit:** N/A
**Branch:** N/A

## OVERVIEW
数据持久化层，使用 GORM ORM 管理 35+ 个数据模型。

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| 数据库初始化 | `model/main.go` | InitDB(), migrateDB(), AutoMigrate |
| 主要模型 | `model/{entity}.go` | Channel, Token, User, Option, Log, Ability, Subscription |
| 渠道缓存 | `model/channel_cache.go` | InitChannelCache(), GetRandomSatisfiedChannel() |
| 用户缓存 | `model/user_cache.go` | InitUserCache(), CacheGetUser() |
| Token缓存 | `model/token_cache.go` | InitTokenCache(), CacheGetToken() |
| 数据库工具 | `model/utils.go`, `model/model_extra.go` | FixAbility(), 数据辅助函数 |
| 选项配置 | `model/option.go` | 系统配置，GetOption(), UpdateOption() |

## CONVENTIONS

### 模型定义
- **字段命名**: Go 结构体使用 PascalCase，JSON 使用 snake_case
- **GORM 标签**: 所有持久化字段必须有 `gorm` 标签（index, type, default 等）
- **跳过字段**: 使用 `gorm:"-:all"` 跳过数据库保存（如 `User.OriginalPassword`）
- **软删除**: 使用 `gorm.DeletedAt` 实现软删除（如 User, Token）
- **时间字段**: 使用 `int64` 存储时间戳，而非 `time.Time` 类型

### 缓存模式
- **内存缓存**: `*_cache.go` 文件提供内存缓存实现（channel_cache.go, user_cache.go, token_cache.go）
- **并发保护**: 使用 `sync.RWMutex` 保护缓存读写（`channelSyncLock`, `userSyncLock`）
- **缓存同步**: `SyncChannelCache()` 后台定期同步数据库到内存
- **双重检查**: 缓存函数先检查 `common.MemoryCacheEnabled` 标志

### 数据库操作
- **AutoMigrate**: 使用 `DB.AutoMigrate()` 自动迁移，无需手动写 SQL
- **多数据库支持**: MySQL (`SQL_DSN`), PostgreSQL (`postgres://`), SQLite (默认或 `local`)
- **连接池**: `SetMaxIdleConns`, `SetMaxOpenConns`, `SetConnMaxLifetime`
- **日志数据库**: 支持独立日志库（`LOG_SQL_DSN`）

## ANTI-PATTERNS

### 错误用法
- **不要绕过锁保护**: 读写 `channelsIDM`, `group2model2channels` 等全局变量必须加锁
- **不要忽略缓存标志**: 使用缓存函数前必须检查 `common.MemoryCacheEnabled`
- **不要硬编码数据库类型**: 使用 `common.UsingMySQL`, `common.UsingPostgreSQL`, `common.UsingSQLite` 判断
- **不要在生产代码使用 fmt.Println**: 使用 `common.SysLog()` 或 `logger.SysLog()`

### 注意事项
- **渠道选择**: 优先使用 `GetRandomSatisfiedChannel()` 而非直接查询数据库
- **缓存更新**: 修改 Channel/User 后调用 `CacheUpdateChannel()`/`CacheUpdateUser()`
- **时间戳**: 所有时间字段都是 Unix 时间戳（秒级），使用 `time.Now().Unix()`
- **敏感字段**: User 的 `Password`, `VerificationCode`, `OriginalPassword` 不应序列化到 JSON
