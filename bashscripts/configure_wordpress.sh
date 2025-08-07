#!/bin/bash

# --- Wordpress Configuration Script ---
# --- Written By: Freddy Seow ---
#
# This script automates the WordPress configurations and installs CiviCRM for a new site environment.

# Usage:
#   ./configure_wordpress.sh <Subdomain> <SiteTitle> [username email role password ...]
#


set -e
# --- Load Global & Site Environment ---
if [ ! -f .env ]; then echo "❌ Error: Global .env file not found." >&2; exit 1; fi
set -a; source .env; set +a
if [ "$#" -lt 2 ]; then
    echo "❌ Error: Incorrect arguments. Usage: $0 <subdomain> <site_title> [username email role password ...]" >&2
    exit 1
fi
SUBDOMAIN=$1
SITE_TITLE=$2
SITE_ENV_FILE="/var/www/html/${SUBDOMAIN}.${DOMAIN_NAME}/.env"
if [ ! -f "$SITE_ENV_FILE" ]; then echo "❌ Error: Site .env file not found at $SITE_ENV_FILE." >&2; exit 1; fi
source "$SITE_ENV_FILE"

# --- Main Execution ---
echo "🚀 (3/4) Starting WordPress Configuration for '$SUBDOMAIN'..."
cd "$SITE_DIR"

# --- Core WordPress Settings ---
echo "   - Configuring core WordPress settings..."
docker-compose exec -T -u www-data wordpress wp option update timezone_string "Asia/Singapore"
docker-compose exec -T -u www-data wordpress wp option update comment_registration 1
docker-compose exec -T -u www-data wordpress wp rewrite structure '/%postname%/' --hard

# --- Theme Installation ---
echo "   - Installing and activating Astra theme..."
docker-compose exec -T -u www-data wordpress wp theme install astra --activate

# --- User Creation ---
echo "   - Creating fixed user accounts..."
docker-compose exec -T -u www-data wordpress wp user create cron cron@octopus8.com --role=administrator --user_pass=UuIjCcMjzT5VEU4PwlJ7f
docker-compose exec -T -u www-data wordpress wp user create generalo8 general@octopus8.com --role=administrator --user_pass=Welcome2O81!

# --- Dynamic user creation from API ---
# Arguments after the first are users: username email role password (repeat)
if [ "$#" -gt 2 ]; then
    shift 2 # remove subdomain and site_title
    while [ "$#" -ge 4 ]; do
        USERNAME="$1"; EMAIL="$2"; ROLE="$3"; PASSWORD="$4"
        if [ -z "$PASSWORD" ]; then
            PASSWORD=$(openssl rand -hex 8)
        fi
        echo "   - Creating user $USERNAME <$EMAIL> with role $ROLE"
        docker-compose exec -T -u www-data wordpress wp user create "$USERNAME" "$EMAIL" --role="$ROLE" --user_pass="$PASSWORD"
        shift 4
    done
fi

# --- Install and Configure SMTP Plugin ---
echo "Installing and configuring WP Mail SMTP plugin..."
docker-compose exec -T -u www-data wordpress wp plugin install wp-mail-smtp --activate

# Create JSON configuration for SendGrid settings
SMTP_CONFIG=$(cat <<EOF
{
    "mail": {
        "from_email": "${FROM_EMAIL}",
        "from_name": "${SITE_TITLE}",
        "mailer": "sendgrid",
        "return_path": false,
        "from_email_force": true,
        "from_name_force": true
    },
    "sendgrid": {
        "api_key": "${SMTP_PASS}",
        "domain": "octopus8.com",
        "from_name": "${SITE_TITLE}",
        "from_email": "${FROM_EMAIL}",
        "force_from_name": true,
        "force_from_email": true,
        "return_path": false
    },
    "general": {
        "do_not_send": false,
        "is_mailer_complete": true
    }
}
EOF
)

echo "   - Configuring WP Mail SMTP settings..."
docker-compose exec -T -u www-data wordpress wp option update wp_mail_smtp --format=json "$SMTP_CONFIG"

# Configure additional required options
docker-compose exec -T -u www-data wordpress wp option update wp_mail_smtp_activated_time "$(date +%s)"
docker-compose exec -T -u www-data wordpress wp option update wp_mail_smtp_mail_key "$(openssl rand -hex 16)"

# Install and activate Elementor
echo "   - Installing and activating Elementor..."
docker-compose exec -T -u www-data wordpress wp plugin install elementor --activate
docker-compose exec -T -u www-data wordpress wp plugin install elementor-pro --activate || true

