#!/bin/bash
cd "$(dirname "$0")"
echo "=================================================="
echo " Starting Localhost Server for Bible Project...   "
echo "=================================================="
echo ""
# Open the browser in the background after 1 second
(sleep 1 && open "http://localhost:8000") &
python3 -m http.server 8000
