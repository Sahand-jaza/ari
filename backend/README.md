# Backend

Node.js Express server for ARI TECHNOLOGY.

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

## Development

```bash
npm run dev
```

## Local database setup

1. Copy the example environment file and fill in your MySQL credentials:

```powershell
cd C:\xampp\htdocs\ari\backend
Copy-Item .env.example .env
notepad .env
```

2. Start MySQL using the XAMPP Control Panel (or start the MySQL service). Ensure MySQL is running on the host/port you placed in `.env` (default `127.0.0.1:3306`).

3. Create the database (if not already present) and grant privileges if needed. From a shell (after MySQL is running):

```powershell
# Open MySQL client and supply your password when prompted
mysql -u %DB_USER% -p -e "CREATE DATABASE IF NOT EXISTS %DB_NAME%;"
```

4. Install dependencies and start the server:

```powershell
npm install
npm start
```

5. Health check (once server is running):

```powershell
curl http://localhost:5000/api/health
```

If you get an authentication error when the server starts, double-check the `DB_USER`/`DB_PASSWORD` values in your `.env` and ensure MySQL is running.
