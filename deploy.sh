#! /usr/bin/env bash
declare PROJECT_NAME
declare WORK_DIR="$(dirname "$(readlink -f $0)")"
declare FOLDER_NAME="${WORK_DIR##*/}"
if [ -z "$1" ]; then
    PROJECT_NAME="$(echo "${FOLDER_NAME}" | tr '[:upper:]' '[:lower:]')"
else
    PROJECT_NAME="$(echo "${1}" | tr '[:upper:]' '[:lower:]')"
fi

echo "deploying to $PROJECT_NAME"

# Try deployment with buildpacks first (more reliable)
echo "Attempting deployment with buildpacks..."
gcloud run deploy $PROJECT_NAME --source . --region us-west1 --allow-unauthenticated --platform managed --timeout=900


echo "deployed to $PROJECT_NAME"

exit 0

# gcloud run deploy $PROJECT_NAME --source . --region us-west1 --allow-unauthenticated --platform managed --timeout=300 --set-secrets=TOPIC_ID=TOPIC_ID:latest --set-secrets=PROJECT_ID=PROJECT_ID:latest