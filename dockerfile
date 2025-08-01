# -----------------------------
# Stage 0: install dependencies
# -----------------------------
FROM node:20-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g corepack@latest
RUN corepack enable
RUN corepack prepare pnpm@9.15.5 --activate
RUN pnpm config set store-dir /pnpm/store

WORKDIR /usr/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    libsasl2-modules-gssapi-mit \
    python3 \
    python3-psycopg2 \
    python3-venv \
    python3-dev \
    software-properties-common \
    unzip \
    git \
    libcairo2-dev \
    libpango1.0-dev \
    librsvg2-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Fix package vulnerabilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgnutls28-dev  \
    tar \
    libsystemd0

# Installing multiple versions of dbt
# dbt 1.4 is the default
RUN python3 -m venv /usr/local/dbt1.4 \
    && /usr/local/dbt1.4/bin/pip install \
    "dbt-postgres~=1.4.0" \
    "dbt-redshift~=1.4.0" \
    "dbt-snowflake~=1.4.0" \
    "dbt-bigquery~=1.4.0" \
    "dbt-databricks~=1.4.0" \
    "dbt-trino~=1.4.0" \
    "psycopg2-binary==2.9.6"

RUN ln -s /usr/local/dbt1.4/bin/dbt /usr/local/bin/dbt\
    && python3 -m venv /usr/local/dbt1.5 \
    && /usr/local/dbt1.5/bin/pip install \
    "dbt-postgres~=1.5.0" \
    "dbt-redshift~=1.5.0" \
    "dbt-snowflake~=1.5.0" \
    "dbt-bigquery~=1.5.0" \
    "dbt-databricks~=1.5.0" \
    "dbt-trino==1.5.0" \
    "psycopg2-binary==2.9.6" \
    && ln -s /usr/local/dbt1.5/bin/dbt /usr/local/bin/dbt1.5\
    && python3 -m venv /usr/local/dbt1.6 \
    && /usr/local/dbt1.6/bin/pip install \
    "dbt-postgres~=1.6.0" \
    "dbt-redshift~=1.6.0" \
    "dbt-snowflake~=1.6.0" \
    "dbt-bigquery~=1.6.0" \
    "dbt-databricks~=1.6.0" \
    "dbt-trino==1.6.0" \
    "psycopg2-binary==2.9.6"\
    && ln -s /usr/local/dbt1.6/bin/dbt /usr/local/bin/dbt1.6 \
    && python3 -m venv /usr/local/dbt1.7 \
    && /usr/local/dbt1.7/bin/pip install \
    "dbt-postgres~=1.7.0" \
    "dbt-redshift~=1.7.0" \
    "dbt-snowflake~=1.7.0" \
    "dbt-bigquery~=1.7.0" \
    "dbt-databricks~=1.7.0" \
    "dbt-trino==1.7.0" \
    "psycopg2-binary==2.9.6" \
    && ln -s /usr/local/dbt1.7/bin/dbt /usr/local/bin/dbt1.7 \
    && python3 -m venv /usr/local/dbt1.8 \
    && /usr/local/dbt1.8/bin/pip install \
    # from 1.8, dbt-core needs to be explicitly installed
    "dbt-core~=1.8.0" \
    "dbt-postgres~=1.8.0" \
    "dbt-redshift~=1.8.0" \
    "dbt-snowflake~=1.8.0" \
    "dbt-bigquery~=1.8.0" \
    "dbt-databricks~=1.8.0" \
    "dbt-trino~=1.8.0" \
    && ln -s /usr/local/dbt1.8/bin/dbt /usr/local/bin/dbt1.8 \
    && python3 -m venv /usr/local/dbt1.9 \
    && /usr/local/dbt1.9/bin/pip install \
    "dbt-core~=1.9.0" \
    "dbt-postgres~=1.9.0" \
    "dbt-redshift~=1.9.0" \
    "dbt-snowflake~=1.9.0" \
    "dbt-bigquery~=1.9.0" \
    "dbt-databricks~=1.9.0" \
    "dbt-trino~=1.9.0" \
    && ln -s /usr/local/dbt1.9/bin/dbt /usr/local/bin/dbt1.9 \ 
    && python3 -m venv /usr/local/dbt1.10 \
    && /usr/local/dbt1.10/bin/pip install \
    "dbt-core~=1.10.0" \
    "dbt-postgres~=1.9.0" \
    "dbt-redshift~=1.9.0" \
    "dbt-snowflake~=1.9.0" \
    "dbt-bigquery~=1.9.0" \
    "dbt-databricks~=1.10.0" \
    "dbt-trino~=1.9.0" \
    && ln -s /usr/local/dbt1.10/bin/dbt /usr/local/bin/dbt1.10

