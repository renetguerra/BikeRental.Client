# Stage1: Build
FROM node:22 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build -- --configuration development

# Stage2: nginx to server
FROM nginx:alpine
COPY --from=build /app/dist/client/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80