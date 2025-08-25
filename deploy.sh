#! /usr/bin/env bash


# deploy.sh is used to build image of the application
# and push to container registry in Google Cloud and ,
# deploy to Cloud Run using terraform.
# Google Cloud Project ID is required.


######################## SETUP  #################################
#################################################################
declare GOOGLE_CLOUD_PROJECT
# Determine project name
declare PROJECT_NAME
declare WORK_DIR="$(dirname "$(readlink -f $0)")"
declare FOLDER_NAME="${WORK_DIR##*/}"

PROJECT_NAME="$(echo "${FOLDER_NAME}" | tr '[:upper:]' '[:lower:]')"
declare REGISTRY_NAME="fx-alert-registry"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            echo " run: $0 -p <project-ID>"
exit 0;
            ;;
        -p|--project)
            GOOGLE_CLOUD_PROJECT="$2"
            shift 2
            ;;
        *)
            echo " run: $0 -p <project-ID>"
exit 0;
            ;;
    esac
done

# Prompt for missing required values
if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    read -p "Enter project ID: " GOOGLE_CLOUD_PROJECT
fi

######################## BUILD IMAGE ############################
#################################################################
echo "👷👷👷 Building application... ⏳"
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build completed successfully"
echo ""

IMAGE="us-west2-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/${REGISTRY_NAME}/${PROJECT_NAME}:latest"
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
echo "👷👷👷 Configuring Docker authentication for Artifact Registry... ⏳"
echo ""
gcloud auth configure-docker us-west2-docker.pkg.dev
if [[ $? -ne 0 ]]; then
    echo "Failed to configure Docker authentication ❌❌ "
    exit 1
fi
echo "✅✅ Docker authentication configured successfully"
echo ""

######################## PUSH IMAGE #############################
#################################################################
echo "Pushing Docker image to Artifact Registry... ⏳"
docker push $IMAGE
if [[ $? -ne 0 ]]; then
    echo "Docker push failed ❌❌ "
    exit 1
fi
echo "✅✅ Docker push completed successfully"
echo ""
echo "👷👷👷 Deploying application to Cloud Run... ⏳"
echo "1"
echo "2"
echo "3.....⏰⏰"

######################## DEPLOY #################################
#################################################################
cd terraform/cloud-run
terraform init
if [[ $? -ne 0 ]]; then
    echo "Terraform init failed ❌❌ "
    exit 1
fi
echo "✅✅ Terraform init completed successfully"
echo ""
echo "👷👷👷 Applying Terraform configuration... ⏳"
echo ""
terraform apply -var-file="variables.auto.tfvars"

if [[ $? -ne 0 ]]; then
    echo "Terraform apply failed ❌❌ "
    exit 1
fi
echo "✅✅ Terraform apply completed successfully"
echo ""
echo "✅✅ Application deployed successfully to Cloud Run!"
echo ""
echo "✅✅ Build and deployment process completed successfully!"