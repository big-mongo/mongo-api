package service

import (
	"fmt"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/model"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

type stubFundingSource struct {
	source string
	err    error
}

func (s *stubFundingSource) Source() string       { return s.source }
func (s *stubFundingSource) PreConsume(int) error { return s.err }
func (s *stubFundingSource) Settle(int) error     { return nil }
func (s *stubFundingSource) Refund() error        { return nil }

func TestBillingSessionPreConsumeMapsSubscriptionGroupMismatch(t *testing.T) {
	gin.SetMode(gin.TestMode)
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	session := &BillingSession{
		relayInfo: &relaycommon.RelayInfo{},
		funding: &stubFundingSource{
			source: BillingSourceSubscription,
			err:    model.ErrSubscriptionGroupNotAllowed,
		},
	}

	apiErr := session.preConsume(ctx, 0)
	if apiErr == nil {
		t.Fatal("expected apiErr, got nil")
	}
	if apiErr.GetErrorCode() != types.ErrorCodeInsufficientUserQuota {
		t.Fatalf("expected error code %q, got %q", types.ErrorCodeInsufficientUserQuota, apiErr.GetErrorCode())
	}
	if got := apiErr.Error(); got != "当前令牌分组不可使用该订阅套餐" {
		t.Fatalf("unexpected error message: %q", got)
	}
}

func TestBillingSessionPreConsumeMapsSubscriptionUnavailable(t *testing.T) {
	gin.SetMode(gin.TestMode)
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	session := &BillingSession{
		relayInfo: &relaycommon.RelayInfo{},
		funding: &stubFundingSource{
			source: BillingSourceSubscription,
			err:    model.ErrNoActiveSubscription,
		},
	}

	apiErr := session.preConsume(ctx, 0)
	if apiErr == nil {
		t.Fatal("expected apiErr, got nil")
	}
	if apiErr.GetErrorCode() != types.ErrorCodeInsufficientUserQuota {
		t.Fatalf("expected error code %q, got %q", types.ErrorCodeInsufficientUserQuota, apiErr.GetErrorCode())
	}
}

func TestResolveBillingGroupPrefersContextKeys(t *testing.T) {
	gin.SetMode(gin.TestMode)
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	ctx.Set(string(constant.ContextKeyUserGroup), "user-group")
	ctx.Set(string(constant.ContextKeyTokenGroup), "token-group")
	ctx.Set(string(constant.ContextKeyUsingGroup), "using-group")
	relayInfo := &relaycommon.RelayInfo{
		UsingGroup: "relay-using",
		TokenGroup: "relay-token",
		UserGroup:  "relay-user",
	}

	if got := resolveBillingGroup(ctx, relayInfo); got != "using-group" {
		t.Fatalf("expected context using group, got %q", got)
	}
}

func TestResolveBillingGroupFallsBackInOrder(t *testing.T) {
	tests := []struct {
		name  string
		setup func(*gin.Context, *relaycommon.RelayInfo)
		want  string
	}{
		{
			name: "context token group",
			setup: func(ctx *gin.Context, relayInfo *relaycommon.RelayInfo) {
				ctx.Set(string(constant.ContextKeyTokenGroup), "token-group")
				relayInfo.UsingGroup = "relay-using"
				relayInfo.TokenGroup = "relay-token"
				relayInfo.UserGroup = "relay-user"
			},
			want: "token-group",
		},
		{
			name: "context user group",
			setup: func(ctx *gin.Context, relayInfo *relaycommon.RelayInfo) {
				ctx.Set(string(constant.ContextKeyUserGroup), "user-group")
				relayInfo.UsingGroup = "relay-using"
				relayInfo.TokenGroup = "relay-token"
				relayInfo.UserGroup = "relay-user"
			},
			want: "user-group",
		},
		{
			name: "relay using group",
			setup: func(_ *gin.Context, relayInfo *relaycommon.RelayInfo) {
				relayInfo.UsingGroup = "relay-using"
				relayInfo.TokenGroup = "relay-token"
				relayInfo.UserGroup = "relay-user"
			},
			want: "relay-using",
		},
		{
			name: "relay token group",
			setup: func(_ *gin.Context, relayInfo *relaycommon.RelayInfo) {
				relayInfo.TokenGroup = "relay-token"
				relayInfo.UserGroup = "relay-user"
			},
			want: "relay-token",
		},
		{
			name: "relay user group",
			setup: func(_ *gin.Context, relayInfo *relaycommon.RelayInfo) {
				relayInfo.UserGroup = "relay-user"
			},
			want: "relay-user",
		},
		{
			name: "empty when nothing available",
			setup: func(_ *gin.Context, _ *relaycommon.RelayInfo) {
			},
			want: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gin.SetMode(gin.TestMode)
			ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
			relayInfo := &relaycommon.RelayInfo{}
			tt.setup(ctx, relayInfo)

			if got := resolveBillingGroup(ctx, relayInfo); got != tt.want {
				t.Fatalf("resolveBillingGroup() = %q, want %q", got, tt.want)
			}
		})
	}
}

