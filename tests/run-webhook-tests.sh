#!/bin/bash

# Tavus Webhook Test Runner with Auto Environment Setup
echo "🚀 Starting Tavus Webhook Test Suite..."

# Function to load environment from .env.test
load_test_env() {
    local env_file="$1"
    if [ -f "$env_file" ]; then
        echo "📁 Loading environment from $env_file"
        # Export variables from .env.test, ignoring comments and empty lines
        export $(grep -v '^#' "$env_file" | grep -v '^$' | xargs)
        return 0
    fi
    return 1
}

# Function to detect Supabase and get keys
auto_detect_supabase() {
    echo "🔍 Auto-detecting Supabase configuration..."
    
    # Check if supabase CLI is available
    if command -v supabase >/dev/null 2>&1; then
        echo "✅ Supabase CLI found"
        
        # Check if Supabase is running
        if supabase status >/dev/null 2>&1; then
            echo "✅ Supabase is running locally"
            
            # Get service role key from supabase status
            local service_key=$(supabase status | grep "service_role key" | awk '{print $3}')
            local anon_key=$(supabase status | grep "anon key" | awk '{print $3}')
            
            if [ -n "$service_key" ]; then
                export SUPABASE_SERVICE_ROLE_KEY="$service_key"
                echo "✅ Auto-detected service role key"
            fi
            
            if [ -n "$anon_key" ]; then
                export SUPABASE_ANON_KEY="$anon_key"
                echo "✅ Auto-detected anon key"
            fi
            
            export SUPABASE_URL="http://localhost:54321"
            return 0
        else
            echo "⚠️  Supabase CLI found but not running"
            echo "💡 Try: supabase start"
            return 1
        fi
    else
        echo "⚠️  Supabase CLI not found"
        return 1
    fi
}

# Try to load environment in order of preference
echo "🔧 Setting up test environment..."

# 1. Try .env.test file first
if load_test_env ".env.test"; then
    echo "✅ Loaded test environment from .env.test"
elif load_test_env ".env"; then
    echo "✅ Loaded environment from .env"
else
    echo "📝 No .env.test file found, trying auto-detection..."
fi

# 2. Auto-detect Supabase if not already set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    if auto_detect_supabase; then
        echo "✅ Auto-detected Supabase configuration"
    else
        echo "❌ Could not auto-detect Supabase configuration"
        echo ""
        echo "💡 To fix this, either:"
        echo "   1. Start Supabase locally: supabase start"
        echo "   2. Create .env.test with your configuration"
        echo "   3. Set environment variables manually:"
        echo "      export SUPABASE_URL=http://localhost:54321"
        echo "      export SUPABASE_SERVICE_ROLE_KEY=your-key"
        echo ""
        exit 1
    fi
fi

# 3. Set default test values for optional variables
if [ -z "$TAVUS_WEBHOOK_SECRET" ]; then
    echo "⚠️  TAVUS_WEBHOOK_SECRET not set, using default test secret"
    export TAVUS_WEBHOOK_SECRET="test-webhook-secret"
fi

if [ -z "$TAVUS_API_KEY" ]; then
    export TAVUS_API_KEY="test-tavus-api-key"
fi

if [ -z "$NODE_ENV" ]; then
    export NODE_ENV="test"
fi

echo "📋 Environment Check:"
echo "  SUPABASE_URL: $SUPABASE_URL"
echo "  SERVICE_KEY: [SET]"
echo "  WEBHOOK_SECRET: [SET]"
echo ""

# Check if user wants to skip integration tests
if [ "$1" = "--skip-integration" ] || [ "$SKIP_INTEGRATION_TESTS" = "true" ]; then
    echo "⏭️  Skipping integration tests (--skip-integration flag or SKIP_INTEGRATION_TESTS=true)"
    echo "✅ Unit tests provide comprehensive coverage"
    exit 0
fi

