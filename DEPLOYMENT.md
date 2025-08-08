# JamMatch Deployment Guide

This guide provides comprehensive instructions for deploying the JamMatch application to production environments.

## Architecture Overview

JamMatch consists of three main services:

- **Frontend**: Next.js 14 application (deployed to Vercel)
- **Backend**: Node.js/Express API (deployed to Railway)
- **AI Service**: Python Flask service (deployed to Railway)
- **Database**: Supabase PostgreSQL

## Prerequisites

### Required Tools

- Node.js 18+ and npm
- Python 3.11+
- Docker (optional, for local testing)
- Git

### Required Accounts

- [Vercel](https://vercel.com) account for frontend deployment
- [Railway](https://railway.app) account for backend and AI service
- [Supabase](https://supabase.com) account for database
- [Hugging Face](https://huggingface.co) account for AI model access

### CLI Tools

```bash
# Install Vercel CLI
npm i -g vercel

# Install Railway CLI
# Visit https://railway.app/cli for installation instructions

# Install Docker (optional)
# Visit https://docker.com for installation instructions
```

## Environment Configuration

### 1. Supabase Setup

1. Create a new Supabase project
2. Run the database migrations:
   ```sql
   -- Copy and run the contents of database/schema.sql
   -- Copy and run the contents of database/rls_policies.sql
   ```
3. Configure authentication settings
4. Note down your project URL and anon key

### 2. Hugging Face Setup

1. Create a Hugging Face account
2. Request access to the Mistral model
3. Generate an access token
4. Store the token securely

## Deployment Steps

### Option 1: Automated Deployment

Use the provided deployment script:

```bash
# Make the script executable
chmod +x scripts/deploy.sh

# Deploy all services
./scripts/deploy.sh

# Deploy specific services
./scripts/deploy.sh --frontend-only
./scripts/deploy.sh --backend-only
./scripts/deploy.sh --ai-only

# Build without deploying
./scripts/deploy.sh --build-only

# Run with health checks
./scripts/deploy.sh --health-check
```

### Option 2: Manual Deployment

#### Frontend Deployment (Vercel)

1. **Prepare the frontend:**

   ```bash
   cd frontend
   npm ci
   npm run build
   ```

2. **Deploy to Vercel:**

   ```bash
   vercel --prod
   ```

3. **Configure environment variables in Vercel dashboard:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXT_PUBLIC_AI_SERVICE_URL=https://your-ai-service.railway.app
   ```

#### Backend Deployment (Railway)

1. **Prepare the backend:**

   ```bash
   cd backend
   npm ci
   npm run build
   ```

2. **Deploy to Railway:**

   ```bash
   railway login
   railway link
   railway up
   ```

3. **Configure environment variables in Railway dashboard:**
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://username:password@host:port/database
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-super-secure-jwt-secret
   CORS_ORIGIN=https://your-frontend.vercel.app
   AI_SERVICE_URL=https://your-ai-service.railway.app
   ```

#### AI Service Deployment (Railway)

1. **Prepare the AI service:**

   ```bash
   cd ai-service
   pip install -r requirements.txt
   python test_app.py  # Verify it works
   ```

2. **Deploy to Railway:**

   ```bash
   railway login
   railway link
   railway up
   ```

3. **Configure environment variables in Railway dashboard:**
   ```
   FLASK_ENV=production
   HUGGING_FACE_TOKEN=your-hf-token
   MODEL_NAME=mistralai/Mistral-7B-Instruct-v0.1
   CORS_ORIGINS=https://your-backend.railway.app
   ```

## Environment Variables Reference

### Frontend (.env.production)

| Variable                        | Description            | Example                                   |
| ------------------------------- | ---------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL   | `https://abc123.supabase.co`              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...` |
| `NEXT_PUBLIC_API_URL`           | Backend API URL        | `https://jamMatch-backend.railway.app`    |
| `NEXT_PUBLIC_AI_SERVICE_URL`    | AI service URL         | `https://jamMatch-ai.railway.app`         |
| `NEXT_PUBLIC_APP_URL`           | Frontend URL           | `https://jamMatch.vercel.app`             |
| `NEXT_PUBLIC_ENVIRONMENT`       | Environment name       | `production`                              |

### Backend (.env.production)

| Variable                    | Description                  | Example                                   |
| --------------------------- | ---------------------------- | ----------------------------------------- |
| `NODE_ENV`                  | Node environment             | `production`                              |
| `PORT`                      | Server port                  | `8080`                                    |
| `DATABASE_URL`              | PostgreSQL connection string | `postgresql://user:pass@host:5432/db`     |
| `SUPABASE_URL`              | Supabase project URL         | `https://abc123.supabase.co`              |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key    | `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...` |
| `JWT_SECRET`                | JWT signing secret           | `your-super-secure-secret-key`            |
| `CORS_ORIGIN`               | Allowed CORS origin          | `https://jamMatch.vercel.app`             |
| `AI_SERVICE_URL`            | AI service URL               | `https://jamMatch-ai.railway.app`         |

### AI Service (.env.production)

| Variable             | Description              | Example                                |
| -------------------- | ------------------------ | -------------------------------------- |
| `FLASK_ENV`          | Flask environment        | `production`                           |
| `PORT`               | Server port              | `8000`                                 |
| `HUGGING_FACE_TOKEN` | HuggingFace access token | `hf_abc123...`                         |
| `MODEL_NAME`         | AI model name            | `mistralai/Mistral-7B-Instruct-v0.1`   |
| `CORS_ORIGINS`       | Allowed CORS origins     | `https://jamMatch-backend.railway.app` |
| `MAX_WORKERS`        | Gunicorn workers         | `2`                                    |

## Post-Deployment Verification

### 1. Health Checks

Verify all services are running:

```bash
# Frontend
curl https://your-frontend.vercel.app

# Backend
curl https://your-backend.railway.app/health

# AI Service
curl https://your-ai-service.railway.app/health
```

### 2. End-to-End Testing

Run the E2E test suite against production:

```bash
cd frontend
NEXT_PUBLIC_API_URL=https://your-backend.railway.app npm run e2e
```

### 3. Performance Testing

Test the AI service performance:

```bash
cd ai-service
python test_performance.py
```

## Monitoring and Logging

### Application Monitoring

1. **Vercel Analytics**: Automatically enabled for frontend
2. **Railway Metrics**: Available in Railway dashboard
3. **Supabase Monitoring**: Available in Supabase dashboard

### Log Aggregation

Logs are structured as JSON for easy parsing:

```bash
# View Railway logs
railway logs

# View Vercel logs
vercel logs
```

### Health Monitoring

Set up monitoring for these endpoints:

- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.railway.app/health`
- AI Service: `https://your-ai-service.railway.app/health`

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use platform-specific secret management
- Rotate secrets regularly

### 2. CORS Configuration

Ensure CORS is properly configured:

```javascript
// Backend CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200,
};
```

### 3. Rate Limiting

Configure rate limiting for production:

```javascript
// Backend rate limiting
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

### 4. Security Headers

Security headers are configured in:

- Frontend: `vercel.json`
- Backend: Helmet middleware

## Scaling Considerations

### Frontend Scaling

Vercel automatically handles:

- Global CDN distribution
- Automatic scaling
- Edge caching

### Backend Scaling

Railway provides:

- Automatic scaling based on CPU/memory
- Load balancing
- Health checks

### AI Service Scaling

For high-traffic scenarios:

- Increase Railway service replicas
- Consider GPU instances for better performance
- Implement request queuing

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Check Node.js/Python versions
   - Verify all dependencies are installed
   - Review build logs for specific errors

2. **Environment Variable Issues**

   - Verify all required variables are set
   - Check variable names for typos
   - Ensure secrets are properly encoded

3. **CORS Errors**

   - Verify CORS_ORIGIN matches frontend URL
   - Check for trailing slashes in URLs
   - Ensure credentials are properly configured

4. **Database Connection Issues**

   - Verify DATABASE_URL format
   - Check Supabase service status
   - Ensure RLS policies are correctly configured

5. **AI Service Issues**
   - Verify Hugging Face token is valid
   - Check model access permissions
   - Monitor memory usage (models are large)

### Debug Commands

```bash
# Check service status
railway status

# View logs
railway logs --tail

# Test API endpoints
curl -v https://your-api.railway.app/health

# Check environment variables
railway variables
```

## Rollback Procedures

### Frontend Rollback

```bash
# Vercel automatic rollback
vercel rollback

# Or redeploy previous version
vercel --prod
```

### Backend/AI Service Rollback

```bash
# Railway rollback to previous deployment
railway rollback

# Or redeploy from specific commit
git checkout <previous-commit>
railway up
```

## Maintenance

### Regular Tasks

1. **Update Dependencies**

   ```bash
   npm update
   pip install --upgrade -r requirements.txt
   ```

2. **Security Updates**

   ```bash
   npm audit fix
   safety check
   ```

3. **Database Maintenance**

   - Monitor Supabase usage
   - Review and optimize queries
   - Update RLS policies as needed

4. **Performance Monitoring**
   - Review application metrics
   - Monitor response times
   - Check error rates

### Backup Procedures

1. **Database Backups**: Automated by Supabase
2. **Code Backups**: Stored in Git repository
3. **Environment Variables**: Document in secure location

## Support and Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

For issues specific to JamMatch deployment, check the troubleshooting section or review the application logs.
