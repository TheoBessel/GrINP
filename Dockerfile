FROM node:22-alpine AS builder

ARG TAG=dev

WORKDIR /app

COPY . .

RUN yarn install --immutable
RUN yarn prisma generate
RUN yarn run svelte-kit sync
RUN yarn build

FROM node:22-alpine AS grinp_website

WORKDIR /app

COPY --from=builder /app/build      /app/build

COPY prisma/        prisma/
COPY .yarn/         .yarn/
COPY entrypoint.sh  .
COPY .yarnrc.yml    .
COPY package.json   .
COPY yarn.lock      .

RUN yarn workspaces focus --production
RUN yarn prisma generate

RUN chmod +x entrypoint.sh
CMD ["./entrypoint.sh"]