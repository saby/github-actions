FROM node:lts-alpine
MAINTAINER Zimichev Dmitri "empyrosx@gmail.com"

RUN mkdir -p /var/task/

WORKDIR /var/task

COPY package.json package-lock.json /var/task/
RUN npm ci --production
RUN curl -sfL https://raw.githubusercontent.com/reviewdog/reviewdog/master/install.sh | sh -s

COPY entrypoint.sh index.js /var/task/

ENTRYPOINT ["/var/task/entrypoint.sh"]
