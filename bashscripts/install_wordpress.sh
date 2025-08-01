#!/bin/bash

# --- Wordpress Installation Script ---
# --- Written By: Freddy Seow ---
#
# This script automates the WordPress Installer for a new site environment.

# Usage:
#   ./install-wordpress.sh <Subdomain> <"Site Title"> <admin_user> <admin_email>
#

set -e
# --- Load Global & Site Environment ---
if [ ! -f .env ]; then echo "❌ Error: Global .env file not found." >&2; exit 1; fi
set -a; source .env; set +a
if [ "$#" -ne 4 ]; then echo "❌ Error: Incorrect arguments." >&2; exit 1; fi
SUBDOMAIN=$1; SITE_TITLE=$2; ADMIN_USER=$3; ADMIN_EMAIL=$4
SITE_ENV_FILE="/var/www/html/${SUBDOMAIN}.${DOMAIN_NAME}/.env"
if [ ! -f "$SITE_ENV_FILE" ]; then echo "❌ Error: Site .env file not found at $SITE_ENV_FILE." >&2; exit 1; fi
source "$SITE_ENV_FILE"

# --- Main Execution ---
echo "🚀 (2/4) Starting WordPress Installation for '$SUBDOMAIN'..."
cd "$SITE_DIR"

echo "⏳ Waiting for WordPress container to be ready..."
until docker-compose exec -T wordpress curl -sSf http://localhost/wp-admin/install.php > /dev/null; do
    echo -n "."; sleep 5
done

echo -e "\n⚙️ WordPress container is ready. Configuring..."

# Check if wp-cli is installed and install it if it's not.
# The `which` command will fail if `wp` is not in the $PATH.
if ! docker-compose exec -T wordpress which wp > /dev/null 2>&1; then
    echo "   - wp-cli not found. Installing it now..."
    docker-compose exec -T wordpress curl -o /tmp/wp-cli.phar https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
    docker-compose exec -T wordpress chmod +x /tmp/wp-cli.phar
    # Use sudo to move the file into a directory that is in the system's PATH
    docker-compose exec -T wordpress mv /tmp/wp-cli.phar /usr/local/bin/wp
    echo "   - wp-cli installed successfully."
fi

# Check if WordPress is already installed to prevent re-installation
if docker-compose exec -T -u www-data wordpress wp core is-installed; then
    echo "⚠️ WordPress is already installed on '$SUBDOMAIN'. Skipping installation."
    exit 0
fi

echo "   - Installing WordPress..."
docker-compose exec -T -u www-data wordpress wp core install \
  --url="$FULL_URL" \
  --title="$SITE_TITLE" \
  --admin_user="$ADMIN_USER" \
  --admin_password="$ADMIN_PASSWORD" \
  --admin_email="$ADMIN_EMAIL" \
  --skip-email

echo "✅ (2/4) WordPress installed successfully."
echo "URL: $FULL_URL"
echo "Admin User: $ADMIN_USER"
echo "Admin Password: $ADMIN_PASSWORD"