#!/usr/bin/env bash
# Use this script to start a pgAdmin container and connect it to your existing PostgreSQL container

PGADMIN_CONTAINER_NAME="matchy-matchy-pgadmin"
DB_CONTAINER_NAME="matchy-matchy-db"
PGADMIN_PORT=5050
PGADMIN_EMAIL="admin@example.com"
PGADMIN_PASSWORD="pgadminpassword"  # You should change this to a secure password

# Check if Docker is installed and running
if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

# Check if pgAdmin container is already running
if [ "$(docker ps -q -f name=$PGADMIN_CONTAINER_NAME)" ]; then
  echo "pgAdmin container '$PGADMIN_CONTAINER_NAME' already running at http://localhost:$PGADMIN_PORT"
  exit 0
fi

# Start existing container if it exists but is not running
if [ "$(docker ps -q -a -f name=$PGADMIN_CONTAINER_NAME)" ]; then
  docker start "$PGADMIN_CONTAINER_NAME"
  echo "Existing pgAdmin container '$PGADMIN_CONTAINER_NAME' started at http://localhost:$PGADMIN_PORT"
  exit 0
fi

# Verify that the PostgreSQL container is running
if ! [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  echo "PostgreSQL container '$DB_CONTAINER_NAME' is not running. Please start it first using your database script."
  exit 1
fi

# Get PostgreSQL container IP address
DB_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $DB_CONTAINER_NAME)
if [ -z "$DB_IP" ]; then
  echo "Could not get IP address of PostgreSQL container. Trying to create a network instead."
  
  # Create a network if it doesn't exist
  NETWORK_NAME="matchy-matchy-network"
  if ! docker network inspect "$NETWORK_NAME" > /dev/null 2>&1; then
    docker network create "$NETWORK_NAME"
    echo "Created network '$NETWORK_NAME'"
  fi
  
  # Connect the PostgreSQL container to the network if not already connected
  if ! docker network inspect "$NETWORK_NAME" | grep -q "$DB_CONTAINER_NAME"; then
    docker network connect "$NETWORK_NAME" "$DB_CONTAINER_NAME"
    echo "Connected PostgreSQL container to network '$NETWORK_NAME'"
  fi
fi

# Import env variables from .env if it exists
if [ -f ".env" ]; then
  set -a
  source .env
  
  # Extract DB info from DATABASE_URL if available
  if [ -n "$DATABASE_URL" ]; then
    DB_USER=$(echo "$DATABASE_URL" | awk -F'//' '{print $2}' | awk -F':' '{print $1}')
    DB_PASSWORD=$(echo "$DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
    DB_HOST=$(echo "$DATABASE_URL" | awk -F'@' '{print $2}' | awk -F':' '{print $1}')
    DB_PORT=$(echo "$DATABASE_URL" | awk -F':' '{print $4}' | awk -F'/' '{print $1}')
    DB_NAME=$(echo "$DATABASE_URL" | awk -F'/' '{print $NF}')
  else
    # Default values if DATABASE_URL is not set
    DB_USER="moha"
    DB_PASSWORD="password"  # This should match your PostgreSQL password
    DB_HOST="$DB_CONTAINER_NAME"
    DB_PORT="5432"
    DB_NAME="matchy-matchy-db"
  fi
fi

echo "Starting pgAdmin container..."
docker run -d \
  --name $PGADMIN_CONTAINER_NAME \
  -e PGADMIN_DEFAULT_EMAIL="$PGADMIN_EMAIL" \
  -e PGADMIN_DEFAULT_PASSWORD="$PGADMIN_PASSWORD" \
  -e PGADMIN_CONFIG_SERVER_MODE="False" \
  -p "$PGADMIN_PORT:80" \
  --network="${NETWORK_NAME:-bridge}" \
  dpage/pgadmin4

if [ $? -eq 0 ]; then
  echo "pgAdmin container '$PGADMIN_CONTAINER_NAME' was successfully created"
  echo "Access pgAdmin at http://localhost:$PGADMIN_PORT"
  echo "Login with Email: $PGADMIN_EMAIL and Password: $PGADMIN_PASSWORD"
  
  echo ""
  echo "Connection information for your PostgreSQL server:"
  echo "Host: $DB_CONTAINER_NAME (or $DB_IP if using the container's IP directly)"
  echo "Port: 5432"
  echo "Database: $DB_NAME"
  echo "Username: $DB_USER"
  
  echo ""
  echo "Instructions to connect to your database in pgAdmin:"
  echo "1. Go to http://localhost:$PGADMIN_PORT and login"
  echo "2. Right-click on 'Servers' in the left panel and select 'Create > Server'"
  echo "3. On the 'General' tab, give your connection a name (e.g. 'Matchy Matchy DB')"
  echo "4. On the 'Connection' tab, enter:"
  echo "   - Host: $DB_CONTAINER_NAME"
  echo "   - Port: 5432"
  echo "   - Database: $DB_NAME"
  echo "   - Username: $DB_USER"
  echo "   - Password: [Your database password]"
  echo "5. Click 'Save' to connect"
else
  echo "Failed to start pgAdmin container. Please check Docker logs."
fi