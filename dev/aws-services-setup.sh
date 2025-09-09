#!/bin/sh

# USING LOCALSTACK
#       Localstack is a cloud emulator allowing to use Cloud Services Locally
#       Relying on docker container provided by localstack and the freemium access,
#       any stopped instances looses the content stored while building or app.
#
#       If that is the case, the following should ensure to have the datastorage access 
#       and data provision are correctly set to keep being on-phase with the current project development.
#
#
#       Requirements:
#           - LocalStack mounted :
#             - either using the LocalStack CLI ( where the container is shodowed )
#             - either using the LocalStack Desktop ( where the container is exposed with the LocalStack Desktop Application )
#           - Bearer to set in the Authorization header for the consumption of the APIs 
#             - Update your BEARER_TOKEN if needed / Leave the BEARER_AUTHORIZATION as it
BEARER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0dWJlbHktYWNjZXNzIiwic3ViIjoiMmUzNWViMDktMThlMi00ZmIwLTgyNWMtODRmOWFkM2VlMzUxIiwiaWF0IjoxNzU3MTc2NzIwLCJleHAiOjQzNDkxNzY3MjB9.7rM6GL0lgAtqV8F0ZpNjlKqHnMOHjYl_TayY0nnsBCw


# ----------------------- SCRIPT BASIC SCRIPT VARIABLES ---------------------- #
BEARER_AUTHORIZATION="Authorization: Bearer $BEARER_TOKEN"
SCRIPT_DIR="$(pwd)"
APP_SERVER=http://localhost:8091



# ---------------------------------------------------------------------------- #
#                                 STORAGE SETUP                                #
# ---------------------------------------------------------------------------- #
# 1. Ensures to use aws command with the aws-shim (wrapper to run aws with local cloud emulator)
source ./dev/.envrc

# 2. Creates a S3 bucket (here called "tubely-000042")
BUCKET_S3_LS=$(aws s3 ls)
if [ -z "$BUCKET_S3_LS" ]; then
    echo "  • Bucket creation..."
    aws s3 mb tubely-000042 2>/dev/null || echo "  • Bucket already setup"
else
    echo "  • Existing bucket(s): $BUCKET_S3_LS, skipping bucket creation.\n"
fi


# ---------------------------------------------------------------------------- #
#                           DATA PROVISIONNING SETUP                           #
# ---------------------------------------------------------------------------- #
# 3. Provision your DB with the first Object Storage set in the app development
# Note: "jq -r" will print out in a pretty way the JSON response 
# curl -X GET "$APP_SERVER/api/videos"

echo "  • Posting a video to store in bucket: $BUCKET_S3_LS.\n"

CURRENT_VIDEO_ID="df654618-23c5-48a4-886b-bb15bcdab413"
# Posting video mp4
curl -X POST "$APP_SERVER/api/video_upload/$CURRENT_VIDEO_ID" \
    --header "$BEARER_AUTHORIZATION" \
    -F "video=@$SCRIPT_DIR/samples/boots-video-vertical.mp4" \
    | jq -r