# -----------------------------
# Stage 1: stop here for dev environment
# -----------------------------
FROM base AS dev

RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && apt-get clean

EXPOSE 3000
EXPOSE 8080

# -----------------------------
# Stage 2: continue build for production environment
# -----------------------------

FROM base AS prod-builder
# Install development dependencies for all
COPY package.json .
COPY pnpm-workspace.yaml .
COPY pnpm-lock.yaml .
COPY tsconfig.json .
COPY .eslintrc.js .
COPY .pnpmfile.cjs .
COPY packages/common/package.json ./packages/common/
COPY packages/warehouses/package.json ./packages/warehouses/
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# Install Sentry CLI if environment variables are set
ARG SENTRY_AUTH_TOKEN=""
ARG SENTRY_ORG=""
ARG SENTRY_RELEASE_VERSION=""
ARG SENTRY_FRONTEND_PROJECT=""
ARG SENTRY_BACKEND_PROJECT=""
ARG SENTRY_ENVIRONMENT=""

RUN if [ -n "${SENTRY_AUTH_TOKEN}" ] && [ -n "${SENTRY_ORG}" ] && [ -n "${SENTRY_RELEASE_VERSION}" ]; then \
    npm install -g @sentry/cli; \
    fi

# Build common
COPY packages/common/tsconfig.json ./packages/common/
COPY packages/common/tsconfig.build.json ./packages/common/
COPY packages/common/tsconfig.esm.json ./packages/common/
COPY packages/common/tsconfig.cjs.json ./packages/common/
COPY packages/common/tsconfig.types.json ./packages/common/
COPY packages/common/src/ ./packages/common/src/
RUN pnpm -F @lightdash/common build

# Build warehouses
COPY packages/warehouses/tsconfig.json ./packages/warehouses/
COPY packages/warehouses/src/ ./packages/warehouses/src/
RUN pnpm -F @lightdash/warehouses build

# Build backend
COPY packages/backend/tsconfig.json ./packages/backend/
COPY packages/backend/tsconfig.sentry.json ./packages/backend/
COPY packages/backend/src/ ./packages/backend/src

# Conditionally build backend with sourcemaps if Sentry environment variables are set
RUN if [ -n "${SENTRY_AUTH_TOKEN}" ] && [ -n "${SENTRY_ORG}" ] && [ -n "${SENTRY_RELEASE_VERSION}" ] && [ -n "${SENTRY_FRONTEND_PROJECT}" ] && [ -n "${SENTRY_BACKEND_PROJECT}" ] && [ -n "${SENTRY_ENVIRONMENT}" ]; then \
    echo "Building backend with sourcemaps for Sentry"; \
    pnpm -F backend build-sourcemaps && pnpm -F backend postbuild; \
    else \
    echo "Building backend without sourcemaps"; \
    pnpm -F backend build; \
    fi

# Build frontend
COPY packages/frontend ./packages/frontend
# Build frontend with sourcemaps (Vite generates them by default)
RUN if [ -n "${SENTRY_AUTH_TOKEN}" ] && [ -n "${SENTRY_ORG}" ] && [ -n "${SENTRY_RELEASE_VERSION}" ]; then \
    echo "Building frontend with Sentry integration"; \
    SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN} SENTRY_RELEASE_VERSION=${SENTRY_RELEASE_VERSION} pnpm -F frontend build; \
    else \
    echo "Building frontend without Sentry integration"; \
    pnpm -F frontend build; \
    fi

