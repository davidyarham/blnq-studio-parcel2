# Blnq Studio

[Online Demo](https://studio.blnq.io)

## Getting Started

`yarn setup`

This will run through a few questions for your environment variables etc, and generate a PG Database if needed.

##Docker

To get started with Blnq Studio using docker, run the following command to Start the docker container in the background.

`docker-compose up -d` or if you want to run it in the foreground, remove the `-d` flag from the command.

This will start up the Postgres and the blnq node environment within the container. Which you can now access by going to `http://localhost:3000/dashboard`

## Developing

Make sure in your .env file you have NODE_ENV to anything but 'production'

`yarn dev`

## Building for Producton

Make sure in your .env file you have NODE_ENV ='production'

`yarn build`

`node server`

## mailerKey.json

mailerKey.json is missing but you can create your own using Google they are in this format

`{ "type": "service_account", "project_id": "xxx-nodemailer", "private_key_id": "xxx", "private_key": "xxx", "client_email": "xxx", "client_id": "xxx", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs", "client_x509_cert_url": "xxx" }`
