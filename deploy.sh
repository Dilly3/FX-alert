#!/usr/bin/env bash

# Show help function
show_help() {
    echo "Usage: $0 [OPTIONS] [PROJECT_NAME]"
    echo ""
    echo "Deploy a Node.js application to Google Cloud Run"
    echo ""
    echo "ARGUMENTS:"
    echo "  PROJECT_NAME          Name of the Cloud Run service (default: folder name in lowercase)"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help           Show this help message and exit"
    echo "  -p, --project ID     Google Cloud Project ID (will prompt if not provided)"
    echo "  -e, --env ENV        Environment (prod/dev/sandbox) (will prompt if not provided)"
    echo "  -m, --memory MEMORY  Memory limit (128Mi, 256Mi, 512Mi, 1Gi) (will prompt if not provided)"
    echo "  -r, --region REGION  Region (us-west1, us-central1, us-east1) (will prompt if not provided)"
    echo "  -c, --cpu CPU       CPU limit (1, 2, 4) (will prompt if not provided)"
    echo "  -mxi, --max-instances MAX_INSTANCES  Max instances (1, 2, 3, 4, 5, 6 ...) (will prompt if not provided)"

    echo "EXAMPLES:"
    echo "  $0 -p my-project-ID -e prod -m 512Mi -c 2 -mxi 4 -r us-west1   # Set project and env"
    echo "  $0 -p my-project -e prod -m 512Mi -c 2 -mxi 4 -r us-west1   # Set project and env"
    echo ""
    echo "ENVIRONMENT VARIABLES:"
    echo "  The script will set these environment variables in Cloud Run:"
    echo "    GOOGLE_CLOUD_PROJECT - Your GCP project ID"
    echo "    ENV                  - Environment (prod/dev/sandbox)"
    echo "    MEMORY               - Memory limit (128Mi, 256Mi, 512Mi, 1Gi)"
    echo "    CPU                  - CPU limit (1, 2, 4)"
    echo "    MAX_INSTANCES        - Max instances (1, 2, 3,4,5 ..) number "
    echo "    REGION               - Region (us-west1, us-central1, us-east1)"
    echo ""
    echo "REQUIREMENTS:"
    echo "  - gcloud CLI installed and authenticated"
    echo "  - npm installed"
    echo "  - package.json with 'build' script"
    echo ""
    exit 0
}

validate_memory() {
    case "$1" in
        128Mi|256Mi|512Mi|1Gi)
            return 0
            ;;
        *)
            echo "Error: Memory must be one of: 128Mi, 256Mi, 512Mi, 1Gi"
            exit 1
            ;;
    esac
}

validate_cpu() {
    case "$1" in
        1|2|4)
            return 0
            ;;
        *)
            echo "Error: CPU must be one of: 1, 2, 4"
            exit 1
            ;;
    esac
}

validate_max_instances() {
    if ! [[ "$1" =~ ^[0-9]+$ ]]; then
        echo "Error: Max instances must be a positive integer"
        exit 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            ;;
        -p|--project)
            GOOGLE_CLOUD_PROJECT="$2"
            shift 2
            ;;
        -e|--env)
            ENV="$2"
            shift 2
            ;;
        -m|--memory)
            validate_memory "$2"
            MEMORY="$2"
            shift 2
            ;;
        -c|--cpu)
            validate_cpu "$2"
            CPU="$2"
            shift 2
            ;;
        -mxi|--max-instances)
            validate_max_instances "$2"
            MAX_INSTANCES="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        *)
        show_help
    esac
done

# Prompt for missing required values
if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    read -p "Enter project ID: " GOOGLE_CLOUD_PROJECT
fi

if [ -z "$ENV" ]; then
    read -p "Enter project Environment- prod/dev/sandbox: " ENV
fi

if [ -z "$MEMORY" ]; then
    read -p "Enter memory limit (128Mi, 256Mi, 512Mi, 1Gi): " MEMORY
fi
if [ -z "$CPU" ]; then
    read -p "Enter CPU limit (1, 2, 4): " CPU
fi

if [ -z "$MAX_INSTANCES" ]; then
    read -p "Enter max instances (1, 2, 3, 4, 5, 6 ...): " MAX_INSTANCES
fi

if [ -z "$REGION" ]; then
    read -p "Enter region (us-west1, us-central1, us-east1): " REGION
fi

# Validate environment
if [[ ! "$ENV" =~ ^(prod|dev|sandbox)$ ]]; then
    echo "Error: Environment must be 'prod', 'dev', or 'sandbox'"
    exit 1
fi

validate_memory "$MEMORY"
validate_cpu "$CPU"
validate_max_instances "$MAX_INSTANCES"


# Determine project name
declare PROJECT_NAME
declare WORK_DIR="$(dirname "$(readlink -f $0)")"
declare FOLDER_NAME="${WORK_DIR##*/}"

PROJECT_NAME="$(echo "${FOLDER_NAME}" | tr '[:upper:]' '[:lower:]')"

# Display deployment info
echo "================================"
echo "Deployment Configuration:"
echo "  Service Name 🟢: $PROJECT_NAME"
echo "  Project ID 🟢: $GOOGLE_CLOUD_PROJECT"
echo "  Environment 🟢: $ENV"
echo "  Region 🟢: ${REGION:-us-west1}"
echo "  Memory 🟢: ${MEMORY:-256Mi}"
echo "  CPU 🟢: ${CPU:-1}"
echo "================================"
echo ""

# Build the application
echo "👷👷 Building application... ⏳"
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build completed successfully"
echo ""

# Deploy to Cloud Run
echo "🚀 Deploying to $PROJECT_NAME..."
echo "⏳ Deployment takes up to 10mins...🕣 "
echo "🛠️ Using buildpacks for deployment ⏩⏩⏩ "

gcloud run deploy $PROJECT_NAME \
  --source . \
  --region ${REGION:-us-west1} \
  --allow-unauthenticated \
  --platform managed \
  --vpc-connector=projects/fs-alert-d4f21/locations/us-west1/connectors/fx-alert-vpc-connector \
  --vpc-egress=private-ranges-only \
  --memory=${MEMORY:-256Mi} \
  --cpu=${CPU:-1} \
  --timeout=300 \
  --min-instances=0 \
  --max-instances=${MAX_INSTANCES:-2} \
  --concurrency=80 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT \
  --set-env-vars ENV=$ENV

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully deployed to $PROJECT_NAME"
else
    echo ""
    echo "❌ Deployment failed"
    exit 1
fi

exit 0