# Process and upload sourcemaps to Sentry if environment variables are set
RUN if [ -n "${SENTRY_AUTH_TOKEN}" ] && [ -n "${SENTRY_ORG}" ] && [ -n "${SENTRY_RELEASE_VERSION}" ] && [ -n "${SENTRY_FRONTEND_PROJECT}" ] && [ -n "${SENTRY_BACKEND_PROJECT}" ] && [ -n "${SENTRY_ENVIRONMENT}" ]; then \
    echo "Creating Sentry releases and processing sourcemaps"; \
    # Create releases for both projects \
    sentry-cli releases new "${SENTRY_RELEASE_VERSION}" --project "${SENTRY_FRONTEND_PROJECT}"; \
    sentry-cli releases new "${SENTRY_RELEASE_VERSION}" --project "${SENTRY_BACKEND_PROJECT}"; \
    # Set commits for the releases \
    sentry-cli releases set-commits "${SENTRY_RELEASE_VERSION}" --auto || echo "Could not determine commits automatically"; \
    # Inject debug IDs into frontend artifacts \
    echo "Injecting debug IDs into frontend artifacts"; \
    sentry-cli sourcemaps inject ./packages/frontend/build/assets/; \
    # Upload frontend sourcemaps \
    echo "Uploading frontend sourcemaps"; \
    sentry-cli sourcemaps upload --release "${SENTRY_RELEASE_VERSION}" \
    --url-prefix "~/assets" ./packages/frontend/build/assets/ --project "${SENTRY_FRONTEND_PROJECT}"; \
    # Inject debug IDs into backend artifacts \
    echo "Injecting debug IDs into backend artifacts"; \
    sentry-cli sourcemaps inject ./packages/backend/dist/; \
    # Upload backend sourcemaps \
    echo "Uploading backend sourcemaps"; \
    sentry-cli sourcemaps upload --release "${SENTRY_RELEASE_VERSION}" \
    --url-prefix "~/" ./packages/backend/dist/ --project "${SENTRY_BACKEND_PROJECT}"; \
    # Finalize releases \
    sentry-cli releases finalize "${SENTRY_RELEASE_VERSION}"; \
    # Create deploys for both projects \
    sentry-cli releases deploys "${SENTRY_RELEASE_VERSION}" new -e "${SENTRY_ENVIRONMENT}" --project "${SENTRY_FRONTEND_PROJECT}"; \
    sentry-cli releases deploys "${SENTRY_RELEASE_VERSION}" new -e "${SENTRY_ENVIRONMENT}" --project "${SENTRY_BACKEND_PROJECT}"; \
    fi

# Cleanup development dependencies
RUN rm -rf node_modules \
    && rm -rf packages/*/node_modules

# Install production dependencies
ENV NODE_ENV production
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile --prefer-offline

# -----------------------------
# Stage 3: execution environment for backend
# -----------------------------

FROM node:20-bookworm-slim as prod

ENV NODE_ENV production
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g corepack@latest
RUN corepack enable
RUN corepack prepare pnpm@9.15.5 --activate
RUN pnpm config set store-dir /pnpm/store

WORKDIR /usr/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-psycopg2 \
    python3-venv \
    git \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    librsvg2-dev \
    dumb-init \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=prod-builder  /usr/local/dbt1.4 /usr/local/dbt1.4
COPY --from=prod-builder  /usr/local/dbt1.5 /usr/local/dbt1.5
COPY --from=prod-builder  /usr/local/dbt1.6 /usr/local/dbt1.6
COPY --from=prod-builder  /usr/local/dbt1.7 /usr/local/dbt1.7
COPY --from=prod-builder  /usr/local/dbt1.8 /usr/local/dbt1.8
COPY --from=prod-builder  /usr/local/dbt1.9 /usr/local/dbt1.9
COPY --from=prod-builder  /usr/local/dbt1.10 /usr/local/dbt1.10
COPY --from=prod-builder /usr/app /usr/app

RUN ln -s /usr/local/dbt1.4/bin/dbt /usr/local/bin/dbt \
    && ln -s /usr/local/dbt1.5/bin/dbt /usr/local/bin/dbt1.5 \
    && ln -s /usr/local/dbt1.6/bin/dbt /usr/local/bin/dbt1.6 \
    && ln -s /usr/local/dbt1.7/bin/dbt /usr/local/bin/dbt1.7 \
    && ln -s /usr/local/dbt1.8/bin/dbt /usr/local/bin/dbt1.8 \
    && ln -s /usr/local/dbt1.9/bin/dbt /usr/local/bin/dbt1.9 \
    && ln -s /usr/local/dbt1.10/bin/dbt /usr/local/bin/dbt1.10


# Run backend
COPY ./docker/prod-entrypoint.sh /usr/bin/prod-entrypoint.sh

EXPOSE 8080

WORKDIR /usr/app/packages/backend

ENTRYPOINT ["dumb-init", "--", "/usr/bin/prod-entrypoint.sh"]
CMD ["node", "dist/index.js"]
