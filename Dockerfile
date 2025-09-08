# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Install necessary packages
RUN apk add --no-cache \
    curl \
    supervisor

# Install Mockoon CLI globally
RUN npm install -g @mockoon/cli

# Install FileBrowser
RUN curl -fsSL https://raw.githubusercontent.com/filebrowser/get/master/get.sh -o /tmp/install.sh && \
    sh /tmp/install.sh && \
    rm /tmp/install.sh

# Create necessary directories
RUN mkdir -p /mockoon-data /var/log/supervisor /app

# Install Express for the control API
WORKDIR /app
RUN npm init -y && npm install express cors

# Copy API server
COPY api-server.js /app/api-server.js

# Copy the control panel HTML
COPY control-panel.html /app/public/index.html

# Copy supervisord configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy start script
COPY start.sh /start.sh
RUN chmod +x /start.sh