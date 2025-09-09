#!/bin/sh

echo "=== Starting Mockoon CLI Services ==="

# Set default values for environment variables
WEB_USERNAME=${WEB_USERNAME:-admin}
WEB_PASSWORD=${WEB_PASSWORD:-password}
MOCKOON_PORT=${MOCKOON_PORT:-3000}

echo "WEB_USERNAME: $WEB_USERNAME"
echo "WEB_PASSWORD: [HIDDEN]"
echo "PORT: $PORT"
echo "MOCKOON_PORT: $MOCKOON_PORT"

# Initialize FileBrowser configuration
cd /mockoon-data
/usr/local/bin/filebrowser config init --database /mockoon-data/filebrowser.db
/usr/local/bin/filebrowser config set --address 0.0.0.0 --database /mockoon-data/filebrowser.db
/usr/local/bin/filebrowser config set --port 8080 --database /mockoon-data/filebrowser.db
/usr/local/bin/filebrowser config set --root /mockoon-data --database /mockoon-data/filebrowser.db

# Add FileBrowser user
/usr/local/bin/filebrowser users add $WEB_USERNAME $WEB_PASSWORD --perm.admin --database /mockoon-data/filebrowser.db

# Create a default mockoon data file if none exists
if [ ! -f "/mockoon-data/default-mock.json" ]; then
    echo '{
  "uuid": "default-env",
  "lastMigration": 32,
  "name": "Default Mock API",
  "port": '${MOCKOON_PORT:-3000}',
  "hostname": "0.0.0.0",
  "routes": [
    {
      "uuid": "route-1",
      "type": "http",
      "documentation": "Welcome route",
      "method": "get",
      "endpoint": "",
      "responses": [
        {
          "uuid": "response-1",
          "body": "{\n  \"message\": \"Welcome to Mockoon CLI on Railway!\",\n  \"status\": \"ready\"\n}",
          "latency": 0,
          "statusCode": 200,
          "label": "",
          "headers": [
            {
              "key": "Content-Type",
              "value": "application/json"
            }
          ],
          "bodyType": "INLINE",
          "filePath": "",
          "databucketID": "",
          "sendFileAsBody": false,
          "rules": [],
          "rulesOperator": "OR",
          "disableTemplating": false,
          "fallbackTo404": false,
          "default": true
        }
      ],
      "enabled": true,
      "responseMode": null
    }
  ],
  "cors": true,
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json"
    },
    {
      "key": "Access-Control-Allow-Origin",
      "value": "*"
    },
    {
      "key": "Access-Control-Allow-Methods",
      "value": "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS"
    },
    {
      "key": "Access-Control-Allow-Headers",
      "value": "Content-Type, Origin, Accept, Authorization, Content-Length, X-Requested-With"
    }
  ],
  "proxyMode": false,
  "proxyRemovePrefix": false,
  "hostname": "0.0.0.0",
  "tlsOptions": {
    "enabled": false,
    "type": "CERT",
    "pfxPath": "",
    "certPath": "",
    "keyPath": "",
    "caPath": "",
    "passphrase": ""
  }
}' > /mockoon-data/default-mock.json
fi

# Create public directory for control panel
mkdir -p /app/public

# Start supervisord to manage all services
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf