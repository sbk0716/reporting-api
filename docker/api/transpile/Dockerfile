# ============================================================
# [1]Build Stage | staging
# This build created a staging docker image 
# ============================================================
FROM node:16 AS appbuild
# assign working dir
WORKDIR /usr/src/app
# create directory
RUN mkdir -p .tmp/template/
# copy all files
COPY ./ ./
# list files and directories
RUN ls -la && ls -la .tmp/template/
# check yarn version
RUN yarn -v
# install dependencies
RUN yarn
# api build
RUN yarn run build:prod
# list files and directories
RUN ls -la ./dist
# remove unnecessary files
RUN rm -rf ./dist/script && rm -rf ./dist/testData 

# ============================================================
# [2]Build Stage | production
# This build takes the production build from staging build
# ============================================================
FROM node:16-alpine
# install curl for container health check
RUN apk --no-cache add curl
# assign working dir
WORKDIR /usr/src/app
# copy file from appbuild
COPY --from=appbuild /usr/src/app/package.json ./
# copy font file from appbuild
COPY --from=appbuild /usr/src/app/assets ./assets
# copy template file from appbuild
COPY --from=appbuild /usr/src/app/.tmp ./.tmp
# copy all node_modules from appbuild
COPY --from=appbuild /usr/src/app/node_modules ./node_modules
# copy all compiled JavaScript files from appbuild
COPY --from=appbuild /usr/src/app/dist ./dist
# list files and directories
RUN ls -la && ls -la .tmp/template/ && ls -la ./dist/
# expose the endpoint
EXPOSE 63000
# run the command
CMD ["yarn","run","start:prod"]