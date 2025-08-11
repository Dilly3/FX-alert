#! /usr/bin/env bash


# Show help function
show_help() {
    echo "Usage: $0 [OPTIONS] [PROJECT_NAME]"
    echo ""
    echo "Update Google Cloud Run service"
    echo ""
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help           Show this help message and exit"
    echo "  -m, --memory         Memory limit (128Mi, 256Mi, 512Mi, 1Gi)"
    echo "  -c, --cpu            CPU Allocation (1, 2, 4)"
    echo "  -r, --region         Region (default: us-west1)"
    echo ""
    echo "EXAMPLES:"
    echo "  $0 -m 256Mi -r us-central1 -c 2"
    echo "  $0 -m 512Mi"
    echo ""

    exit 0
}

# Check for help flags
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    show_help
fi

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

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            ;;
        -r|--region)
            REGION="$2"
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
        *)
        show_help
    esac
done



declare PROJECT_NAME
declare WORK_DIR="$(dirname "$(readlink -f $0)")"
declare FOLDER_NAME="${WORK_DIR##*/}"
PROJECT_NAME="$(echo "${FOLDER_NAME}" | tr '[:upper:]' '[:lower:]')"


echo " 🚀 Updating Cloud Run service: ⏩⏩ "
echo "⏳⏳ Update takes few minutes: ⏩⏩ "
echo "  Service 🟢: $PROJECT_NAME"
echo "  Memory 🧠: ${MEMORY:-256Mi}"
echo "  Region 🌍: ${REGION:-us-west1}"
echo "  CPU 💻: ${CPU:-1}"
echo ""

gcloud run services update $PROJECT_NAME \
  --memory=${MEMORY:-256Mi} \
  --region=${REGION:-us-west1} \
  --cpu=${CPU:-1} \
  --timeout=300 \
  --min-instances=0 \
  --max-instances=2 \
  --concurrency=80

echo "Update completed! ✅"