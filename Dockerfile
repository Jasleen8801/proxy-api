ARG NODE_VERSION=20.8.0

FROM node:${NODE_VERSION}-alpine

RUN apk --no-cache add python3 make gcc libc-dev g++ linux-headers dbus avahi avahi-dev avahi-compat-libdns_sd

ENV HOME=/home/app
RUN mkdir -p $HOME
RUN addgroup -S app && adduser -S -G app -h $HOME -s /sbin/nologin app
WORKDIR $HOME

RUN apk add dbus avahi avahi-dev avahi-compat-libdns_sd 
RUN mkdir -p /var/run/dbus && chown messagebus:messagebus /var/run/dbus
RUN mkdir -p /var/run/avahi-daemon && chown avahi:avahi /var/run/avahi-daemon

RUN apk update && apk add nss-mdns

COPY .env .
COPY gcloud_credentials.json .
COPY package*.json ./

RUN chown -R app:app $HOME

USER app

RUN npm install --loglevel verbose

ADD index.js $HOME
USER root
ADD startup.sh $HOME
RUN chown root:root startup.sh
RUN chmod +x startup.sh
ENV NODE_ENV production

ENTRYPOINT [ "./startup.sh" ]