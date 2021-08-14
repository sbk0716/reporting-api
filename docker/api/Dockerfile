FROM node:current-slim
# assign working dir
WORKDIR /usr/src/app
# check yarn version
RUN yarn -v
# install dependencies
RUN yarn
# expose the endpoint
EXPOSE 63000
# run the command
CMD ["yarn","run","start"]