func setupBillingSessionTestDB(t *testing.T) func() {
	t.Helper()
	oldDB := model.DB
	dbPath := filepath.Join(t.TempDir(), "billing-session-test.db")
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	schema := []string{
		`CREATE TABLE users (
			id integer PRIMARY KEY AUTOINCREMENT,
			username varchar(64) NOT NULL,
			password varchar(255) NOT NULL,
			role integer NOT NULL DEFAULT 1,
			status integer NOT NULL DEFAULT 1,
			"group" varchar(64) DEFAULT 'default',
			quota integer NOT NULL DEFAULT 0,
			deleted_at datetime
		)`,
		`CREATE TABLE subscription_plans (
			id integer PRIMARY KEY AUTOINCREMENT,
			title varchar(128) NOT NULL,
			price_amount decimal(10,6) NOT NULL DEFAULT 0,
			currency varchar(8) NOT NULL DEFAULT 'USD',
			duration_unit varchar(16) NOT NULL DEFAULT 'month',
			duration_value integer NOT NULL DEFAULT 1,
			custom_seconds bigint NOT NULL DEFAULT 0,
			allowed_token_groups varchar(255) DEFAULT '',
			total_amount bigint NOT NULL DEFAULT 0,
			created_at bigint,
			updated_at bigint
		)`,
		`CREATE TABLE user_subscriptions (
			id integer PRIMARY KEY AUTOINCREMENT,
			user_id integer NOT NULL,
			plan_id integer NOT NULL,
			amount_total bigint NOT NULL DEFAULT 0,
			amount_used bigint NOT NULL DEFAULT 0,
			start_time bigint,
			end_time bigint,
			status varchar(32),
			source varchar(32) DEFAULT 'order',
			last_reset_time bigint DEFAULT 0,
			next_reset_time bigint DEFAULT 0,
			upgrade_group varchar(64) DEFAULT '',
			allowed_token_groups varchar(255) DEFAULT '',
			prev_user_group varchar(64) DEFAULT '',
			created_at bigint,
			updated_at bigint
		)`,
		`CREATE TABLE subscription_pre_consume_records (
			id integer PRIMARY KEY AUTOINCREMENT,
			request_id varchar(64) UNIQUE,
			user_id integer NOT NULL,
			user_subscription_id integer NOT NULL,
			pre_consumed bigint NOT NULL DEFAULT 0,
			status varchar(32),
			created_at bigint,
			updated_at bigint
		)`,
	}
	for _, stmt := range schema {
		if err := db.Exec(stmt).Error; err != nil {
			t.Fatalf("migrate sqlite: %v", err)
		}
	}
	model.DB = db
	return func() {
		model.DB = oldDB
	}
}

