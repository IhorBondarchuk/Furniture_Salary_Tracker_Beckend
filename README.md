# Верстак — Furniture Salary Tracker (Backend)

Backend для обліку зарплати робітників, які збирають меблі. Зарплата за
період рахується "наживо" через MongoDB aggregation pipeline: записи
збірки з'єднуються (`$lookup`) з поточним каталогом цін — без snapshot
ціни на момент запису.

## Стек

- Node.js + Express 5 (ES modules)
- MongoDB + Mongoose (MongoDB Atlas)
- Joi — валідація
- JWT (access + refresh, refresh у HttpOnly cookie)
- bcryptjs — хешування паролів

## Запуск

1. Встановити залежності:

   ```bash
   npm install
   ```

2. Скопіювати `.env.example` у `.env` і заповнити значення:

   ```
   DB_HOST=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db-name>
   PORT=3000
   JWT_SECRET=...
   JWT_REFRESH_SECRET=...
   ```

3. (Опційно) заповнити каталог меблів 44 позиціями (польські назви):

   ```bash
   npm run seed
   ```

4. Запустити сервер:

   ```bash
   npm run dev    # nodemon
   npm start      # production
   ```

Перший обліковий запис має роль `worker` за замовчуванням. Роль `admin`
призначається вручну (напряму в базі) — self-registration з роллю admin
навмисно не підтримується.

## Структура

```
src/
├── controllers/     # обробники запитів (обгорнуті ctrlWrapper)
├── routers/         # Express-роутери
├── models/          # Mongoose-моделі (User, Furniture, WorkEntry)
├── services/        # бізнес-логіка / доступ до БД
├── middlewares/      # authenticate, authorizeRole, validateBody, isValidId, error handlers
├── schemas/          # Joi-схеми валідації
├── utils/
│   ├── ctrlWrapper.js
│   └── HttpError.js
├── db/
│   └── seed.js       # заповнення каталогу меблів
├── app.js
└── server.js
```

## Ендпоінти

### Auth — `/api/auth`

| Метод | Шлях        | Доступ         | Опис                                   |
| ----- | ----------- | -------------- | --------------------------------------- |
| POST  | `/register` | публічний      | реєстрація (роль завжди `worker`)       |
| POST  | `/login`    | публічний      | логін, повертає access token + cookie   |
| POST  | `/refresh`  | refresh cookie | видає нову пару токенів                 |
| POST  | `/logout`   | автентифікований | інвалідує токени                      |
| GET   | `/current`  | автентифікований | поточний користувач                   |

### Furniture — `/api/furniture` (каталог меблів)

| Метод  | Шлях   | Доступ | Опис                     |
| ------ | ------ | ------ | ------------------------ |
| GET    | `/`    | будь-який автентифікований | список каталогу |
| GET    | `/:id` | будь-який автентифікований | одна позиція     |
| POST   | `/`    | admin  | створити позицію          |
| PATCH  | `/:id` | admin  | оновити позицію (ціну/назву) |
| DELETE | `/:id` | admin  | видалити позицію          |

### Work entries — `/api/work-entries` (записи зборки)

| Метод  | Шлях       | Доступ | Опис                                                     |
| ------ | ---------- | ------ | --------------------------------------------------------- |
| GET    | `/`        | worker бачить лише свої, admin — всі (або `?worker=<id>`) | список записів |
| GET    | `/:id`     | власник запису або admin | один запис                                  |
| POST   | `/`        | автентифікований | створити запис (admin може вказати `worker`)         |
| PATCH  | `/:id`     | власник або admin | оновити запис                                        |
| DELETE | `/:id`     | власник або admin | видалити запис                                       |
| GET    | `/salary`  | автентифікований | розрахунок зарплати за період, `?from=&to=&worker=` (worker лише для admin) |

`GET /api/work-entries/salary?from=2026-08-01&to=2026-08-31` повертає:

```json
{
  "worker": "…",
  "period": { "from": "2026-08-01", "to": "2026-08-31" },
  "items": [
    { "furnitureId": "…", "furnitureName": "Szafa 2-drzwiowa", "price": 45, "quantity": 6, "total": 270 }
  ],
  "totalSalary": 270
}
```
