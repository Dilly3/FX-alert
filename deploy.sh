#! /usr/bin/env bash

declare GOOGLE_CLOUD_PROJECT=$1
declare ENV=$2

read -p "Enter project ID: " GOOGLE_CLOUD_PROJECT
read -p "Enter project Environment- prod or dev: " ENV


declare PROJECT_NAME
declare WORK_DIR="$(dirname "$(readlink -f $0)")"
declare FOLDER_NAME="${WORK_DIR##*/}"
if [ -z "$1" ]; then
    PROJECT_NAME="$(echo "${FOLDER_NAME}" | tr '[:upper:]' '[:lower:]')"
else
    PROJECT_NAME="$(echo "${1}" | tr '[:upper:]' '[:lower:]')"
fi

echo "deploying to $PROJECT_NAME"

echo "deployment with buildpacks..."
gcloud run deploy $PROJECT_NAME --source . --region us-west1 --allow-unauthenticated --platform managed \
  --vpc-connector=projects/fs-alert-d4f21/locations/us-west1/connectors/fs-alert-vpc-connector \
  --vpc-egress=private-ranges-only \
  --region=us-west1 \
  --memory=128Mi \
  --cpu=1 \
  --timeout=3000 \
  --max-instances=2 --set-env-vars GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT \
  --set-env-vars ENV=$ENV \
  --region us-west1 \
  --allow-unauthenticated


echo "deployed to $PROJECT_NAME"

exit 0
