package model

import (
	"fmt"
	"net/url"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/QuantumNous/new-api/common"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

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

func setupPostgresMigrationIntegrationDB(t *testing.T) func() {
	t.Helper()
	baseDSN := postgresIntegrationDSN(t)
	adminDSN := replacePostgresDatabase(t, baseDSN, "postgres")
	dbName := fmt.Sprintf("new_api_migrate_%d", time.Now().UnixNano())

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

	oldDB := DB
	oldUsingSQLite := common.UsingSQLite
	oldUsingMySQL := common.UsingMySQL
	oldUsingPostgreSQL := common.UsingPostgreSQL
	oldRedisEnabled := common.RedisEnabled
	DB = testDB
	common.UsingSQLite = false
	common.UsingMySQL = false
	common.UsingPostgreSQL = true
	common.RedisEnabled = false
	initCol()

	t.Cleanup(func() {
		DB = oldDB
		common.UsingSQLite = oldUsingSQLite
		common.UsingMySQL = oldUsingMySQL
		common.UsingPostgreSQL = oldUsingPostgreSQL
		common.RedisEnabled = oldRedisEnabled
		initCol()

		sqlDB, err := testDB.DB()
		if err == nil {
			_ = sqlDB.Close()
		}
		_ = adminDB.Exec("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ? AND pid <> pg_backend_pid()", dbName).Error
		_ = adminDB.Exec("DROP DATABASE IF EXISTS " + quotedName).Error
	})

	return func() {}
}

func TestPostgresIntegrationMigrateDBUpgradesLegacySubscriptionTables(t *testing.T) {
	cleanup := setupPostgresMigrationIntegrationDB(t)
	defer cleanup()

	legacyPlanSQL := `CREATE TABLE subscription_plans (
		id bigserial PRIMARY KEY,
		title varchar(128) NOT NULL,
		upgrade_group varchar(64) DEFAULT '',
		total_amount bigint NOT NULL DEFAULT 0,
		created_at bigint,
		updated_at bigint
	)`
	if err := DB.Exec(legacyPlanSQL).Error; err != nil {
		t.Fatalf("create legacy subscription_plans: %v", err)
	}

	legacyUserSubSQL := `CREATE TABLE user_subscriptions (
		id bigserial PRIMARY KEY,
		user_id bigint NOT NULL,
		plan_id bigint NOT NULL,
		amount_total bigint NOT NULL DEFAULT 0,
		amount_used bigint NOT NULL DEFAULT 0,
		start_time bigint,
		end_time bigint,
		status varchar(32),
		created_at bigint,
		updated_at bigint
	)`
	if err := DB.Exec(legacyUserSubSQL).Error; err != nil {
		t.Fatalf("create legacy user_subscriptions: %v", err)
	}

	if err := migrateDB(); err != nil {
		t.Fatalf("migrateDB: %v", err)
	}

	if !DB.Migrator().HasColumn(&SubscriptionPlan{}, "allowed_token_groups") {
		t.Fatal("expected subscription_plans.allowed_token_groups after migrateDB")
	}
	if !DB.Migrator().HasColumn(&SubscriptionPlan{}, "quota_reset_period") {
		t.Fatal("expected subscription_plans.quota_reset_period after migrateDB")
	}
	if !DB.Migrator().HasColumn(&UserSubscription{}, "allowed_token_groups") {
		t.Fatal("expected user_subscriptions.allowed_token_groups after migrateDB")
	}
	if !DB.Migrator().HasColumn(&UserSubscription{}, "prev_user_group") {
		t.Fatal("expected user_subscriptions.prev_user_group after migrateDB")
	}

	plan := &SubscriptionPlan{
		Title:              "pg-migrated-plan",
		PriceAmount:        10,
		Currency:           "USD",
		DurationUnit:       SubscriptionDurationMonth,
		DurationValue:      1,
		AllowedTokenGroups: "vip,enterprise",
	}
	if err := DB.Create(plan).Error; err != nil {
		t.Fatalf("create plan after migrateDB: %v", err)
	}
	var persistedPlan SubscriptionPlan
	if err := DB.First(&persistedPlan, plan.Id).Error; err != nil {
		t.Fatalf("query plan after migrateDB: %v", err)
	}
	if persistedPlan.AllowedTokenGroups != "vip,enterprise" {
		t.Fatalf("expected persisted allowed groups, got %q", persistedPlan.AllowedTokenGroups)
	}
}
