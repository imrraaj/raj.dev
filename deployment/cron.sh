#!/bin/bash

# Get the full path of the current working directory
CURRENT_DIR=$(pwd)

#!/bin/bash

# Get the full path of the current working directory
CURRENT_DIR=$(pwd)

# Function to repeatedly run the task every 10 seconds
run_every_10_seconds() {
    while true; do
        echo "$(date +"%d %b %Y %H:%M:%S"): Running onpull.sh"
        ${CURRENT_DIR}/onpull.sh >> ${CURRENT_DIR}/deployment.log 2>&1
        sleep 30
    done
}

# Run the function for testing purposes
# run_every_10_seconds


# ---------------
# Define your cron job with the full path
CRON_JOB="* * * * * ${CURRENT_DIR}/onpull.sh >> ${CURRENT_DIR}/deployment.log 2>&1"

# Backup existing crontab
crontab -l > mycron.bak 2>/dev/null

# Add the new cron job
{
    crontab -l 2>/dev/null
    echo "$CRON_JOB"
} | crontab -

echo "Cron job added successfully."
