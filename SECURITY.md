# Security policy

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Report it privately through [GitHub's vulnerability reporting](https://github.com/Husnainaqeel384/Final--Year-Project/security/advisories/new). Include the steps to reproduce it and what an attacker could do.

## Running Budget Book safely

Before putting an installation on the internet:

- Set `SEED_DEMO_DATA=false`, because the demo account passwords are public
- Use a unique `JWT_SECRET` of at least 32 characters (`npm run setup` generates one)
- Serve the app over HTTPS and set `COOKIE_SECURE=true`
- Change the default database password (`DOCKER_DB_PASSWORD` when using Docker)
- Configure SMTP so that password resets and invitations can be delivered
- Back up the database and the uploads folder
