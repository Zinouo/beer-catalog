## Lancer le projet

### Prérequis
- Docker + Docker Compose

### 1. Cloner et configurer

```bash
git clone https://github.com/zinouo/beer-catalog
cd beer-catalog
# Remplis les variables dans .env
```

### 2. Démarrer

```bash
docker compose pull
docker compose up -d
```

➡️ **http://localhost**

---

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `JWT_SECRET` | Clé secrète JWT |
| `GITHUB_CLIENT_ID` | Client ID GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | Client Secret GitHub OAuth App |
| `GITHUB_CALLBACK_URL` | `http://localhost/api/auth/github/callback` |
| `MAINTAINER_IDS` | IDs GitHub numériques des maintainers |
| `FRONTEND_URL` | `http://localhost` |

> **Créer une GitHub OAuth App** : GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
> - Homepage URL : `http://localhost`
> - Callback URL : `http://localhost/api/auth/github/callback`

---

## Développement local

```bash
# Backend (http://localhost:3000)
cd backend && npm install && npm run start:dev

# Frontend (http://localhost:5173)
cd frontend && npm install && npm run dev
```

---

## CI/CD

À chaque push sur `main`, GitHub Actions build et push automatiquement les images Docker sur `ghcr.io`.
