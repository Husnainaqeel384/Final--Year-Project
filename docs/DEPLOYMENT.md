# Deploying Budget Book

This guide puts Budget Book on a small Linux server with HTTPS, using the Docker setup in this repository. It covers both a normal install and a **public demo site** (`DEMO_MODE`).

You will need:
- A Linux server (VPS) with at least 2 GB of memory, running Ubuntu 24.04 LTS.
- A domain or subdomain you can point at it, for example `demo.example.com`.

## Why a server and not a serverless host

Budget Book runs three parts together: a MySQL database, the API, and the web app behind nginx. It also keeps uploaded avatars on disk, and in demo mode a nightly timer. `docker-compose.yml` already runs all of this, so a single server is the simplest and cheapest fit. Hosts that only run static sites or short-lived functions can't run it as it is.

## 1. Create the server

1. Create an **Ubuntu 24.04** server with **2 GB of memory or more**. Any provider works (Hetzner, DigitalOcean, Linode, Vultr, or Oracle Cloud's free tier, for example).
2. Add your SSH key while creating it, and note the server's public IP address.
3. At your domain's DNS provider, add an **A record**: `demo` → the server's IP. DNS changes can take a few minutes to apply.

## 2. Prepare the server

Connect with `ssh root@<server-ip>`, then:

```bash
# Updates and a firewall that allows only SSH and the web.
apt update && apt upgrade -y
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable

# Docker Engine with the Compose plugin, from Docker's official script.
curl -fsSL https://get.docker.com | sh
```

On a 2 GB server, add swap so the build doesn't run out of memory:

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 3. Get the code and configure it

```bash
git clone https://github.com/<your-account>/<your-repo>.git /opt/budget-book
cd /opt/budget-book
```

Create `/opt/budget-book/.env`, replacing the domain with your own. Generate each secret with `openssl rand -hex 48`, and use a different value for each.

```dotenv
JWT_SECRET=<first random value>
DOCKER_DB_PASSWORD=<second random value>

DOCKER_APP_URL=https://demo.example.com
DOCKER_COOKIE_SECURE=true
# Only Caddy on this server may reach the app; Docker would otherwise open the port to the internet.
DOCKER_WEB_PORT=127.0.0.1:8080

# Public demo: one-click demo sign-in, locked demo accounts, reset nightly at 03:00 UTC.
# Leave this out for a normal install.
DEMO_MODE=true
```

Keep this file private. It never goes into git.

## 4. Add HTTPS with Caddy

Caddy gets and renews the HTTPS certificate on its own. Install it from its official package:

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
```

Replace `/etc/caddy/Caddyfile` with:

```caddyfile
demo.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

Then run `systemctl reload caddy`.

## 5. Start Budget Book

```bash
cd /opt/budget-book
docker compose up --build -d
docker compose ps          # all three should become "healthy" within a minute or two
docker compose logs api    # look for "Database schema is up to date" and "Demo data added"
```

Open `https://demo.example.com`. With demo mode on, the home page and sign-in page show **Try the live demo**.

## Updating

```bash
cd /opt/budget-book
git pull
docker compose up --build -d
```

Migrations run automatically when the API starts. Your data stays in the `db_data` volume.

## Demo mode in detail

With `DEMO_MODE=true`:
- **One-click sign-in.** "Try the live demo" signs visitors in to the demo account (`demo@budgetbook.dev`). A banner inside the app tells them it is shared and links to sign-up.
- **Locked demo accounts.** These accounts can't change:
  - their profile, password or avatar;
  - organization invitations, which would send email to strangers;
  - global categories;
  - other users through the admin screen.

  The demo admin can open the admin screen, but only sees the demo accounts.
- **Nightly reset.** Every night at 03:00 UTC the demo accounts are rebuilt from scratch, with dates moved up to the current day. Accounts that people registered themselves are never touched.

To reset the demo by hand:

```bash
docker compose exec api node apps/api/scripts/reset-demo.js
```

## Optional: email

Without SMTP settings the app runs normally, but password-reset and invitation emails are skipped and logged as a warning. To send them, add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `SMTP_FROM` to `.env` from any email provider, then run `docker compose up -d` again.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Browser can't connect | `systemctl status caddy`, and that the DNS record points at the server (`ping demo.example.com`) |
| Certificate error | DNS must point at the server before Caddy starts; then run `systemctl reload caddy` |
| Signed out after every click | `DOCKER_APP_URL` must start with `https://` and match the address in the browser |
| `api` never becomes healthy | `docker compose logs api` usually names the missing or invalid setting |
| Build stops with "killed" | The server ran out of memory: add swap (step 2) |
