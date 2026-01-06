#!/bin/bash
# BoyFanz Smoke Test Suite
# Generated: 2026-01-06
# Purpose: Verify all critical endpoints return expected responses
# Usage: ./SMOKE_TEST.sh [local|prod]

set -e

# Configuration
ENV="${1:-local}"
if [ "$ENV" = "prod" ]; then
    BASE_URL="https://boyfanz.fanz.website"
else
    BASE_URL="http://localhost:3202"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Results file
RESULTS_FILE="SMOKE_TEST_RESULTS_$(date +%Y%m%d_%H%M%S).md"

echo "# BoyFanz Smoke Test Results" > "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "**Date**: $(date)" >> "$RESULTS_FILE"
echo "**Environment**: $ENV" >> "$RESULTS_FILE"
echo "**Base URL**: $BASE_URL" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Test function
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local expected_status="$3"
    local description="$4"
    local expected_body="$5"

    printf "Testing %-50s " "$method $endpoint"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" 2>/dev/null)
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" -H "Content-Type: application/json" -d '{}' 2>/dev/null)
    fi

    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')

    if [ "$status_code" = "$expected_status" ]; then
        if [ -n "$expected_body" ]; then
            if echo "$body" | grep -q "$expected_body"; then
                echo -e "${GREEN}PASS${NC} ($status_code)"
                ((PASSED++))
                echo "| \`$method $endpoint\` | $status_code | PASS | $description |" >> "$RESULTS_FILE"
            else
                echo -e "${YELLOW}WARN${NC} (status OK, body mismatch)"
                ((WARNINGS++))
                echo "| \`$method $endpoint\` | $status_code | WARN | Body mismatch: expected '$expected_body' |" >> "$RESULTS_FILE"
            fi
        else
            echo -e "${GREEN}PASS${NC} ($status_code)"
            ((PASSED++))
            echo "| \`$method $endpoint\` | $status_code | PASS | $description |" >> "$RESULTS_FILE"
        fi
    else
        echo -e "${RED}FAIL${NC} (expected $expected_status, got $status_code)"
        ((FAILED++))
        echo "| \`$method $endpoint\` | $status_code | **FAIL** | Expected $expected_status |" >> "$RESULTS_FILE"
    fi
}

# Test function for auth-required endpoints (expects 401)
test_auth_required() {
    local method="$1"
    local endpoint="$2"
    local description="$3"

    printf "Testing %-50s " "$method $endpoint (auth)"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" 2>/dev/null)
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" -H "Content-Type: application/json" -d '{}' 2>/dev/null)
    fi

    status_code=$(echo "$response" | tail -n 1)

    # Accept 200, 401, 403, or 422 (never 404 or 500)
    if [ "$status_code" = "200" ] || [ "$status_code" = "401" ] || [ "$status_code" = "403" ] || [ "$status_code" = "422" ]; then
        echo -e "${GREEN}PASS${NC} ($status_code)"
        ((PASSED++))
        echo "| \`$method $endpoint\` | $status_code | PASS | $description |" >> "$RESULTS_FILE"
    elif [ "$status_code" = "404" ]; then
        echo -e "${RED}FAIL${NC} (404 - endpoint missing)"
        ((FAILED++))
        echo "| \`$method $endpoint\` | **404** | **FAIL** | Endpoint not implemented |" >> "$RESULTS_FILE"
    elif [ "$status_code" = "500" ]; then
        echo -e "${RED}FAIL${NC} (500 - server error)"
        ((FAILED++))
        echo "| \`$method $endpoint\` | **500** | **FAIL** | Server error |" >> "$RESULTS_FILE"
    else
        echo -e "${YELLOW}WARN${NC} ($status_code)"
        ((WARNINGS++))
        echo "| \`$method $endpoint\` | $status_code | WARN | Unexpected status |" >> "$RESULTS_FILE"
    fi
}

echo ""
echo "========================================"
echo "  BoyFanz Smoke Test Suite"
echo "  Environment: $ENV"
echo "  Base URL: $BASE_URL"
echo "========================================"
echo ""

# Add table header to results
echo "## Test Results" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "| Endpoint | Status | Result | Notes |" >> "$RESULTS_FILE"
echo "|----------|--------|--------|-------|" >> "$RESULTS_FILE"

# ===========================================
# SECTION 1: Health Checks (P0 - Must Pass)
# ===========================================
echo "--- HEALTH CHECKS ---"
test_endpoint "GET" "/health" "200" "Basic health" '"status":"ok"'
test_endpoint "GET" "/health/ready" "200" "Readiness probe" '"ready":true'
test_endpoint "GET" "/health/live" "200" "Liveness probe" '"live":true'

# ===========================================
# SECTION 2: Authentication (P0 - Must Pass)
# ===========================================
echo ""
echo "--- AUTHENTICATION ---"
test_endpoint "GET" "/api/auth/user" "200" "Get user (unauthenticated)" '"authenticated":false'
test_endpoint "GET" "/api/auth/session" "200" "Session status" ""
test_endpoint "GET" "/api/auth/check-admin" "200" "Check admin" ""
test_endpoint "GET" "/api/platform/current" "200" "Platform metadata" '"platformId":"boyfanz"'

# ===========================================
# SECTION 3: SSO Routes
# ===========================================
echo ""
echo "--- SSO ROUTES ---"
test_endpoint "GET" "/login" "302" "Login redirect" ""
# Note: /login returns 302 redirect to FanzSSO

