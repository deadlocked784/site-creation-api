# Admin Portal

This is the administration interface for CiviCRM. It provides a modern UI for managing contacts and settings beyond the standard CiviCRM.

## Important Note

This project is built to work alongside your WordPress and CiviCRM installation. It requires a working WordPress and CiviCRM environment with proper configuration.

## Installation

```bash
cd admin-portal/frontend
npm install
```

## Configuration

1. Create or modify the environment files inside frontend folder:

- **For development:** .env.development
- **For production:** .env.production

2. Configure the following environment variables:
- **For development:**
```ini
VITE_BASE_URL=/wordpress/admin-portal
```

- **For production:**
```ini
VITE_BASE_URL=/admin-portal
```

## Building and Deploying

To build the project for production:

```bash
npm run build
```

Then, copy the dist and api folders, as well as the .html file, to the production environment using WP_File_Manager.

## Development

To run the development server:

```bash
npm run dev
```