func createBillingTestUser(t *testing.T, quota int) int {
	t.Helper()
	result := model.DB.Exec(
		`INSERT INTO users (username, password, role, status, "group", quota) VALUES (?, ?, ?, ?, ?, ?)`,
		fmt.Sprintf("tester-%d", quota), "password123", 1, 1, "default", quota,
	)
	if result.Error != nil {
		t.Fatalf("create user: %v", result.Error)
	}
	var userID int
	if err := model.DB.Raw(`SELECT last_insert_rowid()`).Scan(&userID).Error; err != nil {
		t.Fatalf("query user id: %v", err)
	}
	return userID
}

func createBillingTestSubscription(t *testing.T, userId int, allowedGroups string) {
	t.Helper()
	_ = createBillingTestSubscriptionWithPlan(t, userId, "plan", allowedGroups)
}

func newBillingTestContext(group string) *gin.Context {
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	if group != "" {
		ctx.Set("group", group)
	}
	return ctx
}

func newBillingTestRelayInfo(userId int, pref string) *relaycommon.RelayInfo {
	return &relaycommon.RelayInfo{
		RequestId:       fmt.Sprintf("req-test-%d-%s", userId, pref),
		UserId:          userId,
		IsPlayground:    true,
		UserGroup:       "default",
		UsingGroup:      "default",
		TokenGroup:      "default",
		OriginModelName: "gpt-4o-mini",
		UserSetting: dto.UserSetting{
			BillingPreference: pref,
		},
	}
}

