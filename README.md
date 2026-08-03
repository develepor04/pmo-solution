# Theta — Local Setup Guide

## 1. Local Database Setup

1. **Delete** your existing database.
2. **Create** a new empty database.
3. **Run** `setup.sql` on the new database.
   > ⚠️ Do **not** manually run `schema.sql`.
4. **Start** the application:
   ```bash
   python app.py
   ```
5. On startup, `app.py` will automatically execute `init_chat_history_table()` — no manual step needed.

## 2. Pulling `.env` Files from Server

```bash
scp -i "tkvp.pem" azureuser@<SERVER_IP>:~/pmoInterface2/.env "<LOCAL_PATH>/.env"

scp -i "tkvp.pem" azureuser@<SERVER_IP>:~/pmoInterface2/database/.env "<LOCAL_PATH>/database/.env"
```

**  => Preview a pull before applying it:**
```bash
git fetch origin prod-sync-clean
git diff HEAD origin/prod-sync-clean --stat
```

## 4. Accounts (credentials redacted — see your secrets manager / password vault)

| Environment | Email | Password |
|---|---|---|
| App — Super Admin | `superadmin@thetaai.ai` | `<PLACEHOLDER_PASSWORD>` |
| App — Demo Admin | `admin@demo.thetaai.ai` | `<PLACEHOLDER_PASSWORD>` |
| App — Demo User | `user@demo.thetaai.ai` | `<PLACEHOLDER_PASSWORD>` |
| Server — Admin | `admindescon@thetaai.io` | `<PLACEHOLDER_PASSWORD>` |

> **Security note:** Real credentials are intentionally not included here. Store them in a proper secrets manager (Azure Key Vault, 1Password, Vault, etc.) or a `.env` file excluded from version control, and rotate any that may have been exposed in plaintext elsewhere.
