package model

import "testing"

func TestNormalizeAllowedTokenGroups(t *testing.T) {
	tests := []struct {
		name string
		raw  string
		want string
	}{
		{name: "empty", raw: "", want: ""},
		{name: "trim and dedupe", raw: " vip , enterprise,vip , default ", want: "vip,enterprise,default"},
		{name: "drop blanks", raw: ",vip,,enterprise,", want: "vip,enterprise"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := NormalizeAllowedTokenGroups(tt.raw); got != tt.want {
				t.Fatalf("NormalizeAllowedTokenGroups(%q) = %q, want %q", tt.raw, got, tt.want)
			}
		})
	}
}

func TestIsSubscriptionAllowedForTokenGroup(t *testing.T) {
	tests := []struct {
		name         string
		sub          *UserSubscription
		billingGroup string
		want         bool
	}{
		{
			name:         "unrestricted subscription",
			sub:          &UserSubscription{AllowedTokenGroups: ""},
			billingGroup: "vip",
			want:         true,
		},
		{
			name:         "matches one of multiple groups",
			sub:          &UserSubscription{AllowedTokenGroups: "vip,enterprise"},
			billingGroup: "enterprise",
			want:         true,
		},
		{
			name:         "group mismatch",
			sub:          &UserSubscription{AllowedTokenGroups: "vip,enterprise"},
			billingGroup: "default",
			want:         false,
		},
		{
			name:         "auto never matches restricted plan",
			sub:          &UserSubscription{AllowedTokenGroups: "vip,enterprise"},
			billingGroup: "auto",
			want:         false,
		},
		{
			name:         "empty billing group never matches restricted plan",
			sub:          &UserSubscription{AllowedTokenGroups: "vip,enterprise"},
			billingGroup: "",
			want:         false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := isSubscriptionAllowedForTokenGroup(tt.sub, tt.billingGroup); got != tt.want {
				t.Fatalf("isSubscriptionAllowedForTokenGroup(%+v, %q) = %v, want %v", tt.sub, tt.billingGroup, got, tt.want)
			}
		})
	}
}
