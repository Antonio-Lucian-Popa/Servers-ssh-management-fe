# ===== Build stage =====
FROM node:20-alpine AS build

WORKDIR /app

# Copiem doar fișierele de deps ca să folosim layer cache
COPY package*.json ./
RUN npm ci --omit=dev=false

# Copiem sursa
COPY . .

# Parametri pentru Vite – se evaluează la BUILD
ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}

# Build SPA în /app/dist
RUN npm run build

# ===== Runtime stage (nginx) =====
FROM nginx:alpine

# Nginx config pentru SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiem build-ul
COPY --from=build /app/dist /usr/share/nginx/html

# Healthcheck simplu
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
