#!/bin/bash

# --- Setup Cron Job Script ---
# --- Written By: Freddy Seow ---
# Adds a system cron job to reliably trigger CiviCRM cron events
# using the wget method with the site key.
#
# Usage:
#   ./setup-cron.sh <subdomain>

set -e
# --- Load Global & Site Environment ---
if [ ! -f .env ]; then echo "❌ Error: Global .env file not found." >&2; exit 1; fi
set -a; source .env; set +a
if [ -z "$1" ]; then echo "❌ Error: No subdomain provided." >&2; exit 1; fi
SUBDOMAIN=$1
SITE_ENV_FILE="/var/www/html/${SUBDOMAIN}.${DOMAIN_NAME}/.env"
if [ ! -f "$SITE_ENV_FILE" ]; then echo "❌ Error: Site .env file not found at $SITE_ENV_FILE." >&2; exit 1; fi
source "$SITE_ENV_FILE"

# --- Main Execution ---
echo "🚀 (4/4) Setting up Cron Job for '$SUBDOMAIN'..."
cd "$SITE_DIR"

# Define the path to the CiviCRM settings file
CIVICRM_SETTINGS_FILE="${SITE_DIR}/app/wp-content/uploads/civicrm/civicrm.settings.php"

# Extract the site key from civicrm.settings.php
if [ ! -f "$CIVICRM_SETTINGS_FILE" ]; then
    echo "❌ civicrm.settings.php not found at $CIVICRM_SETTINGS_FILE" >&2
    exit 1
fi

echo "   - Extracting site key from settings file..."
SITE_KEY=$(grep "define( *'CIVICRM_SITE_KEY'" "$CIVICRM_SETTINGS_FILE" | sed -E "s/.*'CIVICRM_SITE_KEY', *'([^']+)'.*/\1/")

if [ -z "$SITE_KEY" ]; then
    echo "❌ Could not extract CIVICRM_SITE_KEY from $CIVICRM_SETTINGS_FILE" >&2
    exit 1
fi
echo "   - Found Site Key: $SITE_KEY"

CRON_DIR="/home/ubuntu/cron"
CRON_FILE="${CRON_DIR}/cron_${DB_NAME}"
CRON_SYSTEM_FILE="/etc/cron.d/cron_sc"
# Create cron script
cd "$CRON_DIR"

cat <<EOF > "$CRON_FILE"
#!/bin/sh
wget -O - -q -t 1 '${FULL_URL}/wp-content/plugins/civicrm/civicrm/bin/cron.php?name=cron@octopus8.com&pass=UuIjCcMjzT5VEU4PwlJ7f&key=${SITE_KEY}'
EOF

chmod 755 "$CRON_FILE"

echo "✅ Created cron file with key ${SITE_KEY}"

# Add to system cron if not already present
CRON_ENTRY="*/5 * * * * root ${CRON_FILE}"
grep -qxF "$CRON_ENTRY" "$CRON_SYSTEM_FILE" || echo "$CRON_ENTRY" >> "$CRON_SYSTEM_FILE"

echo "✅ (4/4) Cron job setup complete."
