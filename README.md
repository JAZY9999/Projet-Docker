# esgi-docker-todolist

Application Full Stack conteneurisée avec Docker Compose, réalisée dans le cadre du module de conteneurisation (ESGI — Romain Lenoir).

L'application est une TodoList 3-tiers : un frontend Nginx, une API Node.js/Express et une base de données MariaDB, orchestrés via Docker Compose et déployables sans code source.

---

## Prérequis

- Docker >= 24.x
- Docker Compose >= 2.x

---

## Structure du dépôt

```
.
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── database/
│   └── init.sql
├── frontend/
│   ├── Dockerfile
│   └── index.html
├── secrets/
│   └── db_password        # mot de passe en texte brut, jamais commité
├── docker-compose.yml
├── .env
└── start.sh
```

---

## Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine avec le contenu suivant :

```env
MYSQL_DATABASE=esgi_db
MYSQL_USER=esgiuser
```

### Secret

Le mot de passe de la base de données est injecté via le système de secrets Docker. Créer le fichier `secrets/db_password` et y écrire le mot de passe souhaité :

```
secrets/db_password   ← contient uniquement le mot de passe en clair
```

Ce fichier ne doit jamais être commité (il est dans le `.gitignore`).

---

## Installation et démarrage

### Option A — avec le code source

```bash
git clone https://github.com/jazzy99999/esgi-docker-todolist
cd esgi-docker-todolist
docker compose up -d
```

### Option B — sans code source (mode soutenance)

Récupérer uniquement les fichiers suivants :

```
docker-compose.yml
.env
start.sh
database/init.sql
secrets/db_password
```

Les images sont tirées directement depuis Docker Hub :

- `jazzy99999/esgi-frontend:latest`
- `jazzy99999/esgi-backend:latest`

Puis lancer :

```bash
docker compose up -d
```

L'application est disponible sur `http://localhost`.

---

## Services

| Conteneur       | Image                              | Port exposé | Rôle                        |
|-----------------|------------------------------------|-------------|-----------------------------|
| esgi-frontend   | jazzy99999/esgi-frontend:latest    | 80          | Interface HTML/JS via Nginx |
| esgi-backend    | jazzy99999/esgi-backend:latest     | 3000        | API REST Node.js/Express    |
| esgi-database   | mariadb:10.5                       | —           | Base de données MariaDB     |

---

## Architecture Docker

### Réseau

Les trois conteneurs communiquent sur un réseau bridge isolé nommé `esgi-network`. La base de données n'est pas exposée sur l'hôte.

### Volumes

- `db_data` : volume nommé monté sur `/var/lib/mysql`, assure la persistance des données entre les cycles de vie des conteneurs.
- `./database/init.sql` : bind mount vers `/docker-entrypoint-initdb.d/init.sql` pour l'initialisation du schéma au premier démarrage.

### Secrets

Les mots de passe sont injectés via `docker secrets` depuis le fichier `./secrets/db_password`. Ils sont montés dans les conteneurs sous `/run/secrets/db_password` et ne transitent jamais en clair dans les variables d'environnement ni dans le `docker-compose.yml`.

Le backend utilise un script `start.sh` injecté par volume et défini comme entrypoint. Ce script lit le secret depuis `/run/secrets/db_password`, exporte la valeur en variable d'environnement temporaire, puis démarre le processus Node.js.

### Fiabilité

La base de données expose un healthcheck via `mysqladmin ping`. Le backend est configuré avec `depends_on: condition: service_healthy` et ne démarre qu'une fois MariaDB opérationnelle. Il dispose également d'une politique `restart: always`.

---

## Tests

### Communication entre conteneurs

1. Ouvrir `http://localhost` dans un navigateur.
2. Ajouter une tâche via le formulaire.
3. La requête transite par l'API (port 3000) jusqu'à MariaDB et la tâche s'affiche immédiatement dans la liste.

### Persistance des données

1. Ajouter plusieurs tâches.
2. Arrêter et supprimer les conteneurs :
   ```bash
   docker compose down
   ```
3. Relancer :
   ```bash
   docker compose up -d
   ```
4. Retourner sur `http://localhost` : les tâches sont toujours présentes grâce au volume `db_data`.

---

## Commandes utiles

```bash
# Démarrer en arrière-plan
docker compose up -d

# Voir les logs
docker compose logs -f

# Arrêter sans supprimer les volumes
docker compose down

# Arrêter et supprimer les volumes (réinitialisation complète)
docker compose down -v
```

---

## Docker Hub

Images disponibles sur [hub.docker.com/u/jazzy99999](https://hub.docker.com/u/jazzy99999).
