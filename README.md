# Верстак — Furniture Salary Tracker (Backend)

Backend для обліку зарплати за збирання меблів. Застосунок
однокористувацький: реєстрації немає, є один обліковий запис, логін і
пароль якого задаються змінними середовища. Зарплата за
період рахується "наживо" через MongoDB aggregation pipeline: записи
збірки з'єднуються (`$lookup`) з поточним каталогом цін — без snapshot
ціни на момент запису.

## Деплой

API: https://furniture-salary-tracker-beckend.onrender.com/api

Змінні середовища на Render (Environment):

| Змінна         | Значення                                                          |
| -------------- | ----------------------------------------------------------------- |
| `DB_HOST`      | рядок підключення MongoDB Atlas                                   |
| `APP_LOGIN`    | логін для входу                                                   |
| `APP_PASSWORD` | пароль для входу                                                  |
| `JWT_SECRET`   | довгий випадковий рядок для підпису токенів (зміна — вихід на всіх пристроях) |
| `FRONTEND_URL` | (опційно) origin фронтенду без `/` в кінці — обмежує CORS для браузерів |

Без `APP_LOGIN`, `APP_PASSWORD` або `JWT_SECRET` сервер не стартує.
`PORT` Render задає сам. `JWT_REFRESH_SECRET`, `ADMIN_INVITE_CODE` і
`NODE_ENV` більше не використовуються.

Free-інстанс Render засинає без трафіку — перший запит після простою
може йти ~50 с.

## Стек

- Node.js + Express 5 (ES modules)
- MongoDB + Mongoose (MongoDB Atlas)
- Joi — валідація
- JWT — токен входу (30 днів), один обліковий запис зі змінних середовища

## Запуск

1. Встановити залежності:

   ```bash
   npm install
   ```

2. Скопіювати `.env.example` у `.env` і заповнити значення:

   ```
   DB_HOST=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db-name>
   PORT=3000
   APP_LOGIN=...
   APP_PASSWORD=...
   JWT_SECRET=...
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

## Структура

```
src/
├── controllers/     # обробники запитів (обгорнуті ctrlWrapper)
├── routers/         # Express-роутери
├── models/          # Mongoose-моделі (Furniture, WorkEntry)
├── services/        # бізнес-логіка / доступ до БД
├── middlewares/      # authenticate, loginRateLimit, validateBody, isValidId, error handlers
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

| Метод | Шлях     | Опис |
| ----- | -------- | ---- |
| POST  | `/login` | `{ login, password }` → `{ token }`; після 10 невдалих спроб з однієї IP — 429 на 15 хв |

Решта ендпоінтів вимагає заголовок `Authorization: Bearer <token>`, інакше 401.

### Furniture — `/api/furniture` (каталог меблів)

| Метод  | Шлях   | Опис                         |
| ------ | ------ | ---------------------------- |
| GET    | `/`    | список каталогу              |
| GET    | `/:id` | одна позиція                 |
| POST   | `/`    | створити позицію             |
| PATCH  | `/:id` | оновити позицію (ціну/назву) |
| DELETE | `/:id` | видалити позицію (409, якщо використовується в записах) |

### Work entries — `/api/work-entries` (записи зборки)

| Метод  | Шлях      | Опис                                                                 |
| ------ | --------- | -------------------------------------------------------------------- |
| GET    | `/`       | список записів, опційно `?from=&to=`; `furniture` populated (`{ _id, name, price }`) |
| GET    | `/:id`    | один запис                                                           |
| POST   | `/`       | створити запис: `{ furniture, quantity, date? }`                     |
| PATCH  | `/:id`    | оновити запис                                                        |
| DELETE | `/:id`    | видалити запис                                                       |
| GET    | `/salary` | розрахунок зарплати за період, `?from=&to=` (обидва обов'язкові)     |

`GET /api/work-entries/salary?from=2026-08-01&to=2026-08-31` повертає:

```json
{
  "period": { "from": "2026-08-01", "to": "2026-08-31" },
  "items": [
    { "furnitureId": "…", "furnitureName": "Szafa 2-drzwiowa", "price": 45, "quantity": 6, "total": 270 }
  ],
  "totalSalary": 270
}
```
