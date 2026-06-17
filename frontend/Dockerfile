# build stage
FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# runtime stage
FROM nginx:stable-alpine
# copy our nginx.conf over default
COPY nginx.conf /etc/nginx/conf.d/default.conf
# copy build
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
