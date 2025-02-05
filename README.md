# base-nodejs-test

The purpose of this project is to create a simple NodeJS application that listens for webhooks from Frame.io and syncs the comments to Iconik.
To accomplish this, you will need to read the Frame.io and Iconik documentation and implement the necessary functionality.
The basic setup is provided, with the necessary dependencies, API clients, MongoDB

Please fork this repo and begin your work locally.

## requirements

- NodeJS >= 18
- Frame.io and Iconik credentials (provided during the test)
- Docker (or MongoDB and RabbitMQ installed locally)

## docs

- [Frame.io Docs](https://developer.frame.io/docs/), in particular:
  - [Key Concepts](https://developer.frame.io/docs/getting-started/key-concepts)
  - [Authentication](https://developer.frame.io/docs/getting-started/authentication)
  - [Webhooks](https://developer.frame.io/docs/automations-webhooks/webhooks-overview)
  - [API Reference](https://developer.frame.io/api/reference/)
  - [Rate Limits](https://developer.frame.io/docs/troubleshooting/rate-limits)
- [Iconik Docs](https://app.iconik.io/docs/index.html#main-home), in particular:
  - [REST API overview](https://app.iconik.io/docs/api.html)
  - [REST API reference](https://app.iconik.io/docs/reference.html)

## setup

Copy the `.env.example` file to `.env` and install the dependencies.

```bash
cp .env.example .env
npm install
```

Create a new Frame.io project and generate a new developer token.
Add the project's root asset id and the token to the `.env` file.

Create new Iconik app and generate a new auth token.
Add the app's id and token to the `.env` file.

Establish a secure tunnel to the local server using `pinggy.io` or similar service.

```bash
ssh -p 443 -R0:127.0.0.1:3000 a.pinggy.io
```

Add the tunnel URL to the `.env` file.

Run the setup script to create the necessary assets in Iconik.

```bash
npm run setup
```

## run

Start the server.

```bash
npm start
```

or using Docker

```bash
docker compose up
```

## validate

Upload a media file to Iconik and run the 'Base NodeJS Test' custom action on the asset.
You should see the new asset in the Frame.io project.

## scope of work

Create a new webhook in Frame.io that triggers on all comment-related events.
In the application implement a new webhook handler that syncs the comments to the corresponding asset in Iconik.

Focus on the core functionality, the rest is optional but appreciated.
Example additional topics to consider:

- Request validation (checking the Frame.io signature, your own solution for Iconik)
- Rate limits (Frame.io and Iconik)
- Preventing race conditions
- Tests
