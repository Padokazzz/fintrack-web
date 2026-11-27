FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV VITE_API_BASE_URL=/api
ARG VITE_PRIVACY_CONTROLLER
ARG VITE_PRIVACY_CONTACT
RUN npm run build

FROM nginx:alpine
ENV FINTRACK_API_UPSTREAM=http://host.docker.internal:8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
