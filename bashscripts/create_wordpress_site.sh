#!/bin/bash

# --- Site Creation Script ---
# --- Written By: Freddy Seow ---
#
# This script automates the initial setup for a new site environment.
# It performs the following actions:
#   1. Validates the provided subdomain.
#   2. Creates a dedicated directory for the site in /var/www/html.
#   3. Finds an unused network port for the Docker container.
#   4. Generates a unique database name and user.
#   5. Generates a secure password for the database.
#   6. Connects to the database and creates the database user
#   7. Creates the docker-compose file and updates nginx config 
#   8. Runs the compose file and starts the newly created container
#
# Usage:
#   sudo ./create_wordpress_site.sh <subdomain>
#
# Prerequisites:
#   - A '.env' file in the same directory with RDS_HOST, RDS_ROOT_USER, RDS_ROOT_PASS, and DOMAIN_NAME variables.
#   - `docker` and `openssl` must be installed.
#   - The script must be executable (`chmod +x setup_site.sh`).

# --- Configuration and Safety Checks ---

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Load Environment Variables ---
# The script expects a .env file in the same directory.
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found. "
    exit 1
fi
set -a
source .env
set +a

# Check if RDS_HOST is set
if [ -z "$RDS_HOST" ]; then
    echo "❌ Error: RDS_HOST is not set in the .env file."
    exit 1
fi

# Check if RDS_ROOT_PASS is set
if [ -z "$RDS_ROOT_PASS" ]; then
    echo "❌ Error: RDS_ROOT_PASS is not set in the .env file."
    exit 1
fi

# Check if RDS_ROOT_USER is set
if [ -z "$RDS_ROOT_USER" ]; then
    echo "❌ Error: RDS_ROOT_USER is not set in the .env file."
    exit 1
fi

# Check if DOMAIN_NAME is set
if [ -z "$DOMAIN_NAME" ]; then
    echo "❌ Error: DOMAIN_NAME is not set in the .env file."
    exit 1
fi


# --- Validate Input ---

# Check for required subdomain argument
if [ -z "$1" ]; then
    echo "❌ Error: No subdomain provided."
    echo "Usage: $0 <subdomain>"
    exit 1
fi

SUBDOMAIN=$1

# Sanitize subdomain to prevent path traversal and invalid characters.
# Allows only lowercase letters, numbers, and hyphens.
if ! [[ "$SUBDOMAIN" =~ ^[a-z0-9-]+$ ]]; then
    echo "❌ Error: Invalid subdomain format."
    echo "Subdomain can only contain lowercase letters, numbers, and hyphens."
    exit 1
fi



# --- Functions ---
is_port_taken() {
    local PORT=$1
    ss -lntu | grep -q ":$PORT" || docker ps --format '{{.Ports}}' | grep -q ":$PORT->"
}

is_subnet_taken() {
    local SUBNET_TO_CHECK=$1
    docker network ls --format '{{.Name}}' | xargs -r docker network inspect -f \
      '{{range .IPAM.Config}}{{.Subnet}}{{end}}' | grep -q "^$SUBNET_TO_CHECK$"
}

find_available_resources() {
    local PORT=${1:-10000}
    while true; do
        if is_port_taken "$PORT"; then
            PORT=$((PORT + 1))
            continue
        fi

        # Derive the third octet from the last three digits of the port.
        local THIRD_OCTET=$(( PORT % 1000 ))

        # Check if the derived octet is a valid IP address component (0-255).
        if [ "$THIRD_OCTET" -gt 255 ]; then
            # Redirect warning to standard error (>&2).
            echo "⚠️ Port $PORT results in an invalid subnet octet ($THIRD_OCTET). Jumping to next valid range..." >&2
            # Jump to the start of the next thousand, where the octet will be valid again (e.g., from 10256 to 11000).
            PORT=$(( ( (PORT / 1000) + 1 ) * 1000 ))
            continue
        fi

        local SUBNET="172.20.${THIRD_OCTET}.0/24"

        if is_subnet_taken "$SUBNET"; then
            # Redirect warning to standard error (>&2).
            echo "⚠️ Port $PORT is free, but derived subnet $SUBNET is taken. Searching for next port..." >&2
            # Since each port likely has a unique subnet now, we only need to increment by one.
            PORT=$((PORT + 1))
            continue
        fi

        # If we reach here, both port and subnet are free
        echo "$PORT $SUBNET"
        return
    done
}

# --- Main Execution ---

echo "🚀 Starting site creation for '$SUBDOMAIN'..."

