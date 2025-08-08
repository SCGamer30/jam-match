#!/bin/bash

# JamMatch Deployment Script
# This script helps deploy the JamMatch application to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
AI_SERVICE_DIR="ai-service"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is not installed"
        exit 1
    fi
    
    # Check Docker (optional)
    if ! command -v docker &> /dev/null; then
        log_warning "Docker is not installed (optional for local deployment)"
    fi
    
    log_success "All dependencies are available"
}

build_frontend() {
    log_info "Building frontend..."
    
    cd $FRONTEND_DIR
    
    # Install dependencies
    log_info "Installing frontend dependencies..."
    npm ci
    
    # Run type checking
    log_info "Running type checking..."
    npm run type-check
    
    # Run tests
    log_info "Running frontend tests..."
    npm test -- --watchAll=false --passWithNoTests
    
    # Build for production
    log_info "Building frontend for production..."
    npm run build
    
    cd ..
    log_success "Frontend build completed"
}

build_backend() {
    log_info "Building backend..."
    
    cd $BACKEND_DIR
    
    # Install dependencies
    log_info "Installing backend dependencies..."
    npm ci
    
    # Run type checking
    log_info "Running type checking..."
    npm run type-check
    
    # Run tests
    log_info "Running backend tests..."
    npm test -- --watchAll=false --passWithNoTests
    
    # Build for production
    log_info "Building backend for production..."
    npm run build
    
    cd ..
    log_success "Backend build completed"
}

build_ai_service() {
    log_info "Building AI service..."
    
    cd $AI_SERVICE_DIR
    
    # Install dependencies
    log_info "Installing AI service dependencies..."
    pip3 install -r requirements.txt
    
    # Run tests
    log_info "Running AI service tests..."
    python3 test_app.py
    
    cd ..
    log_success "AI service build completed"
}

deploy_to_vercel() {
    log_info "Deploying frontend to Vercel..."
    
    cd $FRONTEND_DIR
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI is not installed. Install with: npm i -g vercel"
        exit 1
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    cd ..
    log_success "Frontend deployed to Vercel"
}

deploy_to_railway() {
    log_info "Deploying backend and AI service to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI is not installed. Install from: https://railway.app/cli"
        exit 1
    fi
    
    # Deploy backend
    log_info "Deploying backend to Railway..."
    cd $BACKEND_DIR
    railway up
    cd ..
    
    # Deploy AI service
    log_info "Deploying AI service to Railway..."
    cd $AI_SERVICE_DIR
    railway up
    cd ..
    
    log_success "Services deployed to Railway"
}

run_health_checks() {
    log_info "Running health checks..."
    
    # Check if services are provided
    if [ -z "$BACKEND_URL" ]; then
        log_warning "BACKEND_URL not provided, skipping backend health check"
    else
        log_info "Checking backend health at $BACKEND_URL/health"
        if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
            log_success "Backend is healthy"
        else
            log_error "Backend health check failed"
        fi
    fi
    
    if [ -z "$AI_SERVICE_URL" ]; then
        log_warning "AI_SERVICE_URL not provided, skipping AI service health check"
    else
        log_info "Checking AI service health at $AI_SERVICE_URL/health"
        if curl -f "$AI_SERVICE_URL/health" > /dev/null 2>&1; then
            log_success "AI service is healthy"
        else
            log_error "AI service health check failed"
        fi
    fi
    
    if [ -z "$FRONTEND_URL" ]; then
        log_warning "FRONTEND_URL not provided, skipping frontend health check"
    else
        log_info "Checking frontend at $FRONTEND_URL"
        if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
            log_success "Frontend is accessible"
        else
            log_error "Frontend health check failed"
        fi
    fi
}

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --build-only      Build all services without deploying"
    echo "  --frontend-only   Build and deploy only frontend"
    echo "  --backend-only    Build and deploy only backend"
    echo "  --ai-only         Build and deploy only AI service"
    echo "  --skip-tests      Skip running tests during build"
    echo "  --health-check    Run health checks after deployment"
    echo "  --help           Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  BACKEND_URL      Backend service URL for health checks"
    echo "  AI_SERVICE_URL   AI service URL for health checks"
    echo "  FRONTEND_URL     Frontend URL for health checks"
}

# Main deployment logic
main() {
    log_info "Starting JamMatch deployment..."
    
    # Parse command line arguments
    BUILD_ONLY=false
    FRONTEND_ONLY=false
    BACKEND_ONLY=false
    AI_ONLY=false
    SKIP_TESTS=false
    HEALTH_CHECK=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --build-only)
                BUILD_ONLY=true
                shift
                ;;
            --frontend-only)
                FRONTEND_ONLY=true
                shift
                ;;
            --backend-only)
                BACKEND_ONLY=true
                shift
                ;;
            --ai-only)
                AI_ONLY=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --health-check)
                HEALTH_CHECK=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Check dependencies
    check_dependencies
    
    # Build services
    if [ "$FRONTEND_ONLY" = true ]; then
        build_frontend
    elif [ "$BACKEND_ONLY" = true ]; then
        build_backend
    elif [ "$AI_ONLY" = true ]; then
        build_ai_service
    else
        build_frontend
        build_backend
        build_ai_service
    fi
    
    # Deploy if not build-only
    if [ "$BUILD_ONLY" = false ]; then
        if [ "$FRONTEND_ONLY" = true ]; then
            deploy_to_vercel
        elif [ "$BACKEND_ONLY" = true ] || [ "$AI_ONLY" = true ]; then
            deploy_to_railway
        else
            deploy_to_vercel
            deploy_to_railway
        fi
    fi
    
    # Run health checks if requested
    if [ "$HEALTH_CHECK" = true ]; then
        sleep 30  # Wait for services to start
        run_health_checks
    fi
    
    log_success "Deployment completed successfully!"
    
    if [ "$BUILD_ONLY" = false ]; then
        log_info "Next steps:"
        log_info "1. Verify all services are running correctly"
        log_info "2. Run end-to-end tests against production"
        log_info "3. Monitor logs for any issues"
        log_info "4. Update DNS records if needed"
    fi
}

# Run main function
main "$@"