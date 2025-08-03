
# Get the Cloud Build service account email
export PROJECT_NUMBER=$(gcloud projects describe fs-alert-d4f21 --format="value(projectNumber)")
export CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant required permissions
gcloud projects add-iam-policy-binding fs-alert-d4f21 \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding fs-alert-d4f21 \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/iam.serviceAccountUser"

if [ $? -eq 0 ]; then 
    gcloud builds triggers create github \
      --repo-name=FX-alert \
      --repo-owner=Dilly3 \
      --branch-pattern="^main$" \
      --build-config=cloudbuild.yaml \
      --project=fs-alert-d4f21
echo "deploying"

else 
  echo "failed to grant permission"
exit 127
fi

exit 0