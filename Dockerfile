# Build
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build -- --configuration production

# nginx to server
FROM nginx:alpine
COPY --from=build /app/dist/client/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80