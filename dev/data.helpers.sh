#!/usr/bin/env bash

function get_videos() {
    local endpoint="${1}"
    local bearer_header="${2}"
    videos=$(curl -s -X GET "$endpoint" \
        --header "$bearer_header" \
        --header "Content-Type: application/json")

    echo "$videos" | jq -r ".[0]"
}


function create_video() {
    local endpoint="${1}"
    local bearer_header="${2}"
    local title="${3}"
    local description="${4}"

    echo "$title"
    echo "$endpoint"

    local payload=$(jq -n \
        --arg t "$title" \
        --arg d "$description" \
        '{title: $t, description: $d}' \
    ) 
    response=$(curl -s -X POST "$endpoint" \
    --header "$bearer_header" \
    --header "Content-Type: application/json" \
    -d "$payload") 

    video_id=$(echo "$response" | jq -r ".id")
}

# WIP - uploading a video (currently: validating arguments)
function upload_video_file() {
    local endpoint="${1}"
    local bearer_header="${2}"
    local localFilePath="${3}"

    if [ -z "$endpoint" ]; then
        log "ℹ️  Required endoint missing."
    fi

    if [ -z $bearer ]; then
        log "ℹ️  Required bearer missing."
    fi

    if [ -z $localFilePath ]; then
        log "ℹ️  Absolute File path from the project missing bearer missing."
    fi

}