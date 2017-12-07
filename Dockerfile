FROM node:4
EXPOSE 8081:8080

RUN npm install alexa-app alexa-app-server request -save
RUN cp -R /node_modules/alexa-app-server/examples/ /node_modules/alexa-app-server/api/
RUN rm -rf /node_modules/alexa-app-server/api/apps/*
RUN cd node_modules/alexa-app-server/api/apps/ && \
        git clone https://github.com/patfreeman/alexa-app-kegbot.git && \
        cd alexa-app-kegbot && \
        npm install javascript-time-ago

WORKDIR node_modules/alexa-app-server/api

CMD [ "node", "server.js" ]
