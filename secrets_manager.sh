#!/usr/bin/env bash


# script to create a secret in google secrets manager
if [ $# -ne 2 ]; then
    echo "Usage: $0 <key> <value>"
    exit 1
fi

key=$1
value=$2

gcloud secrets create $key --replication-policy="automatic"
echo -n "$value" | gcloud secrets versions add $key --data-file=-

echo "Secret created successfully"

exit 0