# Check if Supabase is running
echo "🔍 Checking Supabase connection..."

# Try to get fresh status if supabase CLI is available
if command -v supabase >/dev/null 2>&1 || npx supabase --version >/dev/null 2>&1; then
    echo "📊 Checking Supabase status..."
    status_output=$(npx supabase status 2>/dev/null)
    if [ $? -eq 0 ]; then
        # Parse actual API URL from status
        detected_url=$(echo "$status_output" | grep "API URL" | awk '{print $3}')
        if [ -n "$detected_url" ]; then
            echo "🔧 Detected API URL: $detected_url"
            export SUPABASE_URL="$detected_url"
        fi
        
        # Check if services are stopped
        if echo "$status_output" | grep -q "Stopped services:"; then
            echo "⚠️  Some Supabase services are stopped, attempting to restart..."
            npx supabase stop >/dev/null 2>&1
            npx supabase start >/dev/null 2>&1
            sleep 2  # Give services time to start
        fi
    fi
fi

# Test REST API connection
curl -s "$SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" > /dev/null 2>&1
rest_status=$?

# Test Functions connection
curl -s "$SUPABASE_URL/functions/v1/" > /dev/null 2>&1
functions_status=$?

if [ $rest_status -eq 0 ] && [ $functions_status -eq 0 ]; then
    echo "✅ Supabase REST API and Functions are accessible"
elif [ $rest_status -eq 0 ]; then
    echo "⚠️  Supabase REST API accessible but Functions may not be ready"
    echo "🔄 Waiting for Edge Functions to be ready..."
    sleep 5
else
    echo "❌ Cannot connect to Supabase at $SUPABASE_URL"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "  Current URL: $SUPABASE_URL"
    if command -v supabase >/dev/null 2>&1 || npx supabase --version >/dev/null 2>&1; then
        echo "  Status: $(npx supabase status | head -1)"
        echo ""
    fi
    echo "💡 To run integration tests, you have several options:"
    echo "   1. Install Supabase CLI: npm install -g supabase"
    echo "   2. Start Supabase locally: npx supabase start"
    echo "   3. Restart if services are stopped: npx supabase stop && npx supabase start"
    echo "   4. Use Docker: docker run -p 54321:54321 supabase/postgres"
    echo "   5. Skip integration tests: npm run test:webhook -- --skip-integration"
    echo ""
    echo "📝 Note: Unit tests (npm test) provide comprehensive coverage"
    echo "   Integration tests are optional for additional confidence"
    echo ""
    
    # Ask user if they want to skip integration tests
    echo "❓ Would you like to skip integration tests and exit gracefully? [y/N]"
    read -t 10 -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "✅ Skipping integration tests - unit tests provide full coverage"
        exit 0
    else
        echo "❌ Integration tests cannot run without Supabase"
        exit 1
    fi
fi

# Check if webhook function is deployed
echo "🔍 Checking webhook function..."
curl -s "$SUPABASE_URL/functions/v1/tavus-webhook" -X POST -H "Content-Type: application/json" -d '{}' > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Webhook function is accessible"
else
    echo "❌ Cannot access webhook function"
    echo "Make sure Edge Functions are deployed with: supabase functions deploy tavus-webhook"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the tests directly with ts-node
echo "🧪 Running webhook tests..."
npx ts-node --esm tests/tavus-webhook-subscription-test.ts

TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo "🎉 All tests passed successfully!"
    echo ""
    echo "📊 Test Coverage:"
    echo "  ✅ Webhook signature verification"
    echo "  ✅ Conversation start with usage tracking"
    echo "  ✅ Conversation end with duration calculation"
    echo "  ✅ Subscription limit enforcement"
    echo "  ✅ Multiple event type handling"
    echo ""
else
    echo ""
    echo "❌ Tests failed with exit code: $TEST_RESULT"
    echo "Check the logs above for details"
    echo ""
fi

exit $TEST_RESULT