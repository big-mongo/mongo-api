package model

import (
	"path/filepath"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func setupSubscriptionMigrationTestDB(t *testing.T, usingSQLite bool, usingPostgreSQL bool) {
	t.Helper()
	oldDB := DB
	oldUsingSQLite := common.UsingSQLite
	oldUsingMySQL := common.UsingMySQL
	oldUsingPostgreSQL := common.UsingPostgreSQL
	t.Cleanup(func() {
		DB = oldDB
		common.UsingSQLite = oldUsingSQLite
		common.UsingMySQL = oldUsingMySQL
		common.UsingPostgreSQL = oldUsingPostgreSQL
	})

	common.UsingSQLite = usingSQLite
	common.UsingMySQL = false
	common.UsingPostgreSQL = usingPostgreSQL

	dbPath := filepath.Join(t.TempDir(), "subscription-migration.db")
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	DB = db
}

func TestEnsureSubscriptionPlanTableSQLiteAddsAllowedTokenGroupsColumn(t *testing.T) {
	setupSubscriptionMigrationTestDB(t, true, false)

	createLegacyTableSQL := `CREATE TABLE subscription_plans (
		id integer PRIMARY KEY,
		title varchar(128) NOT NULL,
		upgrade_group varchar(64) DEFAULT '',
		total_amount bigint NOT NULL DEFAULT 0,
		created_at bigint,
		updated_at bigint
	)`
	if err := DB.Exec(createLegacyTableSQL).Error; err != nil {
		t.Fatalf("create legacy table: %v", err)
	}

	if err := ensureSubscriptionPlanTableSQLite(); err != nil {
		t.Fatalf("ensure sqlite subscription plan table: %v", err)
	}

	if !DB.Migrator().HasColumn("subscription_plans", "allowed_token_groups") {
		t.Fatal("expected allowed_token_groups column to be added")
	}
	if !DB.Migrator().HasColumn("subscription_plans", "quota_reset_period") {
		t.Fatal("expected quota_reset_period column to be added")
	}
}

func TestUserSubscriptionSQLiteAutoMigrateCreatesAllowedTokenGroupsColumn(t *testing.T) {
	setupSubscriptionMigrationTestDB(t, true, false)

	if err := DB.AutoMigrate(&UserSubscription{}); err != nil {
		t.Fatalf("auto migrate user_subscriptions: %v", err)
	}

	if !DB.Migrator().HasColumn(&UserSubscription{}, "allowed_token_groups") {
		t.Fatal("expected allowed_token_groups column to be added to user_subscriptions")
	}
	if !DB.Migrator().HasColumn(&UserSubscription{}, "prev_user_group") {
		t.Fatal("expected prev_user_group column to be added to user_subscriptions")
	}
}

func TestSubscriptionPlanAutoMigrateAddsAllowedTokenGroupsColumnForPostgreSQLPath(t *testing.T) {
	setupSubscriptionMigrationTestDB(t, false, true)

	if err := DB.AutoMigrate(&SubscriptionPlan{}); err != nil {
		t.Fatalf("auto migrate subscription_plans: %v", err)
	}

	if !DB.Migrator().HasColumn(&SubscriptionPlan{}, "allowed_token_groups") {
		t.Fatal("expected allowed_token_groups column to be added on non-sqlite migration path")
	}
	if !DB.Migrator().HasColumn(&SubscriptionPlan{}, "quota_reset_period") {
		t.Fatal("expected quota_reset_period column to be added on non-sqlite migration path")
	}
}

func TestUserSubscriptionAutoMigrateAddsAllowedTokenGroupsColumnForPostgreSQLPath(t *testing.T) {
	setupSubscriptionMigrationTestDB(t, false, true)

	if err := DB.AutoMigrate(&UserSubscription{}); err != nil {
		t.Fatalf("auto migrate user_subscriptions: %v", err)
	}

	if !DB.Migrator().HasColumn(&UserSubscription{}, "allowed_token_groups") {
		t.Fatal("expected allowed_token_groups column to be added on non-sqlite migration path")
	}
	if !DB.Migrator().HasColumn(&UserSubscription{}, "prev_user_group") {
		t.Fatal("expected prev_user_group column to be added on non-sqlite migration path")
	}
}
