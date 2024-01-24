FROM node:10.16.0-alpine
RUN mkdir -p /opt/app
WORKDIR /opt/app
RUN adduser --disabled-password app
COPY db_setup.sh /db_setup.sh
RUN chmod +x /db_setup.sh
entrypoint "/db_setup.sh"

COPY ./ .
RUN chown -R app:app /opt/app
USER app
RUN npm install
EXPOSE 8080
CMD [ "npm", "run", "dev" ]
