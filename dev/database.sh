#!/usr/bin/env bash
# WIP - tools to check sqlite db used and/or query
source ./dev/utils.sh

log "OS: $OSTYPE"
linux_based_identifiers=(darwin linux windows)
for os_like in "${linux_based_identifiers[@]}"; do
    log "$os_like" =~ "$OSTYPE" && true || false
done;


# Check sqlite3 availability
check_sqlite () {
    if ! command -v sqlite3 --version; then
        log "[ SQLITE ] not set;"
        brew install sqlite3
    fi
}