FROM ghcr.io/puppeteer/puppeteer:24.3.1 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED="1"
ENV NODE_ENV="production"

# Check Chrome location
RUN which google-chrome-stable || echo "Chrome not found at standard location"
RUN ls -la /usr/bin/google-chrome* || echo "No Chrome in /usr/bin/"
RUN find / -name "chrome" -o -name "chrome-*" -o -name "chromium" -o -name "google-chrome*" 2>/dev/null || echo "Chrome not found in filesystem search"

# Build the Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV="production"
ENV NEXT_TELEMETRY_DISABLED="1"

# Use pptruser which is already set up in the Puppeteer image
USER pptruser

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown pptruser:pptruser .next

# Automatically leverage output traces to reduce image size
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT="3000"
ENV HOSTNAME="0.0.0.0"

# Configure Puppeteer - We'll use Puppeteer's default path finding mechanism
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
# We're not setting PUPPETEER_EXECUTABLE_PATH because we'll find the path in the code

# Start the Next.js application
CMD ["node", "server.js"] 