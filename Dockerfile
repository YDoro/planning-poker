# Base stage for shared configuration
FROM node:24-alpine AS base
WORKDIR /app
COPY package.json yarn.lock ./

# Dependencies stage
FROM base AS deps
RUN yarn install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["yarn", "start"]

# Build stage
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Production stage
FROM node:24-alpine AS production
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
