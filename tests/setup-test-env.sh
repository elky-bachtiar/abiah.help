#!/bin/bash

# Automatic Test Environment Setup Script
echo "🔧 Setting up test environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if Supabase is installed
check_supabase_cli() {
    # Check for global installation first
    if command -v supabase >/dev/null 2>&1; then
        print_status $GREEN "✅ Supabase CLI is installed globally"
        return 0
    # Check if npx can find it
    elif npx supabase --version >/dev/null 2>&1; then
        print_status $GREEN "✅ Supabase CLI is available via npx"
        return 0
    else
        print_status $YELLOW "⚠️  Supabase CLI not found"
        echo "💡 Install with: npm install -g supabase"
        return 1
    fi
}

# Function to start Supabase if not running
ensure_supabase_running() {
    if ! check_supabase_cli; then
        return 1
    fi
    
    # Get full status output for better diagnosis
    local status_output=$(npx supabase status 2>/dev/null)
    local status_code=$?
    
    if [ $status_code -eq 0 ]; then
        print_status $GREEN "✅ Supabase is running"
        
        # Check if services are actually running (not just DB)
        if echo "$status_output" | grep -q "Stopped services:"; then
            print_status $YELLOW "⚠️  Some services are stopped, attempting restart..."
            npx supabase stop >/dev/null 2>&1
            if npx supabase start >/dev/null 2>&1; then
                print_status $GREEN "✅ Supabase restarted successfully"
                return 0
            else
                print_status $RED "❌ Failed to restart Supabase"
                return 1
            fi
        else
            return 0
        fi
    else
        print_status $BLUE "🚀 Starting Supabase..."
        if npx supabase start >/dev/null 2>&1; then
            print_status $GREEN "✅ Supabase started successfully"
            return 0
        else
            print_status $RED "❌ Failed to start Supabase"
            return 1
        fi
    fi
}

# Function to create .env.test if it doesn't exist
create_env_test() {
    if [ ! -f ".env.test" ]; then
        print_status $BLUE "📝 Creating .env.test file..."
        
        cat > .env.test << 'EOF'
# Test Environment Configuration
# These are default values for testing - safe to commit

# Supabase Configuration (Local Development)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOuoJeHxjNa-NEtC0sF2dxOKd-QMKd-bSz-d4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Webhook Configuration (Test Values)
TAVUS_WEBHOOK_SECRET=test-webhook-secret-for-development
TAVUS_API_KEY=test-tavus-api-key

# Test Configuration
NODE_ENV=test
JEST_TIMEOUT=10000

# Optional: Skip integration tests if Supabase not available
SKIP_INTEGRATION_TESTS=false
EOF

        print_status $GREEN "✅ Created .env.test with default values"
    else
        print_status $GREEN "✅ .env.test already exists"
    fi
}

# Function to update .env.test with real Supabase keys
update_env_with_real_keys() {
    if (command -v supabase >/dev/null 2>&1 || npx supabase --version >/dev/null 2>&1) && npx supabase status >/dev/null 2>&1; then
        print_status $BLUE "🔄 Updating .env.test with real Supabase configuration..."
        
        # Get full status output
        local status_output=$(npx supabase status 2>/dev/null)
        
        # Parse URLs and keys from status output
        local api_url=$(echo "$status_output" | grep "API URL" | awk '{print $3}')
        local service_key=$(echo "$status_output" | grep "service_role key" | awk '{print $3}')
        local anon_key=$(echo "$status_output" | grep "anon key" | awk '{print $3}')
        
        # Update API URL if found
        if [ -n "$api_url" ]; then
            sed -i.bak "s|SUPABASE_URL=.*|SUPABASE_URL=$api_url|" .env.test
            print_status $GREEN "✅ Updated API URL: $api_url"
        fi
        
        # Update keys if found
        if [ -n "$service_key" ] && [ -n "$anon_key" ]; then
            sed -i.bak "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$service_key|" .env.test
            sed -i.bak "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=$anon_key|" .env.test
            print_status $GREEN "✅ Updated Supabase keys"
        else
            print_status $YELLOW "⚠️  Could not extract Supabase keys from status"
        fi
        
        # Clean up backup file
        rm -f .env.test.bak
        
        # Show what we detected
        if [ -n "$api_url" ] || [ -n "$service_key" ]; then
            print_status $GREEN "✅ Updated .env.test with detected Supabase configuration"
        else
            print_status $YELLOW "⚠️  Using default configuration in .env.test"
        fi
    fi
}

# Function to install test dependencies
install_test_deps() {
    print_status $BLUE "📦 Checking test dependencies..."
    
    # Check if node_modules exists and has test dependencies
    if [ ! -d "node_modules" ] || [ ! -d "node_modules/jest" ]; then
        print_status $BLUE "📦 Installing dependencies..."
        npm install
        print_status $GREEN "✅ Dependencies installed"
    else
        print_status $GREEN "✅ Dependencies already installed"
    fi
}

# Function to verify test setup
verify_test_setup() {
    print_status $BLUE "🔍 Verifying test setup..."
    
    # Check Jest config
    if [ -f "tests/jest.config.js" ]; then
        print_status $GREEN "✅ Jest configuration found"
    else
        print_status $RED "❌ Jest configuration missing"
        return 1
    fi
    
    # Check test files
    if [ -f "tests/subscription-system.test.ts" ]; then
        print_status $GREEN "✅ Subscription tests found"
    else
        print_status $RED "❌ Subscription tests missing"
        return 1
    fi
    
    # Test environment loading
    if [ -f ".env.test" ]; then
        print_status $GREEN "✅ Test environment file ready"
    else
        print_status $RED "❌ Test environment file missing"
        return 1
    fi
    
    return 0
}

# Main setup function
main() {
    print_status $BLUE "🚀 Starting automatic test environment setup..."
    echo ""
    
    # Step 1: Install dependencies
    install_test_deps
    echo ""
    
    # Step 2: Create .env.test
    create_env_test
    echo ""
    
    # Step 3: Try to start Supabase (optional for unit tests)
    print_status $BLUE "🔧 Setting up Supabase (optional for integration tests)..."
    if ensure_supabase_running; then
        update_env_with_real_keys
    else
        print_status $YELLOW "⚠️  Supabase not available - integration tests will be skipped"
        print_status $BLUE "💡 Unit tests will still work with mocked dependencies"
    fi
    echo ""
    
    # Step 4: Verify setup
    if verify_test_setup; then
        print_status $GREEN "🎉 Test environment setup complete!"
        echo ""
        print_status $BLUE "📋 What you can do now:"
        echo "   npm test                    # Run unit tests (no Supabase needed)"
        echo "   npm run test:coverage      # Run with coverage report"
        echo "   npm run test:webhook       # Run integration tests (needs Supabase)"
        echo "   npm run test:all          # Run everything"
        echo ""
        print_status $GREEN "✨ Happy testing!"
    else
        print_status $RED "❌ Test setup verification failed"
        exit 1
    fi
}

# Run main function
main