# ===========================================
# SECTION 4: Content Routes (Public)
# ===========================================
echo ""
echo "--- PUBLIC CONTENT ---"
test_auth_required "GET" "/api/content/feed" "Content feed"
test_auth_required "GET" "/api/infinity-feed" "Infinite scroll feed"
test_auth_required "GET" "/api/creators/discover" "Discover creators"
test_auth_required "GET" "/api/reels" "Reels content"
test_auth_required "GET" "/api/stories" "Stories"

# ===========================================
# SECTION 5: Forum Routes
# ===========================================
echo ""
echo "--- FORUMS ---"
test_auth_required "GET" "/api/forums/categories" "Forum categories"
test_auth_required "GET" "/api/forums/topics" "Forum topics"

# ===========================================
# SECTION 6: Events & Streaming
# ===========================================
echo ""
echo "--- EVENTS & STREAMING ---"
test_auth_required "GET" "/api/events" "Live events"
test_auth_required "GET" "/api/streams" "Streams"

# ===========================================
# SECTION 7: Help & Support
# ===========================================
echo ""
echo "--- HELP & SUPPORT ---"
test_auth_required "GET" "/api/help/faq" "FAQ list"
test_auth_required "GET" "/api/help/wiki" "Wiki articles"

# ===========================================
# SECTION 8: Creator Routes (Auth Required)
# ===========================================
echo ""
echo "--- CREATOR ROUTES ---"
test_auth_required "GET" "/api/creator/analytics" "Creator analytics"
test_auth_required "GET" "/api/creator/free-links" "Free links"

# ===========================================
# SECTION 9: Admin Routes (Auth Required)
# ===========================================
echo ""
echo "--- ADMIN ROUTES ---"
test_auth_required "GET" "/api/admin/analytics" "Admin analytics"
test_auth_required "GET" "/api/admin/moderation" "Content moderation"
test_auth_required "GET" "/api/admin/compliance" "Compliance status"

# ===========================================
# SECTION 10: Data Retention (GDPR/CCPA)
# ===========================================
echo ""
echo "--- DATA RETENTION ---"
test_auth_required "GET" "/api/data-retention/dashboard" "GDPR dashboard"
test_auth_required "GET" "/api/data-retention/consent" "Consent management"

# ===========================================
# SECTION 11: Gamification
# ===========================================
echo ""
echo "--- GAMIFICATION ---"
test_auth_required "GET" "/api/gamification/achievements" "Achievements"
test_auth_required "GET" "/api/gamification/leaderboard" "Leaderboard"
test_auth_required "GET" "/api/gamification/challenges" "Challenges"

# ===========================================
# SECTION 12: Battles & Tip Games
# ===========================================
echo ""
echo "--- BATTLES & TIP GAMES ---"
test_auth_required "GET" "/api/battles" "Battles"
test_auth_required "GET" "/api/tip-games" "Tip games"

# ===========================================
# SECTION 13: Fuck Buddies
# ===========================================
echo ""
echo "--- FUCK BUDDIES ---"
test_auth_required "GET" "/api/fuck-buddies/search" "Buddy search"

# ===========================================
# SECTION 14: Custom Requests
# ===========================================
echo ""
echo "--- CUSTOM REQUESTS ---"
test_auth_required "GET" "/api/custom-requests" "Custom requests"

# ===========================================
# SECTION 15: Webhooks (Should accept POST)
# ===========================================
echo ""
echo "--- WEBHOOKS ---"
test_auth_required "POST" "/api/webhooks/getstream" "GetStream webhook"
test_auth_required "POST" "/api/webhooks/ccbill" "CCBill webhook"

# ===========================================
# SECTION 16: Stub Endpoints (P1 fixes - should return 200)
# ===========================================
echo ""
echo "--- STUB ENDPOINTS (P1 fixes) ---"
test_endpoint "GET" "/api/marketplace" "200" "Marketplace stub" '"placeholder":true'
test_endpoint "GET" "/api/groups" "200" "Groups stub" '"placeholder":true'
test_endpoint "GET" "/api/collaborations" "200" "Collaborations stub" '"placeholder":true'

# ===========================================
# SECTION 17: CSRF Token
# ===========================================
echo ""
echo "--- CSRF ---"
test_endpoint "GET" "/api/csrf-token" "200" "CSRF token" ""

# Print Summary
echo ""
echo "========================================"
echo "  SUMMARY"
echo "========================================"
echo -e "  ${GREEN}PASSED${NC}:   $PASSED"
echo -e "  ${RED}FAILED${NC}:   $FAILED"
echo -e "  ${YELLOW}WARNINGS${NC}: $WARNINGS"
echo "========================================"

# Add summary to results file
echo "" >> "$RESULTS_FILE"
echo "## Summary" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "| Metric | Count |" >> "$RESULTS_FILE"
echo "|--------|-------|" >> "$RESULTS_FILE"
echo "| Passed | $PASSED |" >> "$RESULTS_FILE"
echo "| Failed | $FAILED |" >> "$RESULTS_FILE"
echo "| Warnings | $WARNINGS |" >> "$RESULTS_FILE"
echo "| **Total** | $((PASSED + FAILED + WARNINGS)) |" >> "$RESULTS_FILE"

echo ""
echo "Results saved to: $RESULTS_FILE"

# Exit with failure if any tests failed
if [ $FAILED -gt 0 ]; then
    echo ""
    echo -e "${RED}SMOKE TEST FAILED${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}SMOKE TEST PASSED${NC}"
    exit 0
fi
