# TravelBharat

Tourism information platform for exploring India state by state — internship project with Unified Mentor.

## Stack

| Layer    | Tech                                              |
| -------- | ------------------------------------------------- |
| Frontend | HTML, CSS, Tailwind CSS, Vanilla JS, React (Vite) |
| Backend  | Django + Django REST Framework                    |
| Database | PostgreSQL                                        |

## Project structure

```
TravelBharat/
├── backend/           # Django API + Admin
│   ├── config/        # Project settings
│   ├── destinations/  # Models: State, City, Category, TouristPlace
│   └── manage.py
├── frontend/          # React + Vite (coming next)
├── venv/              # Python virtual environment
├── requirements.txt
└── .env.example
```

## Backend setup

### 1. Virtual environment

```powershell
cd TravelBharat
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Environment variables

```powershell
copy .env.example .env
```

Edit `.env` with your PostgreSQL credentials.

### 3. PostgreSQL database

Create the database (using pgAdmin or psql):

```sql
CREATE DATABASE travelbharat;
```

**Option A — Docker (quickest):**

```powershell
docker run --name travelbharat-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=travelbharat -p 5432:5432 -d postgres:16
```

**Option B — Install PostgreSQL for Windows** from [postgresql.org](https://www.postgresql.org/download/windows/)

### 4. Run migrations

```powershell
cd backend
..\venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Admin panel: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

### 5. Seed sample data (optional)

```powershell
python manage.py seed_sample_data
```

## API endpoints

Base URL: `http://127.0.0.1:8000/api/`

| Endpoint                                             | Description              |
| ---------------------------------------------------- | ------------------------ |
| `GET /api/states/`                                   | List all states          |
| `GET /api/states/{slug}/`                            | State detail with cities |
| `GET /api/states/{slug}/places/`                     | Places in a state        |
| `GET /api/cities/?state=rajasthan`                   | Cities (filter by state) |
| `GET /api/categories/`                               | All categories           |
| `GET /api/places/`                                   | All places (paginated)   |
| `GET /api/places/{slug}/`                            | Place detail             |
| `GET /api/places/featured/`                          | Featured places          |
| `GET /api/places/?search=taj`                        | Search places            |
| `GET /api/places/?state=rajasthan&category=heritage` | Filter places            |

Browse the API in browser: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)

## Data models

- **State** — Indian states & UTs
- **City** — Cities within a state
- **Category** — Heritage, Nature, Religious, Adventure
- **TouristPlace** — Destination details, fees, timings, nearby attractions
- **PlaceImage** — Image gallery per place

## Next steps

- [x] PostgreSQL + Django admin
- [x] REST API endpoints (DRF)
- [x] Sample seed data
- [ ] React + Tailwind frontend
- [ ] Search & filter UI
- [ ] Deployment
