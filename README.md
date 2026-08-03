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

## 3. Preview a pull before applying it:
```bash
git fetch origin prod-sync-clean
```

> **Security note:** Real credentials are intentionally not included here. Store them in a proper secrets manager (Azure Key Vault, 1Password, Vault, etc.) or a `.env` file excluded from version control, and rotate any that may have been exposed in plaintext elsewhere.

## 5. Deployment Document
[Deployment Document](https://apliaglobal77-my.sharepoint.com/:w:/g/personal/aniket_apliaglobal_com/IQD3oXE_AP86TrlNOTCX_hyXAQ7CKGhzC-H-g7Ql-ER1qp4?e=ZUiTRS)
