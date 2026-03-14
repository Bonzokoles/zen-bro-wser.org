FROM node:20-alpine

WORKDIR /app

# Copy entire ZENO_WEB_CORE_APP (actual frontend)
COPY ../ZENO_WEB_CORE_APP/package*.json ./
COPY ../ZENO_WEB_CORE_APP/ ./

# Use Docker-specific config (static build, no adapter)
RUN cp astro.config.docker.mjs astro.config.mjs

# Install dependencies
RUN npm ci || npm install

# Expose Astro dev server port
EXPOSE 5173

# Run dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