# 1. Define Site and Database Variables
SITE_DIR="/var/www/html/${SUBDOMAIN}.${DOMAIN_NAME}"
TEMPLATES="/var/www/html/siteautomation"
DB_NAME="api_bg_${SUBDOMAIN//-/_}" # Replace hyphens with underscores for DB name
DB_USER="$DB_NAME"

# --- Check for Duplicate Subdomain ---
if [ -d "$SITE_DIR" ]; then
    echo "❌ Error: Site directory for '$SUBDOMAIN' already exists at $SITE_DIR. Aborting." >&2
    exit 1
fi

# 2. Generate Network and Credentials
echo "🔎 Searching for an available application port and Docker subnet..."
read -r PORT SUBNET <<< "$(find_available_resources)"
echo "✅ Found available application port: $PORT"
echo "✅ Found available subnet: $SUBNET"

# 3. Generate Passwords
echo "🔑 Generating secure passwords..."
DB_PASSWORD=$(openssl rand -hex 16)
ADMIN_PASSWORD=$(openssl rand -hex 12)
echo "✅ Passwords generated."

# 4. Create Site Directory and copy template files
echo "📁 Creating site directory at $SITE_DIR..."
# Use sudo if the script is not run as root. Add NOPASSWD to sudoers for automation.
# For simplicity here, we assume sufficient permissions or sudo is handled externally.
mkdir -p "$SITE_DIR"
cp -rp "$TEMPLATES/Dockerfile" "$SITE_DIR/"
cp -rp "$TEMPLATES/uploads.ini" "$SITE_DIR/"
echo "✅ Directory created successfully."

# 4. Generate docker-compose.yml from template
echo "🔧 Generating docker-compose.yml from template..."
sed \
  -e "s|{PORT}|$PORT|g" \
  -e "s|{SUBNET}|$SUBNET|g" \
  -e "s|{DB_NAME}|$DB_NAME|g" \
  -e "s|{DB_USER}|$DB_USER|g" \
  -e "s|{DB_PASSWORD}|$DB_PASSWORD|g" \
  -e "s|{RDS_HOST}|$RDS_HOST|g" \
  "$TEMPLATES/docker-compose.template.yml" > "$SITE_DIR/docker-compose.yml"

# 2. Update Nginx config
echo "🌐 Updating Nginx config..."
cat <<EOL >> /etc/nginx/sites-available/api-sites

server {
    listen 80;
    server_name ${SUBDOMAIN}.${DOMAIN_NAME};

    location = /xmlrpc.php {
        deny all;
    }

    location / {
        proxy_pass http://localhost:${PORT};
        proxy_set_header Host \$host;
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_cookie_path / "/; Secure; SameSite=None;";

        proxy_set_header X-Frame-Options "SAMEORIGIN";
        proxy_set_header X-Content-Type-Options nosniff;
        proxy_set_header Content-Security-Policy "default-src 'self';";
        proxy_set_header Referrer-Policy "strict-origin-when-cross-origin";
        proxy_set_header X-XSS-Protection "1; mode=block";
        proxy_set_header Permissions-Policy "geolocation=(self), microphone=(self)";
    }
}
EOL

# Test and reload Nginx
nginx -t && systemctl reload nginx

# 3. Create MySQL database and user on RDS
echo "🗄️ Creating MySQL database and user on RDS ($RDS_HOST)..."
mysql -h "$RDS_HOST" -u "$RDS_ROOT_USER" -p"$RDS_ROOT_PASS" <<EOF
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'%';
FLUSH PRIVILEGES;
EOF


# 4. Start Docker containers
echo "🐳 Running Docker containers..."
cd "$SITE_DIR"
docker-compose up -d
echo "✅ Site created for $SUBDOMAIN at https://${SUBDOMAIN}.${DOMAIN_NAME}"

echo "📝 Writing environment file to $SITE_DIR/.env"
cat > "$SITE_DIR/.env" <<EOF
# Site-specific environment variables
SITE_DIR="$SITE_DIR"
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"
DB_PASSWORD="$DB_PASSWORD"
ADMIN_PASSWORD="$ADMIN_PASSWORD"
FULL_URL="https://${SUBDOMAIN}.${DOMAIN_NAME}"
EOF

# --- Summary ---
echo -e "\n\n✨ --- Creation Complete --- ✨"
echo "The following values have been generated for https://${SUBDOMAIN}.${DOMAIN_NAME}:"
echo "--------------------------------------------------"
echo "Site Directory:   $SITE_DIR"
echo "Generated Port:   $PORT"
echo "RDS Host:         $RDS_HOST"
echo "Database Name:    $DB_NAME"
echo "Database User:    $DB_USER"
echo "Database Password:  $DB_PASSWORD"
echo "--------------------------------------------------"

