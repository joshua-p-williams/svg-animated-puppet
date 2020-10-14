#!/bin/bash

# Give 30 seconds for the puppet-service to start
sleep 30

# Start chromium up in full screen kiosk mode
/usr/bin/chromium-browser --check-for-update-interval=31536000 --incognito --kiosk http://localhost:8080/bot
