FROM mcr.microsoft.com/devcontainers/typescript-node:18-bullseye

# Install additional OS packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    postgresql-client \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN su node -c "npm install -g prisma @prisma/client @playwright/test"

# [Optional] Setup non-root user
USER node

# [Optional] Set working directory
WORKDIR /workspaces/fairviawave