# --- Import and Configure Front Page ---
echo "   - Setting up front page from template..."
TEMPLATE_JSON="/var/www/html/site-creation-api/templates/pages/elementor-581-2025-08-07.json"

if [ -f "$TEMPLATE_JSON" ]; then
    # Create a new page to hold the template
    PAGE_ID=$(docker-compose exec -T -u www-data wordpress wp post create \
        --post_type=page \
        --post_title='Home' \
        --post_status='publish' \
        --post_content="$(cat $TEMPLATE_JSON)" \
        --porcelain)

    if [ -n "$PAGE_ID" ]; then
        # Set the page as front page
        docker-compose exec -T -u www-data wordpress wp option update show_on_front 'page'
        docker-compose exec -T -u www-data wordpress wp option update page_on_front "$PAGE_ID"
        
        # Add Elementor page settings
        docker-compose exec -T -u www-data wordpress wp post meta update "$PAGE_ID" _elementor_edit_mode builder
        docker-compose exec -T -u www-data wordpress wp post meta update "$PAGE_ID" _elementor_template_type page
        docker-compose exec -T -u www-data wordpress wp post meta update "$PAGE_ID" _wp_page_template elementor_header_footer
        
        echo "✅ Front page created and set successfully (ID: $PAGE_ID)"
    else
        echo "⚠️ Warning: Failed to create front page"
    fi
else
    echo "⚠️ Warning: Template file not found at $TEMPLATE_JSON"
fi


# --- Handle Site Icon Upload ---
if [ "$#" -gt 2 ] && [ -f "$3" ]; then
    echo "   - Setting up site icon from uploaded image..."
    
    # Copy file into container's temp directory
    TEMP_FILE="/tmp/site-icon-$(date +%s).tmp"
    docker-compose cp "$3" "wordpress:$TEMP_FILE"
    
    # Import the media file from container's path
    ICON_ID=$(docker-compose exec -T -u www-data wordpress wp media import "$TEMP_FILE" --porcelain)
    
    if [ -n "$ICON_ID" ]; then
        # Set as site icon
        docker-compose exec -T -u www-data wordpress wp option update site_icon "$ICON_ID"
        docker-compose exec -T -u www-data wordpress wp theme mod set site_icon "$ICON_ID"
        echo "✅ Site icon set successfully (ID: $ICON_ID)"
        
        # Cleanup temp file in container
        docker-compose exec -T wordpress rm -f "$TEMP_FILE"
    else
        echo "⚠️ Warning: Failed to import site icon"
    fi
fi

# --- Copying CiviCRM and admin portal---
SOURCE_SITE_DIR="/var/www/html/test.beavergiver.life"
echo "   - Migrating plugins ..."
if [ ! -d "$SOURCE_SITE_DIR" ]; then
    echo "⚠️ Warning: Source site directory '$SOURCE_SITE_DIR' not found. Skipping plugin migration."
else
    cp -rp "$SOURCE_SITE_DIR/app/wp-content/plugins/civicrm" "$SITE_DIR/app/wp-content/plugins"
    cp -rp "/var/www/html/site-creation-api/templates/portal/admin-portal" "$SITE_DIR/app"
    echo "✅ CiviCRM migrated successfully."
fi

# --- CiviCRM Installation ---
echo "   - Activating CiviCRM plugin..."
docker-compose exec -T -u www-data wordpress wp plugin activate civicrm

echo "   - Installing CiviCRM command-line tool (cv)..."
# The `which` command will fail if `cv` is not in the $PATH.
if ! docker-compose exec -T wordpress which cv > /dev/null 2>&1; then
    docker-compose exec -T wordpress curl -LsS https://download.civicrm.org/cv/cv.phar -o /usr/local/bin/cv
    docker-compose exec -T wordpress chmod +x /usr/local/bin/cv
    echo "     - cv installed successfully."
else
    echo "     - cv is already installed."
fi

echo "   - Running CiviCRM core installer..."
docker-compose exec -T -u www-data wordpress cv core:install --cms-base-url="$FULL_URL" --lang="en_US"

echo "  - Installing & Activating CiviCRM extensions..."
cp -rp "$SOURCE_SITE_DIR/app/wp-content/uploads/civicrm/ext/"* "$SITE_DIR/app/wp-content/uploads/civicrm/ext"
cp -rp "/var/www/html/site-creation-api/templates/portal/com.octopus8.adminportalconfig" "$SITE_DIR/app/wp-content/uploads/civicrm/ext"
docker-compose exec -T -u www-data wordpress cv en theisland
docker-compose exec -T -u www-data wordpress cv en com.octopus8.adminportalconfig


echo "✅ (3/4) WordPress configuration and CiviCRM installation finished."
