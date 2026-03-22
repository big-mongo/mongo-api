# 订阅套餐（CodePlan）分组生效与计费设计文档

## 目录

1. [背景与目标](#背景与目标)
2. [用户最新需求定义](#用户最新需求定义)
3. [当前实现现状](#当前实现现状)
4. [核心概念与分组口径](#核心概念与分组口径)
5. [目标行为矩阵](#目标行为矩阵)
6. [改造方案](#改造方案)
7. [涉及代码](#涉及代码)
8. [兼容性与边界条件](#兼容性与边界条件)
9. [实施建议](#实施建议)

---

## 背景与目标

本文档基于当前项目实现，重新梳理“订阅套餐 / CodePlan 的分组生效规则”和“订阅抵扣与扣款偏好的联动逻辑”。

当前项目已经支持：
- 订阅套餐购买
- 订阅额度抵扣
- 订阅升级用户分组（`UpgradeGroup`）
- 扣款偏好（`subscription_only` / `subscription_first` / `wallet_first` / `wallet_only`）

但当前项目还不支持：
- 让某个订阅套餐只对指定令牌分组生效
- 让“是否允许本次请求走订阅抵扣”与“当前请求使用的 key 分组”挂钩

本次文档的目标，是把需求重新定义为一个更准确、可落地的版本：

> 某个 CodePlan 可以配置“允许生效的令牌分组”。
> 当用户拥有这个 CodePlan 对应的有效订阅时，只有当本次请求使用的 key 所属分组命中该 CodePlan 允许的分组时，这个订阅才可用于本次调用，并参与订阅抵扣。
> 是否最终允许调用，还要和用户的扣款偏好联动。

---

## 用户最新需求定义

根据最新补充，需求不是“订阅额度只能给某个用户分组使用”，而是：

### 1. CodePlan 需要支持配置“哪些分组可以生效”

这里的“分组”指的是：
- 请求使用的 key 所属分组
- 也就是运行时与 `Token.Group` / 请求分组相关的口径
- 不是 `User.Group`

### 2. 只有命中 CodePlan 指定分组的 key，才能让该订阅生效

“生效”包含两层含义：
- 该订阅可以作为本次请求的订阅资金来源
- 本次请求可以对该订阅进行额度抵扣

### 3. 是否允许调用，要和扣款偏好联动

举例：
- **仅用订阅 (`subscription_only`)**：如果当前 key 的分组不在该 CodePlan 允许范围内，则这次调用应直接拒绝，因为没有其他资金来源可用
- **优先订阅 (`subscription_first`)**：如果当前 key 分组命中 CodePlan，则优先用订阅；如果未命中，则可以回退到钱包（前提是钱包额度足够）
- **优先钱包 (`wallet_first`)**：优先用钱包；钱包不足时，只有当前 key 分组命中 CodePlan，才允许回退到订阅
- **仅用钱包 (`wallet_only`)**：完全不使用订阅，此时 CodePlan 分组限制不参与本次扣费决策

### 4. `UpgradeGroup` 与本需求是两套独立能力

- `UpgradeGroup`：购买订阅后，把用户本身升级到某个用户分组
- 本需求：限制该订阅只对某些令牌分组 / 请求分组生效

二者可以同时存在，但语义不同，不能混为一谈。

---

## 当前实现现状

### 3.1 当前计费入口

请求进入 `controller/relay.go` 后，会先完成以下步骤：

1. 构建 `RelayInfo`
2. 计算预扣额度
3. 调用 `service.PreConsumeBilling()` 创建计费会话并预扣费
4. 后续才真正进行渠道选择和转发

相关文件：
- `controller/relay.go`
- `service/billing.go`
- `service/billing_session.go`

### 3.2 当前订阅抵扣逻辑

当前订阅抵扣核心在：
- `service/funding_source.go` 中的 `SubscriptionFunding.PreConsume()`
- `model/subscription.go` 中的 `PreConsumeUserSubscription()`

当前逻辑只做这些判断：
- 用户是否存在有效订阅
- 订阅额度是否足够
- 订阅是否可被成功预扣

当前没有做这些判断：
- 当前请求使用的 key 分组是否允许该订阅生效
- 当前请求是否应该允许该 CodePlan 参与订阅抵扣

### 3.3 当前扣款偏好逻辑

`service/billing_session.go` 里的 `NewBillingSession()` 已经支持四种偏好：

- `subscription_only`
- `subscription_first`
- `wallet_first`
- `wallet_only`

并且当前回退逻辑是：
- `subscription_first`：订阅失败且错误码为 `insufficient_user_quota` 时，回退钱包
- `wallet_first`：钱包失败且错误码为 `insufficient_user_quota` 时，回退订阅
- `subscription_only`：不回退
- `wallet_only`：不回退

这意味着：

> 如果未来新增“当前 key 分组不允许该订阅生效”这个错误，必须保证它仍然能被 billing session 当成“可回退的订阅不可用错误”处理。

否则会把原本应该 fallback 的请求直接打成 500 或直接失败。

---

## 核心概念与分组口径

这是本需求里最重要的部分。

### 4.1 项目里有三种容易混淆的“分组”

| 名称 | 代码位置 | 含义 | 是否用于本需求 |
|---|---|---|---|
| 用户分组 | `User.Group` | 决定用户权限、倍率、可用模型 | 否 |
| 令牌分组 | `Token.Group` | key 自身归属的分组 | 是，主来源 |
| 请求使用分组 | `ContextKeyUsingGroup` / `relayInfo.UsingGroup` | 本次请求运行时使用的分组，会先按 key 解析，也可能被 playground 覆盖，后续 auto 场景还可能变化 | 是，但要在计费开始时冻结快照 |

### 4.2 本需求采用的判定口径

本需求不建议直接绑定“最终路由分组”，而是建议定义一个单独的运行时概念：

> **billingGroup = 计费开始时冻结的请求分组快照**

建议取值顺序：

1. `ContextKeyUsingGroup`
2. 若为空，则退回 `ContextKeyTokenGroup`
3. 若仍为空，则退回 `ContextKeyUserGroup`

这个 `billingGroup` 的语义是：
- 用于判断当前 CodePlan 是否对本次请求生效
- 在创建 `BillingSession` 时就确定下来
- 后续不再跟随 auto group / 渠道选择结果继续变化

### 4.3 为什么不直接用 `User.Group`

因为你的需求不是：
- “某种订阅只能给某类用户用”

而是：
- “用户有这个订阅时，只有用指定分组的 key 才让这个订阅生效”

所以这里应该看的是 Token / 请求分组，不是用户本身分组。

### 4.4 为什么不直接依赖“最终渠道选中的组”

因为当前代码里：
- 订阅预扣发生在渠道真正选中之前
- `relayInfo.UsingGroup` 在后续 auto group / 选路过程中可能被改写

如果把 CodePlan 生效逻辑绑定到“最终渠道组”：
- 会出现“先预扣、后变组”的时序问题
- 容易导致计费口径和最终路由口径不一致

所以 V1 建议：
- CodePlan 生效判断只看 `billingGroup`
- 不看后续渠道真正落到哪个组

### 4.5 `auto` 分组的处理建议

当前系统中存在 `auto` 分组和跨组路由能力。由于：
- 计费预扣发生在渠道最终选定之前
- `relayInfo.UsingGroup` 可能在后续才变成最终组

因此 V1 建议：
- 如果某个 CodePlan 配置了“允许生效分组”
- 且当前 `billingGroup == "auto"`
- 则默认不认为命中该 CodePlan 的生效分组

也就是说：
- 受限 CodePlan 不支持 `auto` 分组 key 直接参与订阅抵扣
- 若后续要支持 `auto`，需要单独设计“计费判定口径”和“最终路由组口径”的关系

---

## 目标行为矩阵

以下行为矩阵，是本次需求应当在文档中明确的核心规则。

### 5.1 术语定义

- **命中 CodePlan 分组**：当前 `billingGroup` 在该订阅允许生效的分组列表中
- **订阅可用**：存在有效订阅，且当前分组命中，且额度足够
- **订阅不可用**：不存在有效订阅 / 分组未命中 / 额度不足

### 5.2 计费偏好行为矩阵

| 扣款偏好 | 当前请求分组命中 CodePlan | 钱包是否充足 | 结果 |
|---|---|---|---|
| `subscription_only` | 是 | 无关 | 允许调用，走订阅抵扣 |
| `subscription_only` | 否 | 无关 | 拒绝调用，返回“当前令牌分组不可使用该订阅套餐” |
| `subscription_first` | 是 | 无关 | 优先走订阅抵扣 |
| `subscription_first` | 否 | 是 | 回退钱包，允许调用 |
| `subscription_first` | 否 | 否 | 拒绝调用 |
| `wallet_first` | 是 | 是 | 优先走钱包 |
| `wallet_first` | 是 | 否 | 回退订阅，允许调用 |
| `wallet_first` | 否 | 是 | 走钱包，允许调用 |
| `wallet_first` | 否 | 否 | 拒绝调用 |
| `wallet_only` | 是/否 | 是 | 只走钱包，允许调用 |
| `wallet_only` | 是/否 | 否 | 拒绝调用 |

### 5.3 关键解释

#### `subscription_only`

这是你特别强调的场景：

> 仅用订阅时，需要当前令牌的令牌分组被该 CodePlan 指定，才允许调用。

也就是说：
- 只要订阅因“分组未命中”而不可用
- 这次调用就必须被拒绝
- 不能回退钱包

#### `subscription_first`

该偏好下，“分组未命中”应被视为：
- 当前订阅资金来源不可用
- 但不是系统错误
- 可以回退钱包

#### `wallet_first`

该偏好下，即使当前请求分组命中 CodePlan：
- 如果钱包足够，仍应优先走钱包
- 只有钱包不足时，才检查订阅是否可用

#### `wallet_only`

该偏好下：
- 本次请求不使用订阅
- 因此 CodePlan 分组限制不参与本次资金来源选择

---

## 改造方案

### 6.1 数据模型改造

相比旧方案，这里不再使用 `QuotaGroupMode` 之类的黑白名单模式，而是收敛为更直接的能力：

> CodePlan 显式配置“允许生效的令牌分组列表”

建议字段名：

### `SubscriptionPlan`

**文件**: `model/subscription.go`

```go
type SubscriptionPlan struct {
    // 现有字段
    UpgradeGroup string `json:"upgrade_group" gorm:"type:varchar(64);default:''"`

    // 新增：该 CodePlan 允许生效的令牌分组，逗号分隔
    // 空字符串表示不限制，保持兼容老行为
    AllowedTokenGroups string `json:"allowed_token_groups" gorm:"type:varchar(255);default:''"`
}
```

### `UserSubscription`

建议同步快照到 `UserSubscription`：

```go
type UserSubscription struct {
    // 现有字段
    UpgradeGroup string `json:"upgrade_group" gorm:"type:varchar(64);default:''"`

    // 新增：从 plan 复制下来的生效分组快照
    AllowedTokenGroups string `json:"allowed_token_groups" gorm:"type:varchar(255);default:''"`
}
```

这样做的好处是：
- 用户购买时把规则固化到订阅实例
- 后续管理员修改 plan，不会直接影响历史已购订阅的生效口径
- 与当前 `UpgradeGroup` 的快照思路一致

### 6.2 创建订阅时复制快照

**文件**: `model/subscription.go`

在 `CreateUserSubscriptionFromPlanTx()` 中，除现有字段外，新增：

```go
sub := &UserSubscription{
    UserId:             userId,
    PlanId:             plan.Id,
    UpgradeGroup:       upgradeGroup,
    PrevUserGroup:      prevGroup,
    AllowedTokenGroups: normalizeAllowedTokenGroups(plan.AllowedTokenGroups),
}
```

### 6.3 订阅预扣时增加“分组命中”判断

**文件**: `model/subscription.go`

建议把：

```go
func PreConsumeUserSubscription(requestId string, userId int, modelName string, quotaType int, amount int64)
```

改为：

```go
func PreConsumeUserSubscription(
    requestId string,
    userId int,
    modelName string,
    quotaType int,
    amount int64,
    billingGroup string,
)
```

其中 `billingGroup` 表示：
- 本次用于判断 CodePlan 是否生效的请求分组
- 在计费 session 创建时就被冻结

新增判断逻辑：

1. 遍历用户有效订阅
2. 先判断该订阅是否允许当前 `billingGroup`
3. 若不允许，则跳过这个订阅
4. 若允许，再继续判断额度是否足够
5. 命中后完成预扣

伪代码：

```go
for _, sub := range subs {
    if !isSubscriptionAllowedForTokenGroup(&sub, billingGroup) {
        continue
    }

    if sub.AmountTotal > 0 {
        remain := sub.AmountTotal - sub.AmountUsed
        if remain < amount {
            continue
        }
    }

    // 命中，执行预扣
}
```

### 6.4 BillingSession 传递冻结后的 `billingGroup`

旧文档里建议直接传 `relayInfo.UsingGroup`，这不够准确。

新方案建议：
- 在 `NewBillingSession()` 开始时，从 context 读取当前请求分组
- 生成一个冻结后的 `billingGroup`
- 将该值传入 `SubscriptionFunding`
- 后续不再依赖会被 auto 逻辑改写的 `relayInfo.UsingGroup`

示意：

```go
func resolveBillingGroup(c *gin.Context, relayInfo *relaycommon.RelayInfo) string {
    group := common.GetContextKeyString(c, constant.ContextKeyUsingGroup)
    if group != "" {
        return group
    }
    if relayInfo != nil && relayInfo.TokenGroup != "" {
        return relayInfo.TokenGroup
    }
    if relayInfo != nil {
        return relayInfo.UserGroup
    }
    return ""
}
```

```go
type SubscriptionFunding struct {
    requestId      string
    userId         int
    modelName      string
    amount         int64
    billingGroup   string
    subscriptionId int
    preConsumed    int64
}
```

```go
billingGroup := resolveBillingGroup(c, relayInfo)

funding: &SubscriptionFunding{
    requestId:    relayInfo.RequestId,
    userId:       relayInfo.UserId,
    modelName:    relayInfo.OriginModelName,
    amount:       subConsume,
    billingGroup: billingGroup,
}
```

然后在：

```go
model.PreConsumeUserSubscription(..., s.billingGroup)
```

### 6.5 错误契约与回退规则

这是实现中最不能漏的一部分。

当前 `service/billing_session.go` 里：
- 只有被映射成 `types.ErrorCodeInsufficientUserQuota` 的错误
- 才会触发 `subscription_first` / `wallet_first` 的资金来源回退

因此新方案必须满足：

#### 规则 1：分组未命中不能被当成 500 系统错误

它本质上是：
- 当前订阅资金来源不适用
- 不是数据库错误
- 不是程序异常

#### 规则 2：对 fallback 场景，它必须被视为“订阅不可用”

也就是说：
- `subscription_first` 遇到“分组未命中”时，应允许回退钱包
- `wallet_first` 在钱包不足时，若订阅也因“分组未命中”不可用，则整体失败
- `subscription_only` 遇到“分组未命中”时，应直接拒绝

#### 规则 3：建议引入明确的哨兵错误

建议新增：

```go
var ErrSubscriptionGroupNotAllowed = errors.New("subscription group not allowed")
```

并在 `billing_session.go` 中，把它与：
- `no active subscription`
- `subscription quota insufficient`

统一视为“订阅不可用”的可控业务错误，再映射为：
- `types.ErrorCodeInsufficientUserQuota`
- 或单独的新错误码，但必须保留 fallback 能力

#### 推荐落地方式

- model 层返回哨兵错误 `ErrSubscriptionGroupNotAllowed`
- service 层用 `errors.Is(err, ErrSubscriptionGroupNotAllowed)` 判断
- 在 `subscription_only` 场景下，仍返回明确文案：`当前令牌分组不可使用该订阅套餐`
- 在 `subscription_first` / `wallet_first` 场景下，把它纳入“可回退错误”集合

### 6.6 后台配置与展示改造

这部分不是“可选”，而是必须改。

#### 管理后台表单

**文件**: `web/src/components/table/subscriptions/modals/AddEditSubscriptionModal.jsx`

需要新增：
- `allowed_token_groups` 字段
- 建议使用多选组件，数据源可复用当前已有的 group 列表接口

同时需要修改：
- `getInitValues()`
- `buildFormValues()`
- submit payload

#### 管理后台列表展示

**文件**: `web/src/components/table/subscriptions/SubscriptionsColumnDefs.jsx`

需要新增：
- 在套餐详情 popover 中展示“生效令牌分组”
- 便于管理员确认配置

#### 用户购买展示

**文件**:
- `web/src/components/topup/SubscriptionPlansCard.jsx`
- `web/src/components/topup/modals/SubscriptionPurchaseModal.jsx`

建议展示：
- “本套餐仅对以下 key 分组生效：xxx”

这样用户才知道：
- 不是买了订阅就对所有 key 生效
- 必须使用命中的分组 key，订阅才会参与抵扣

### 6.7 控制器与持久化改造

**文件**: `controller/subscription.go`

新增字段后，需要同步修改：

1. `AdminCreateSubscriptionPlan()`
   - 新增 `allowed_token_groups` 校验
2. `AdminUpdateSubscriptionPlan()`
   - 必须把 `allowed_token_groups` 写入 `updateMap`

这里如果漏掉 `updateMap`：
- 创建时可能生效
- 更新时字段不会落库

### 6.8 SQLite 迁移不能漏

**文件**: `model/main.go`

当前 SQLite 的 `subscription_plans` 迁移不是纯 `AutoMigrate`，还包含：
- `ensureSubscriptionPlanTableSQLite()` 里的建表 SQL
- `required` 列定义列表

所以新增 `allowed_token_groups` 时，必须同步修改：
- 初始建表 SQL
- 缺列补齐逻辑

否则 SQLite 环境会缺字段。

---

## 涉及代码

### 7.1 计费与订阅核心链路

| 文件 | 作用 |
|---|---|
| `controller/relay.go` | 请求入口，触发预扣费 |
| `service/billing.go` | 统一计费入口与结算 |
| `service/billing_session.go` | 计费偏好、预扣、回退逻辑 |
| `service/funding_source.go` | 钱包/订阅资金来源实现 |
| `model/subscription.go` | 订阅模型、创建、预扣、退款 |

### 7.2 分组相关链路

| 文件 | 作用 |
|---|---|
| `middleware/auth.go` | 设置 token group / using group |
| `middleware/distributor.go` | playground / 分组相关请求处理 |
| `relay/common/relay_info.go` | `RelayInfo.TokenGroup` / `RelayInfo.UsingGroup` 组装 |
| `service/channel_select.go` | 渠道选择、auto group 路由 |

### 7.3 后台与前端

| 文件 | 作用 |
|---|---|
| `controller/subscription.go` | 订阅套餐创建、更新、列表接口 |
| `web/src/components/table/subscriptions/modals/AddEditSubscriptionModal.jsx` | 套餐创建/编辑表单 |
| `web/src/components/table/subscriptions/SubscriptionsColumnDefs.jsx` | 套餐列表详情展示 |
| `web/src/components/topup/SubscriptionPlansCard.jsx` | 用户购买页套餐卡片 |
| `web/src/components/topup/modals/SubscriptionPurchaseModal.jsx` | 购买确认弹窗 |
| `model/main.go` | SQLite 订阅表迁移 |

---

## 兼容性与边界条件

### 8.1 向后兼容

建议约定：
- `allowed_token_groups == ""` 表示“不限制”
- 老套餐默认保持原行为
- 不需要额外数据迁移

### 8.2 `UpgradeGroup` 与生效分组可同时存在

例如：
- 套餐购买后把用户升级到 `vip`
- 但该套餐只允许 `vip-key`、`enterprise-key` 这两类 key 生效

这是允许的。

### 8.3 `auto` 分组建议先不支持

为了避免计费时序不一致，V1 建议：
- 配置型受限 CodePlan 不支持 `auto` 分组命中
- 若请求使用 `auto` key，则视为该订阅不命中

### 8.4 多个有效订阅并存

当前系统支持多个有效订阅并存。

因此运行时应按以下顺序找可用订阅：

1. 有效期内
2. 当前 `billingGroup` 命中订阅允许分组
3. 额度足够
4. 找到第一个满足条件的订阅进行预扣

这意味着：
- 用户可以同时拥有多个 CodePlan
- 其中只有部分 CodePlan 对当前 key 分组生效

### 8.5 错误提示建议

建议对外暴露两类明确文案：

- `subscription_only` 下：
  - `当前令牌分组不可使用该订阅套餐`
- fallback 场景下最终钱包也不可用时：
  - `当前请求既无法使用订阅，也没有足够钱包额度`

---

## 对接步骤清单

后续我们按下面的步骤一个一个对接。

约定：
- `[ ]` 表示未开始 / 未确认
- `[x]` 表示该步骤已经对接通过
- 每完成一步，就直接在本文档里把对应步骤打叉

### Step 1 - 模型字段与数据库迁移

- [x] Step 1.1 在 `SubscriptionPlan` 增加 `AllowedTokenGroups`
- [x] Step 1.2 在 `UserSubscription` 增加 `AllowedTokenGroups`
- [x] Step 1.3 在 `CreateUserSubscriptionFromPlanTx()` 中复制该字段快照
- [x] Step 1.4 补齐 `model/main.go` 中 SQLite 的建表 SQL 与缺列补齐逻辑

**通过标准**：
- 新字段可以在三种数据库下正常落库
- `AllowedTokenGroups` 支持多个分组，采用逗号分隔的快照格式存储
- 老数据不受影响
- 空值保持“无限制”语义

### Step 2 - 后台套餐配置与持久化

- [x] Step 2.1 后端 `controller/subscription.go` 增加 `allowed_token_groups` 的创建校验
- [x] Step 2.2 后端 `controller/subscription.go` 的 `updateMap` 增加 `allowed_token_groups`
- [x] Step 2.3 后台表单 `web/src/components/table/subscriptions/modals/AddEditSubscriptionModal.jsx` 增加配置项
- [x] Step 2.4 后台列表详情 `web/src/components/table/subscriptions/SubscriptionsColumnDefs.jsx` 增加展示项

**通过标准**：
- 管理员可以创建、编辑、查看 CodePlan 的生效分组
- 更新套餐时字段不会丢失

### Step 3 - 冻结计费分组 `billingGroup`

- [x] Step 3.1 在 `BillingSession` 创建时引入 `billingGroup` 概念
- [x] Step 3.2 明确 `billingGroup` 的取值顺序：`ContextKeyUsingGroup -> ContextKeyTokenGroup -> ContextKeyUserGroup`
- [x] Step 3.3 在 `SubscriptionFunding` 中传递冻结后的 `billingGroup`
- [x] Step 3.4 不再把 CodePlan 生效判断直接绑定到后续可能变化的最终路由分组

**通过标准**：
- 订阅是否生效的判定，在预扣开始时就固定
- 不受后续 auto group / 渠道选择结果改写影响

### Step 4 - 订阅预扣分组命中判断

- [x] Step 4.1 修改 `PreConsumeUserSubscription()` 入参，接收 `billingGroup`
- [x] Step 4.2 增加 `isSubscriptionAllowedForTokenGroup()` 判断逻辑
- [x] Step 4.3 订阅选择顺序变为：有效期 -> 分组命中 -> 额度足够 -> 预扣
- [x] Step 4.4 多个有效订阅并存时，能正确选择命中的那一个订阅

**通过标准**：
- 只有命中 CodePlan 生效分组的请求，才能使用对应订阅抵扣
- 分组不命中的订阅不会被错误预扣

### Step 5 - 扣款偏好联动与错误契约

- [x] Step 5.1 引入 `ErrSubscriptionGroupNotAllowed` 或等价哨兵错误
- [x] Step 5.2 把“分组不命中”纳入 `subscription_first` / `wallet_first` 的可回退错误集合
- [x] Step 5.3 明确 `subscription_only` 下分组不命中直接拒绝调用
- [x] Step 5.4 明确 `wallet_only` 下完全不走订阅逻辑
- [x] Step 5.5 对外错误文案区分“订阅不可用”和“系统错误”

**通过标准**：
- 四种扣款偏好的行为与本文档矩阵一致
- 不会因为分组不命中而误报 500

### Step 6 - 用户侧展示

- [x] Step 6.1 在 `web/src/components/topup/SubscriptionPlansCard.jsx` 展示“本套餐仅对哪些 key 分组生效”
- [x] Step 6.2 在 `web/src/components/topup/modals/SubscriptionPurchaseModal.jsx` 展示相同信息
- [x] Step 6.3 文案让用户能理解“买了订阅不代表所有 key 都能用”

**通过标准**：
- 用户在购买前就能看到该 CodePlan 的生效分组限制
- 降低购买后因 key 分组不匹配带来的误解

### Step 7 - 测试与验收

- [x] Step 7.1 `subscription_only` + 分组命中 -> 成功
- [x] Step 7.2 `subscription_only` + 分组不命中 -> 拒绝
- [x] Step 7.3 `subscription_first` + 分组不命中 + 钱包足够 -> 回退钱包成功
- [x] Step 7.4 `wallet_first` + 钱包不足 + 分组命中 -> 回退订阅成功
- [x] Step 7.5 `wallet_first` + 钱包不足 + 分组不命中 -> 失败
- [x] Step 7.6 `wallet_only` + 有订阅但钱包足够 -> 只走钱包
- [x] Step 7.7 多个有效订阅并存，只有其中一个分组命中 -> 命中正确订阅
- [x] Step 7.8 SQLite 新增字段迁移成功

**通过标准**：
- 关键路径都有自动化验证
- 行为和本文档中的规则矩阵一致

---

## 总结

本次需求的最终定义是：

1. 限制对象不是用户分组，而是请求使用的 key 分组 / 计费分组
2. CodePlan 是否生效，取决于当前请求的 `billingGroup` 是否命中套餐允许分组
3. 是否最终允许调用，要与扣款偏好联合判断
4. `subscription_only` 是最严格场景：当前 key 分组未命中时，应直接拒绝调用
5. 本次方案应采用 `AllowedTokenGroups + billingGroup`，不再沿用旧文档中的 `QuotaGroupMode` 思路

如果后续还要扩展到：
- `auto` 分组精细支持
- 基于最终路由分组计费
- 同一请求按最终命中渠道组决定订阅抵扣

则建议单独再开一版设计，不和本次需求混在一起。
