# Fileplace

Web app for storing files

## Development

To run the development server, you will need:

- Docker (tested with version `20.10.21`, build `baeda1f`)
- Node (tested with `v16.16.0`)

To run:

1. Make a copy of `backend.sample.env` and rename it to `backend.env`.
2. If you'd like to have `Sign in with Google` and email related functionality, edit `backend.env` accordingly.
3. Run `docker compose -f ./docker-compose.dev.yml up --build` to bring up the backend service.
4. In another terminal, in the `frontend` directory, run `npm install`.
5. Run `npm run dev` to run vite's development server.
6. The site should be available at `http://localhost:5173`.

## Production

1. Make a copy of `backend.sample.env` and rename it to `backend.env`.
2. Add your Google client ID and key.
3. Add your SMTP server details.
4. Run `docker compose up --build`.
5. The site should be available at `http://localhost`.
