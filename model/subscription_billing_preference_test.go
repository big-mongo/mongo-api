package model

import (
	"path/filepath"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func setupSubscriptionBillingPreferenceTestDB(t *testing.T) {
	t.Helper()
	oldDB := DB
	oldLogDB := LOG_DB
	oldUsingSQLite := common.UsingSQLite
	oldUsingMySQL := common.UsingMySQL
	oldUsingPostgreSQL := common.UsingPostgreSQL
	oldRedisEnabled := common.RedisEnabled
	t.Cleanup(func() {
		DB = oldDB
		LOG_DB = oldLogDB
		common.UsingSQLite = oldUsingSQLite
		common.UsingMySQL = oldUsingMySQL
		common.UsingPostgreSQL = oldUsingPostgreSQL
		common.RedisEnabled = oldRedisEnabled
	})

	common.UsingSQLite = true
	common.UsingMySQL = false
	common.UsingPostgreSQL = false
	common.RedisEnabled = false

	dbPath := filepath.Join(t.TempDir(), "subscription-billing-pref.db")
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	DB = db
	LOG_DB = db

	if err := db.AutoMigrate(&User{}, &SubscriptionPlan{}, &SubscriptionOrder{}, &UserSubscription{}, &SubscriptionPreConsumeRecord{}, &TopUp{}, &Log{}); err != nil {
		t.Fatalf("auto migrate: %v", err)
	}
}

func seedSubscriptionOrderScenario(t *testing.T, billingPreference string) (*User, *SubscriptionPlan, *SubscriptionOrder) {
	t.Helper()
	user := &User{
		Username: "pref-user-" + billingPreference,
		Password: "password123",
		Role:     1,
		Status:   1,
		Group:    "default",
		Quota:    0,
	}
	if billingPreference != "" {
		setting := dto.UserSetting{BillingPreference: billingPreference}
		user.SetSetting(setting)
	}
	if err := DB.Create(user).Error; err != nil {
		t.Fatalf("create user: %v", err)
	}

	plan := &SubscriptionPlan{
		Title:              "plan",
		PriceAmount:        10,
		Currency:           "USD",
		DurationUnit:       SubscriptionDurationMonth,
		DurationValue:      1,
		AllowedTokenGroups: "vip,enterprise",
		Enabled:            true,
	}
	if err := DB.Create(plan).Error; err != nil {
		t.Fatalf("create plan: %v", err)
	}
	InvalidateSubscriptionPlanCache(plan.Id)

	order := &SubscriptionOrder{
		UserId:        user.Id,
		PlanId:        plan.Id,
		Money:         10,
		TradeNo:       "trade-" + billingPreference,
		PaymentMethod: "stripe",
		Status:        common.TopUpStatusPending,
		CreateTime:    common.GetTimestamp(),
	}
	if err := DB.Create(order).Error; err != nil {
		t.Fatalf("create order: %v", err)
	}
	return user, plan, order
}

func TestCompleteSubscriptionOrderSetsDefaultSubscriptionFirstWhenPreferenceEmpty(t *testing.T) {
	setupSubscriptionBillingPreferenceTestDB(t)
	user, _, order := seedSubscriptionOrderScenario(t, "")

	if err := CompleteSubscriptionOrder(order.TradeNo, "payload"); err != nil {
		t.Fatalf("complete subscription order: %v", err)
	}

	updatedUser, err := GetUserById(user.Id, false)
	if err != nil {
		t.Fatalf("get user: %v", err)
	}
	if got := updatedUser.GetSetting().BillingPreference; got != "subscription_first" {
		t.Fatalf("expected billing preference subscription_first, got %q", got)
	}

	var sub UserSubscription
	if err := DB.Where("user_id = ?", user.Id).First(&sub).Error; err != nil {
		t.Fatalf("query user subscription: %v", err)
	}
	if sub.AllowedTokenGroups != "vip,enterprise" {
		t.Fatalf("expected allowed token groups snapshot, got %q", sub.AllowedTokenGroups)
	}
}

func TestCompleteSubscriptionOrderDoesNotOverrideExistingBillingPreference(t *testing.T) {
	setupSubscriptionBillingPreferenceTestDB(t)
	user, _, order := seedSubscriptionOrderScenario(t, "wallet_first")

	if err := CompleteSubscriptionOrder(order.TradeNo, "payload"); err != nil {
		t.Fatalf("complete subscription order: %v", err)
	}

	updatedUser, err := GetUserById(user.Id, false)
	if err != nil {
		t.Fatalf("get user: %v", err)
	}
	if got := updatedUser.GetSetting().BillingPreference; got != "wallet_first" {
		t.Fatalf("expected billing preference wallet_first, got %q", got)
	}
}

func TestAdminBindSubscriptionSetsDefaultSubscriptionFirstWhenPreferenceEmpty(t *testing.T) {
	setupSubscriptionBillingPreferenceTestDB(t)
	user, plan, _ := seedSubscriptionOrderScenario(t, "")

	if _, err := AdminBindSubscription(user.Id, plan.Id, "manual"); err != nil {
		t.Fatalf("admin bind subscription: %v", err)
	}

	updatedUser, err := GetUserById(user.Id, false)
	if err != nil {
		t.Fatalf("get user: %v", err)
	}
	if got := updatedUser.GetSetting().BillingPreference; got != "subscription_first" {
		t.Fatalf("expected billing preference subscription_first, got %q", got)
	}
}

func TestAdminBindSubscriptionDoesNotOverrideExistingBillingPreference(t *testing.T) {
	setupSubscriptionBillingPreferenceTestDB(t)
	user, plan, _ := seedSubscriptionOrderScenario(t, "wallet_first")

	if _, err := AdminBindSubscription(user.Id, plan.Id, "manual"); err != nil {
		t.Fatalf("admin bind subscription: %v", err)
	}

	updatedUser, err := GetUserById(user.Id, false)
	if err != nil {
		t.Fatalf("get user: %v", err)
	}
	if got := updatedUser.GetSetting().BillingPreference; got != "wallet_first" {
		t.Fatalf("expected billing preference wallet_first, got %q", got)
	}
}
