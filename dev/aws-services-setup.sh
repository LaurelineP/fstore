#!/bin/sh
source ./dev/utils.sh
source ./dev/app-data.sh



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
BEARER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0dWJlbHktYWNjZXNzIiwic3ViIjoiMmUzNWViMDktMThlMi00ZmIwLTgyNWMtODRmOWFkM2VlMzUxIiwiaWF0IjoxNzU3NjM4MzAyLCJleHAiOjQzNDk2MzgzMDJ9.jBFRdx6MFrCv5ClepzznhsN0Ueii4eu60TxSl5kf064
S3_BUCKET_NAME="tubely-private-000042"

# ------------------------------- UNCHEAGEABLES ------------------------------ #

# AWS - configuration related
IAM_USERNAME="localstack-user"

# Web application - credential details
EMAIL="admin@tubely.com"
PASSWORD="password"

# Web application - server related
APP_SERVER="http://localhost:8091"
BEARER_AUTHORIZATION="Authorization: Bearer $BEARER_TOKEN"

# Script context relateds
SCRIPT_DIR="$(pwd)"




# ---------------------------------------------------------------------------- #
#                                 TOOLS LOADING                                #
# ---------------------------------------------------------------------------- #

# 1. Use "aws-shim" command when "aws" is executed ( "aws" with arguments "endpoint-url" & profile )
if ! command -v aws | grep -q 'aws-shim'; then
    source ./dev/.envrc
fi
log "[ AWS-SHIM ] Command \"aws\" correctly pointing to \"aws-shim\"."



# ---------------------------------------------------------------------------- #
#                           EXPECTED REQUIREMENTS AWS                          #
# ---------------------------------------------------------------------------- #
# Users, Roles, Permissions and Policies, Groups, Buckers ...


# 1. IAM User 
if ! aws iam list-users --no-cli-pager | grep -q $IAM_USERNAME; then
    aws iam create-user --user-name localstack-user
fi
log "[ IAM - USER ] Using AWS with IAM User \"$IAM_USERNAME\"."

# 2. Sets S3 bucket to used if does not exist
BUCKET_S3_LS=$(aws s3 ls)
if [ -z "$BUCKET_S3_LS" ]; then
    log "[ S3 ] Bucket creation..."
    aws s3 mb "$S3_BUCKET_NAME"
fi
log "[ S3 ] Bucket \"$S3_BUCKET_NAME\" in use."


# # 3. Group
# aws create-group --group-name=managers
if ! aws iam list-groups --no-cli-pager | grep -q "managers"; then
    aws iam create-group --group-name "managers"
fi
log "[ IAM - GROUP ] Group \"managers\" in use."

# 4. Set Group policy
aws iam attach-group-policy --group-name managers --policy-arn arn:aws:iam::aws:policy/AdministratorAccess --no-cli-pager
log "[ AWS - GROUPS ] Group Manager policy available:"



# 5. TODO: Attaches User to Group Policy

# 6. Upload a video

# Provide first video
get_videos \
    "$APP_SERVER/api/videos"  \
    "$BEARER_AUTHORIZATION" \

create_video \
    "$APP_SERVER/api/videos"  \
    "$BEARER_AUTHORIZATION" \
    "Video test" \
    "Video from shell script" \

