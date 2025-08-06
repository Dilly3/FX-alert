#!/usr/bin/env bash

set -e  # Exit on any error

echo "🧹 Cleaning up Docker resources..."

# Remove all unused volumes
docker volume prune -f

# Remove all unused containers, networks, images (both dangling and unreferenced), and optionally, volumes
#docker system prune -af --volumes

# Alternative: More selective cleanup (uncomment if you prefer)
 docker container prune -f
# docker image prune -af
docker network prune -f

echo "✅ Docker cleanup completed"

echo "🔐 Authenticating Docker with GCR..."
# Authenticate Docker with GCR
gcloud auth configure-docker

echo "🏗️ Building Docker image..."
# Build locally
docker build -f Dockerfile.dev -t gcr.io/fs-alert-d4f21/fx-alert:$(git rev-parse HEAD) .

echo "📤 Pushing image to GCR..."
# Push manually
docker push gcr.io/fs-alert-d4f21/fx-alert:$(git rev-parse HEAD)

echo "🚀 Deploying to Cloud Run..."
# Deploy manually
gcloud run deploy fx-alert \
  --image gcr.io/fs-alert-d4f21/fx-alert:$(git rev-parse HEAD) \
  --region us-west1 \
  --allow-unauthenticated \
  --platform managed \
  --vpc-connector projects/fs-alert-d4f21/locations/us-west1/connectors/fx-alert-vpc-connector \
  --vpc-egress private-ranges-only \
  --memory 256Mi \
  --cpu 1 \
  --timeout 300 \
  --min-instances 0 \
  --max-instances 2 \
  --concurrency 80 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=fs-alert-d4f21,ENV=prod

echo "✅ Deployment completed successfully!"

# Optional: Show final Docker resource usage
echo "📊 Current Docker resource usage:"
docker system df