package service

import (
	"fmt"
	"net/url"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func countSubscriptionPreConsumeRecordsByRequestID(t *testing.T, requestID string) int64 {
	t.Helper()
	var count int64
	if err := model.DB.Model(&model.SubscriptionPreConsumeRecord{}).Where("request_id = ?", requestID).Count(&count).Error; err != nil {
		t.Fatalf("count pre-consume records: %v", err)
	}
	return count
}

func mustGetUserSubscription(t *testing.T, subID int) model.UserSubscription {
	t.Helper()
	var sub model.UserSubscription
	if err := model.DB.First(&sub, subID).Error; err != nil {
		t.Fatalf("query user subscription: %v", err)
	}
	return sub
}

func postgresIntegrationDSN(t *testing.T) string {
	t.Helper()
	dsn := strings.TrimSpace(os.Getenv("NEWAPI_TEST_POSTGRES_DSN"))
	if dsn == "" {
		t.Skip("NEWAPI_TEST_POSTGRES_DSN not set; skipping PostgreSQL integration test")
	}
	return dsn
}

func replacePostgresDatabase(t *testing.T, dsn string, dbName string) string {
	t.Helper()
	parsed, err := url.Parse(dsn)
	if err != nil {
		t.Fatalf("parse postgres dsn: %v", err)
	}
	parsed.Path = "/" + dbName
	return parsed.String()
}

func setupPostgresBillingIntegrationDB(t *testing.T) func() {
	t.Helper()
	baseDSN := postgresIntegrationDSN(t)
	adminDSN := replacePostgresDatabase(t, baseDSN, "postgres")
	dbName := fmt.Sprintf("new_api_subgrp_%d", time.Now().UnixNano())

	adminDB, err := gorm.Open(postgres.Open(adminDSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("open postgres admin db: %v", err)
	}
	quotedName := `"` + dbName + `"`
	if err := adminDB.Exec("CREATE DATABASE " + quotedName).Error; err != nil {
		t.Fatalf("create postgres test db: %v", err)
	}

	testDSN := replacePostgresDatabase(t, baseDSN, dbName)
	testDB, err := gorm.Open(postgres.Open(testDSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("open postgres test db: %v", err)
	}

	oldDB := model.DB
	oldUsingSQLite := common.UsingSQLite
	oldUsingMySQL := common.UsingMySQL
	oldUsingPostgreSQL := common.UsingPostgreSQL
	oldRedisEnabled := common.RedisEnabled
	model.DB = testDB
	common.UsingSQLite = false
	common.UsingMySQL = false
	common.UsingPostgreSQL = true
	common.RedisEnabled = false

	t.Cleanup(func() {
		model.DB = oldDB
		common.UsingSQLite = oldUsingSQLite
		common.UsingMySQL = oldUsingMySQL
		common.UsingPostgreSQL = oldUsingPostgreSQL
		common.RedisEnabled = oldRedisEnabled

		sqlDB, err := testDB.DB()
		if err == nil {
			_ = sqlDB.Close()
		}
		_ = adminDB.Exec("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ? AND pid <> pg_backend_pid()", dbName).Error
		_ = adminDB.Exec("DROP DATABASE IF EXISTS " + quotedName).Error
	})

	if err := testDB.AutoMigrate(&model.User{}, &model.SubscriptionPlan{}, &model.UserSubscription{}, &model.SubscriptionPreConsumeRecord{}); err != nil {
		t.Fatalf("postgres auto migrate: %v", err)
	}
	return func() {}
}

func TestPostgresIntegrationSubscriptionAllowedTokenGroupsFlow(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cleanup := setupPostgresBillingIntegrationDB(t)
	defer cleanup()

	if !model.DB.Migrator().HasColumn(&model.SubscriptionPlan{}, "allowed_token_groups") {
		t.Fatal("expected subscription_plans.allowed_token_groups column")
	}
	if !model.DB.Migrator().HasColumn(&model.UserSubscription{}, "allowed_token_groups") {
		t.Fatal("expected user_subscriptions.allowed_token_groups column")
	}

	user := &model.User{
		Username: fmt.Sprintf("pg-tester-%d", time.Now().UnixNano()),
		Password: "password123",
		Role:     1,
		Status:   1,
		Group:    "default",
		Quota:    100,
	}
	if err := model.DB.Create(user).Error; err != nil {
		t.Fatalf("create user: %v", err)
	}

	plan := &model.SubscriptionPlan{
		Title:              "pg-plan",
		PriceAmount:        10,
		Currency:           "USD",
		DurationUnit:       model.SubscriptionDurationMonth,
		DurationValue:      1,
		AllowedTokenGroups: "vip,enterprise",
		TotalAmount:        0,
	}
	if err := model.DB.Create(plan).Error; err != nil {
		t.Fatalf("create plan: %v", err)
	}

	sub, err := model.CreateUserSubscriptionFromPlanTx(model.DB, user.Id, plan, "order")
	if err != nil {
		t.Fatalf("create user subscription from plan: %v", err)
	}
	if sub.AllowedTokenGroups != "vip,enterprise" {
		t.Fatalf("expected snapshot allowed groups, got %q", sub.AllowedTokenGroups)
	}
	persistedSub := mustGetUserSubscription(t, sub.Id)
	if persistedSub.AllowedTokenGroups != "vip,enterprise" {
		t.Fatalf("expected persisted snapshot allowed groups, got %q", persistedSub.AllowedTokenGroups)
	}

	t.Run("subscription_only matched group uses subscription", func(t *testing.T) {
		ctx := newBillingTestContext("vip")
		relayInfo := newBillingTestRelayInfo(user.Id, "subscription_only")
		relayInfo.RequestId += "-matched"

		session, apiErr := NewBillingSession(ctx, relayInfo, 0)
		if apiErr != nil {
			t.Fatalf("unexpected apiErr: %v", apiErr)
		}
		if session == nil || session.funding.Source() != BillingSourceSubscription {
			t.Fatalf("expected subscription funding, got %#v", session)
		}
		if relayInfo.BillingGroup != "vip" {
			t.Fatalf("expected frozen billing group vip, got %q", relayInfo.BillingGroup)
		}
		if relayInfo.SubscriptionId != sub.Id {
			t.Fatalf("expected subscription id %d, got %d", sub.Id, relayInfo.SubscriptionId)
		}
		if relayInfo.SubscriptionPreConsumed != 1 {
			t.Fatalf("expected subscription pre-consumed 1, got %d", relayInfo.SubscriptionPreConsumed)
		}
		if relayInfo.SubscriptionPlanId != plan.Id || relayInfo.SubscriptionPlanTitle != plan.Title {
			t.Fatalf("unexpected subscription plan sync: id=%d title=%q", relayInfo.SubscriptionPlanId, relayInfo.SubscriptionPlanTitle)
		}
		updatedSub := mustGetUserSubscription(t, sub.Id)
		if updatedSub.AmountUsed != 1 {
			t.Fatalf("expected amount_used to be 1 after pre-consume, got %d", updatedSub.AmountUsed)
		}
		if got := countSubscriptionPreConsumeRecordsByRequestID(t, relayInfo.RequestId); got != 1 {
			t.Fatalf("expected 1 pre-consume record, got %d", got)
		}
	})

	t.Run("subscription_only mismatched group rejects", func(t *testing.T) {
		ctx := newBillingTestContext("default")
		relayInfo := newBillingTestRelayInfo(user.Id, "subscription_only")
		relayInfo.RequestId += "-mismatched"

		session, apiErr := NewBillingSession(ctx, relayInfo, 0)
		if session != nil {
			t.Fatalf("expected nil session, got %#v", session)
		}
		if apiErr == nil || apiErr.GetErrorCode() != types.ErrorCodeInsufficientUserQuota {
			t.Fatalf("expected insufficient quota apiErr, got %v", apiErr)
		}
		updatedSub := mustGetUserSubscription(t, sub.Id)
		if updatedSub.AmountUsed != 1 {
			t.Fatalf("expected amount_used to remain 1 after mismatch, got %d", updatedSub.AmountUsed)
		}
		if got := countSubscriptionPreConsumeRecordsByRequestID(t, relayInfo.RequestId); got != 0 {
			t.Fatalf("expected 0 pre-consume records on mismatch, got %d", got)
		}
	})

	t.Run("wallet_first wallet insufficient falls back to matched subscription", func(t *testing.T) {
		if err := model.DB.Model(&model.User{}).Where("id = ?", user.Id).Update("quota", 0).Error; err != nil {
			t.Fatalf("set user quota: %v", err)
		}
		ctx := newBillingTestContext("enterprise")
		relayInfo := newBillingTestRelayInfo(user.Id, "wallet_first")
		relayInfo.RequestId += "-wallet-first"

		session, apiErr := NewBillingSession(ctx, relayInfo, 0)
		if apiErr != nil {
			t.Fatalf("unexpected apiErr: %v", apiErr)
		}
		if session == nil || session.funding.Source() != BillingSourceSubscription {
			t.Fatalf("expected subscription funding, got %#v", session)
		}
		if relayInfo.SubscriptionId != sub.Id || relayInfo.BillingGroup != "enterprise" {
			t.Fatalf("unexpected relay sync: sub=%d billingGroup=%q", relayInfo.SubscriptionId, relayInfo.BillingGroup)
		}
		updatedSub := mustGetUserSubscription(t, sub.Id)
		if updatedSub.AmountUsed != 2 {
			t.Fatalf("expected amount_used to be 2 after second matched pre-consume, got %d", updatedSub.AmountUsed)
		}
		if got := countSubscriptionPreConsumeRecordsByRequestID(t, relayInfo.RequestId); got != 1 {
			t.Fatalf("expected 1 pre-consume record for wallet_first fallback, got %d", got)
		}
	})
}
