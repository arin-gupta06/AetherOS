#!/usr/bin/env bash
# GitHub Architecture Inference - Testing & Validation Script
# Run this to test the GitHub repository analysis feature

echo "=================================================="
echo "GitHub Architecture Inference - Testing Guide"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:4000/api/github/analyze-repo"
TIMEOUT=10

# Check if server is running
echo -e "${BLUE}[CHECK 1] Verifying backend server is running...${NC}"
if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend server is running${NC}"
else
    echo -e "${RED}✗ Backend server is NOT running${NC}"
    echo "  Start it with: cd server && npm start"
    exit 1
fi

echo ""
echo -e "${BLUE}[CHECK 2] Testing GitHub endpoint...${NC}"

# Test 1: Invalid URL
echo ""
echo -e "${YELLOW}Test 1: Invalid URL (should fail)${NC}"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "invalid-url"}' | jq '.'

# Test 2: Simple React Repository
echo ""
echo -e "${YELLOW}Test 2: React Repository (facebook/react)${NC}"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}' | jq '.'

# Test 3: Full-Stack Repository
echo ""
echo -e "${YELLOW}Test 3: Node.js API (expressjs/express)${NC}"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/expressjs/express"}' | jq '.'

# Test 4: Python Repository
echo ""
echo -e "${YELLOW}Test 4: Python Project (pallets/flask)${NC}"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/pallets/flask"}' | jq '.'

# Test 5: Docker-Compose based repo (if available)
echo ""
echo -e "${YELLOW}Test 5: Go Project (golang/go)${NC}"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/golang/go"}' | jq '.'

echo ""
echo -e "${BLUE}=================================================="
echo "Testing Complete!"
echo "==================================================${NC}"
echo ""
echo "Expected Results:"
echo "- Invalid URLs should return status: 'error'"
echo "- Valid repos should return status: 'success'"
echo "- Each success should include 'architecture' with nodes and edges"
echo "- Frontend libs (React, Vue) should detect Framework correctly"
echo "- Backend APIs should detect Runtime (Node.js, Python, Go, etc.)"
echo ""
echo "If all tests passed with status 'success', the feature is working!"
echo ""
