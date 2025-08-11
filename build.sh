#! /usr/bin/env bash


# build.sh is used to build image of the application
# and push to container registry in Google Cloud.
# Google Cloud Project ID is required.

declare GOOGLE_CLOUD_PROJECT
# Determine project name
declare PROJECT_NAME
declare WORK_DIR="$(dirname "$(readlink -f $0)")"
declare FOLDER_NAME="${WORK_DIR##*/}"

PROJECT_NAME="$(echo "${FOLDER_NAME}" | tr '[:upper:]' '[:lower:]')"
declare REGISTRY_NAME="${PROJECT_NAME}-registry"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            echo "  $0 -p <project-ID>"
            ;;
        -p|--project)
            GOOGLE_CLOUD_PROJECT="$2"
            shift 2
            ;;
        *)
            echo "  $0 -p <project-ID>"
            ;;
    esac
done

# Prompt for missing required values
if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    read -p "Enter project ID: " GOOGLE_CLOUD_PROJECT
fi

# Build the application
echo "👷👷 Building application... ⏳"
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build completed successfully"
echo ""

IMAGE="us-west1-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/${REGISTRY_NAME}/${PROJECT_NAME}:latest"
docker build -t $IMAGE .
echo "Building Docker image: $IMAGE"
if [[ $? -ne 0 ]]; then
    echo "Docker build failed ❌❌ "
    exit 1
fi
echo "✅✅ Docker build completed successfully"
echo ""
echo " 🚨🚨🚨🚨IMAGE: $IMAGE"
echo ""
echo "Configuring Docker authentication for Artifact Registry... ⏳"
echo ""
gcloud auth configure-docker us-west1-docker.pkg.dev
if [[ $? -ne 0 ]]; then
    echo "Failed to configure Docker authentication ❌❌ "
    exit 1
fi
echo "✅✅ Docker authentication configured successfully"
echo ""
echo "Pushing Docker image to Artifact Registry... ⏳"
docker push $IMAGE
if [[ $? -ne 0 ]]; then
    echo "Docker push failed ❌❌ "
    exit 1
fi
echo "✅✅ Docker push completed successfully"