func createBillingTestSubscriptionWithPlan(t *testing.T, userId int, title string, allowedGroups string) int {
	t.Helper()
	result := model.DB.Exec(
		`INSERT INTO subscription_plans (title, price_amount, currency, duration_unit, duration_value, custom_seconds, allowed_token_groups, total_amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		title, 10, "USD", model.SubscriptionDurationMonth, 1, 0, allowedGroups, 0, 1, 1,
	)
	if result.Error != nil {
		t.Fatalf("create plan: %v", result.Error)
	}
	var planID int
	if err := model.DB.Raw(`SELECT last_insert_rowid()`).Scan(&planID).Error; err != nil {
		t.Fatalf("query plan id: %v", err)
	}
	model.InvalidateSubscriptionPlanCache(planID)
	result = model.DB.Exec(
		`INSERT INTO user_subscriptions (user_id, plan_id, amount_total, amount_used, start_time, end_time, status, source, last_reset_time, next_reset_time, upgrade_group, allowed_token_groups, prev_user_group, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		userId, planID, 0, 0, 1, 1<<31-1, "active", "order", 0, 0, "", model.NormalizeAllowedTokenGroups(allowedGroups), "", 1, 1,
	)
	if result.Error != nil {
		t.Fatalf("create subscription: %v", result.Error)
	}
	var subID int
	if err := model.DB.Raw(`SELECT last_insert_rowid()`).Scan(&subID).Error; err != nil {
		t.Fatalf("query subscription id: %v", err)
	}
	return subID
}

func TestNewBillingSessionSubscriptionOnlyWithMatchedGroupUsesSubscription(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cleanup := setupBillingSessionTestDB(t)
	defer cleanup()
	userId := createBillingTestUser(t, 0)
	createBillingTestSubscription(t, userId, "vip,enterprise")
	ctx := newBillingTestContext("vip")
	relayInfo := newBillingTestRelayInfo(userId, "subscription_only")

	session, apiErr := NewBillingSession(ctx, relayInfo, 0)
	if apiErr != nil {
		t.Fatalf("unexpected apiErr: %v", apiErr)
	}
	if session == nil || session.funding.Source() != BillingSourceSubscription {
		t.Fatalf("expected subscription funding, got %#v", session)
	}
}

func TestNewBillingSessionSubscriptionOnlyWithMismatchedGroupFails(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cleanup := setupBillingSessionTestDB(t)
	defer cleanup()
	userId := createBillingTestUser(t, 0)
	createBillingTestSubscription(t, userId, "vip,enterprise")
	ctx := newBillingTestContext("default")
	relayInfo := newBillingTestRelayInfo(userId, "subscription_only")

	session, apiErr := NewBillingSession(ctx, relayInfo, 0)
	if session != nil {
		t.Fatalf("expected nil session, got %#v", session)
	}
	if apiErr == nil || apiErr.GetErrorCode() != types.ErrorCodeInsufficientUserQuota {
		t.Fatalf("expected insufficient quota apiErr, got %v", apiErr)
	}
}

func TestNewBillingSessionSubscriptionFirstFallsBackToWalletOnGroupMismatch(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cleanup := setupBillingSessionTestDB(t)
	defer cleanup()
	userId := createBillingTestUser(t, 100)
	createBillingTestSubscription(t, userId, "vip")
	ctx := newBillingTestContext("default")
	relayInfo := newBillingTestRelayInfo(userId, "subscription_first")

	session, apiErr := NewBillingSession(ctx, relayInfo, 0)
	if apiErr != nil {
		t.Fatalf("unexpected apiErr: %v", apiErr)
	}
	if session == nil || session.funding.Source() != BillingSourceWallet {
		t.Fatalf("expected wallet funding, got %#v", session)
	}
}

func TestNewBillingSessionSubscriptionFirstWithMatchedGroupUsesSubscription(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cleanup := setupBillingSessionTestDB(t)
	defer cleanup()
	userId := createBillingTestUser(t, 100)
	createBillingTestSubscription(t, userId, "vip")
	ctx := newBillingTestContext("vip")
	relayInfo := newBillingTestRelayInfo(userId, "subscription_first")

	session, apiErr := NewBillingSession(ctx, relayInfo, 0)
	if apiErr != nil {
		t.Fatalf("unexpected apiErr: %v", apiErr)
	}
	if session == nil || session.funding.Source() != BillingSourceSubscription {
		t.Fatalf("expected subscription funding, got %#v", session)
	}
}

func TestNewBillingSessionSubscriptionFirstFailsWhenWalletAlsoInsufficient(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cleanup := setupBillingSessionTestDB(t)
	defer cleanup()
	userId := createBillingTestUser(t, 0)
	createBillingTestSubscription(t, userId, "vip")
	ctx := newBillingTestContext("default")
	relayInfo := newBillingTestRelayInfo(userId, "subscription_first")

	session, apiErr := NewBillingSession(ctx, relayInfo, 0)
	if session != nil {
		t.Fatalf("expected nil session, got %#v", session)
	}
	if apiErr == nil || apiErr.GetErrorCode() != types.ErrorCodeInsufficientUserQuota {
		t.Fatalf("expected insufficient quota apiErr, got %v", apiErr)
	}
}

func TestNewBillingSessionWalletFirstFallsBackToSubscriptionOnWalletInsufficientAndGroupMatch(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cleanup := setupBillingSessionTestDB(t)
	defer cleanup()
	userId := createBillingTestUser(t, 0)
	createBillingTestSubscription(t, userId, "vip")
	ctx := newBillingTestContext("vip")
	relayInfo := newBillingTestRelayInfo(userId, "wallet_first")

	session, apiErr := NewBillingSession(ctx, relayInfo, 0)
	if apiErr != nil {
		t.Fatalf("unexpected apiErr: %v", apiErr)
	}
	if session == nil || session.funding.Source() != BillingSourceSubscription {
		t.Fatalf("expected subscription funding, got %#v", session)
	}
}

func TestNewBillingSessionWalletFirstUsesWalletWhenWalletSufficient(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cleanup := setupBillingSessionTestDB(t)
	defer cleanup()
	userId := createBillingTestUser(t, 100)
	createBillingTestSubscription(t, userId, "vip")
	ctx := newBillingTestContext("vip")
	relayInfo := newBillingTestRelayInfo(userId, "wallet_first")

	session, apiErr := NewBillingSession(ctx, relayInfo, 0)
	if apiErr != nil {
		t.Fatalf("unexpected apiErr: %v", apiErr)
	}
	if session == nil || session.funding.Source() != BillingSourceWallet {
		t.Fatalf("expected wallet funding, got %#v", session)
	}
}

func TestNewBillingSessionWalletFirstFailsWhenWalletInsufficientAndGroupMismatch(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cleanup := setupBillingSessionTestDB(t)
	defer cleanup()
	userId := createBillingTestUser(t, 0)
	createBillingTestSubscription(t, userId, "vip")
	ctx := newBillingTestContext("default")
	relayInfo := newBillingTestRelayInfo(userId, "wallet_first")

	session, apiErr := NewBillingSession(ctx, relayInfo, 0)
	if session != nil {
		t.Fatalf("expected nil session, got %#v", session)
	}
	if apiErr == nil || apiErr.GetErrorCode() != types.ErrorCodeInsufficientUserQuota {
		t.Fatalf("expected insufficient quota apiErr, got %v", apiErr)
	}
}

func TestNewBillingSessionWalletOnlyUsesWallet(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cleanup := setupBillingSessionTestDB(t)
	defer cleanup()
	userId := createBillingTestUser(t, 100)
	createBillingTestSubscription(t, userId, "vip")
	ctx := newBillingTestContext("vip")
	relayInfo := newBillingTestRelayInfo(userId, "wallet_only")

	session, apiErr := NewBillingSession(ctx, relayInfo, 0)
	if apiErr != nil {
		t.Fatalf("unexpected apiErr: %v", apiErr)
	}
	if session == nil || session.funding.Source() != BillingSourceWallet {
		t.Fatalf("expected wallet funding, got %#v", session)
	}
}

func TestNewBillingSessionWalletOnlyFailsWhenWalletInsufficient(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cleanup := setupBillingSessionTestDB(t)
	defer cleanup()
	userId := createBillingTestUser(t, 0)
	createBillingTestSubscription(t, userId, "vip")
	ctx := newBillingTestContext("vip")
	relayInfo := newBillingTestRelayInfo(userId, "wallet_only")

	session, apiErr := NewBillingSession(ctx, relayInfo, 0)
	if session != nil {
		t.Fatalf("expected nil session, got %#v", session)
	}
	if apiErr == nil || apiErr.GetErrorCode() != types.ErrorCodeInsufficientUserQuota {
		t.Fatalf("expected insufficient quota apiErr, got %v", apiErr)
	}
}

func TestNewBillingSessionSelectsMatchedSubscriptionAmongMultipleActiveSubscriptions(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cleanup := setupBillingSessionTestDB(t)
	defer cleanup()
	userId := createBillingTestUser(t, 0)
	createBillingTestSubscriptionWithPlan(t, userId, "default-plan", "default")
	matchedSubID := createBillingTestSubscriptionWithPlan(t, userId, "vip-plan", "vip")
	ctx := newBillingTestContext("vip")
	relayInfo := newBillingTestRelayInfo(userId, "subscription_only")

	session, apiErr := NewBillingSession(ctx, relayInfo, 0)
	if apiErr != nil {
		t.Fatalf("unexpected apiErr: %v", apiErr)
	}
	if session == nil || session.funding.Source() != BillingSourceSubscription {
		t.Fatalf("expected subscription funding, got %#v", session)
	}
	if relayInfo.SubscriptionId != matchedSubID {
		t.Fatalf("expected matched subscription %d, got %d", matchedSubID, relayInfo.SubscriptionId)
	}
	if relayInfo.SubscriptionPlanTitle != "vip-plan" {
		t.Fatalf("expected matched plan title %q, got %q", "vip-plan", relayInfo.SubscriptionPlanTitle)
	}
}
