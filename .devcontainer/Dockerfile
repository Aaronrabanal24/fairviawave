# Use the official TypeScript/Node.js dev container image as a base.
# It comes with Node.js, TypeScript, and common development tools pre-installed.
FROM mcr.microsoft.com/devcontainers/typescript-node:18-bullseye

# Install additional OS packages needed for the project.
# - postgresql-client: Provides tools like `psql` and `pg_isready` to interact with the PostgreSQL database.
RUN sudo apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && sudo apt-get -y install --no-install-recommends postgresql-client \
    && sudo apt-get clean -y \
    && sudo rm -rf /var/lib/apt/lists/*

# Set the working directory in the container.
WORKDIR /workspaces/fairviawave

# Copy package.json and lock file to leverage Docker cache.
# This step only re-runs if these files change.
COPY package*.json ./

# Install project dependencies.
# This is done as the 'node' user to avoid permission issues.
RUN su node -c "npm install"

# Copy the rest of the application source code.
# This will be cached unless the source files change.
COPY --chown=node:node . .

# Expose the port Next.js runs on.
EXPOSE 3000
