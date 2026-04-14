#!/bin/bash

# Aquagreen Hydroseed - System Validation Script
# This script validates that all components are properly configured

echo "🔍 AQUAGREEN SYSTEM VALIDATION"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

validates=0
failures=0

# Function to check file existence
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $2"
    ((validates++))
  else
    echo -e "${RED}❌${NC} $2 - NOT FOUND: $1"
    ((failures++))
  fi
}

# Function to check directory existence
check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✅${NC} $2"
    ((validates++))
  else
    echo -e "${RED}❌${NC} $2 - NOT FOUND: $1"
    ((failures++))
  fi
}

# Function to check content
check_content() {
  if grep -q "$2" "$1"; then
    echo -e "${GREEN}✅${NC} $3"
    ((validates++))
  else
    echo -e "${RED}❌${NC} $3 - NOT FOUND in: $1"
    ((failures++))
  fi
}

echo "1. Checking Configuration Files:"
check_file "/Users/artemrogacev/Downloads/gazon59.ru/backend/.env" "Backend environment config"
check_file "/Users/artemrogacev/Downloads/gazon59.ru/fullstack/client/.env" "Client environment config"
check_file "/Users/artemrogacev/Downloads/gazon59.ru/fullstack/admin/.env" "Admin environment config"

echo ""
echo "2. Checking Application Files:"
check_file "/Users/artemrogacev/Downloads/gazon59.ru/backend/server.js" "Backend Express server"
check_file "/Users/artemrogacev/Downloads/gazon59.ru/fullstack/client/src/App.tsx" "Client React app"
check_file "/Users/artemrogacev/Downloads/gazon59.ru/fullstack/admin/src/App.tsx" "Admin React app"

echo ""
echo "3. Checking Database:"
check_file "/Users/artemrogacev/Downloads/gazon59.ru/backend/data/leads.json" "Leads database"

echo ""
echo "4. Checking Node Modules:"
check_dir "/Users/artemrogacev/Downloads/gazon59.ru/backend/node_modules" "Backend dependencies"
check_dir "/Users/artemrogacev/Downloads/gazon59.ru/fullstack/client/node_modules" "Client dependencies"
check_dir "/Users/artemrogacev/Downloads/gazon59.ru/fullstack/admin/node_modules" "Admin dependencies"

echo ""
echo "5. Checking MAX Integration in Backend:"
check_content "/Users/artemrogacev/Downloads/gazon59.ru/backend/server.js" "MAX_MESSENGER_TOKEN" "MAX token variable declared"
check_content "/Users/artemrogacev/Downloads/gazon59.ru/backend/server.js" "sendToMaxMessenger" "MAX messenger function defined"
check_content "/Users/artemrogacev/Downloads/gazon59.ru/backend/server.js" "platform-api.max.ru/messages" "MAX API endpoint configured"

echo ""
echo "6. Checking .env Configuration:"
check_content "/Users/artemrogacev/Downloads/gazon59.ru/backend/.env" "MAX_MESSENGER_TOKEN=" "MAX token in .env"
check_content "/Users/artemrogacev/Downloads/gazon59.ru/backend/.env" "MAX_MESSENGER_CHAT_IDS=8755559" "Chat ID in .env"
check_content "/Users/artemrogacev/Downloads/gazon59.ru/fullstack/client/.env" "VITE_API_BASE_URL=http://localhost:3001" "Client API URL"
check_content "/Users/artemrogacev/Downloads/gazon59.ru/fullstack/admin/.env" "VITE_API_BASE_URL=http://localhost:3001" "Admin API URL"

echo ""
echo "7. Checking Documentation:"
check_file "/Users/artemrogacev/Downloads/gazon59.ru/INTEGRATION_STATUS.md" "Integration status report"
check_file "/Users/artemrogacev/Downloads/gazon59.ru/QUICK_START.md" "Quick start guide"
check_file "/Users/artemrogacev/Downloads/gazon59.ru/COMPLETION_REPORT.txt" "Completion report"

echo ""
echo "=============================="
echo "VALIDATION SUMMARY"
echo "=============================="
echo -e "Passed: ${GREEN}$validates${NC}"
echo -e "Failed: ${RED}$failures${NC}"

if [ $failures -eq 0 ]; then
  echo -e "\n${GREEN}✅ ALL SYSTEMS VALIDATED - READY FOR DEPLOYMENT${NC}"
  exit 0
else
  echo -e "\n${RED}❌ SOME ISSUES FOUND - PLEASE FIX ABOVE${NC}"
  exit 1
fi
