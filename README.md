# Node PG Starter 🚀

![Node.js](https://img.shields.io/badge/Node.js-Ready-green) ![Express](https://img.shields.io/badge/Express-4.x-lightgrey) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Enabled-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8) ![Mocha](https://img.shields.io/badge/Tests-Mocha-yellow) ![License](https://img.shields.io/badge/License-ISC-blue)

A small Express starter application for building a Node.js site with PostgreSQL, Redis-backed sessions, Tailwind CSS, and authentication flows.

## ✨ What this project includes

- Express server with EJS views
- Sequelize models and PostgreSQL support
- Redis-backed session handling
- Tailwind-based UI styling
- Magic-link authentication and OAuth login for Google and GitHub
- SMTP mail support
- Mocha-based test setup
- Docker support via the included Dockerfile

## 🧰 Prerequisites

Before getting started, make sure you have:

- Node.js and npm installed
- PostgreSQL running locally or available remotely
- Redis running locally or available remotely
- Docker optional, if you want to use the container setup

## 🚀 Quick start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd node-pg-start
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment file:
   ```bash
   cp sample.env .env
   ```
4. Update the values in `.env` for your local setup.
5. Start the app:
   ```bash
   npm run dev
   ```

The application should then be available locally through the configured Express server.

## ⚙️ Environment variables

Create a `.env` file in the project root with values similar to the following:

```env
DATABASE_URL="postgres://localhost/tailwind"

REDIS_HOST=""
REDIS_PORT=""
REDIS_PASSWORD=""

GOOGLE_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

GITHUB_ID="YOUR_GITHUB_CLIENT_ID"
GITHUB_SECRET="YOUR_GITHUB_CLIENT_SECRET"

SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=465
SMTP_USER="postmaster@YOURDOMAIN"
SMTP_PASSWORD="YOUR_PASSWORD"

DEFAULT_REPLY_TO="test@test.com"
```

If you are using the container-based setup, the same values can be configured in the container configuration and the container rebuilt.

## 🔐 Authentication

The app supports:

- Magic-link sign-in via email
- OAuth login with Google
- OAuth login with GitHub

To use the OAuth providers, set the corresponding client ID and secret values in your environment file.

## 🎨 Build CSS

To rebuild the Tailwind stylesheet:

```bash
npm run css
```

## 🧪 Testing

Tests are configured to run with Mocha. Use:

```bash
npm test
```

## 📁 Project structure

A few key directories:

- `routes/` — route handlers
- `lib/models/` — Sequelize models
- `views/` — EJS templates
- `public/` — static assets and compiled frontend files
- `config/` — authentication and app configuration
- `mail/` — mail sending helpers and templates

## 🚢 Deployment

For Azure deployment, make sure you have an Azure account and the Azure CLI installed locally, and that your environment variables are available to the app runtime.

## 📄 License

This project is distributed under the terms described in [LICENSE.md](LICENSE.md).

