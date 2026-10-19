# express-mongo-app

Навчальний сервер на **Node.js + Express.js** з авторизацією через **Passport** (email + пароль, сесії),
шаблонізаторами **PUG** та **EJS** і даними у хмарній базі **MongoDB Atlas** (бібліотека **Mongoose**).
Проєкт побудований за патерном **MVC**.

## Що нового (HW 65.1)

- Сервер підключається до **MongoDB Atlas** через Mongoose; рядок підключення береться зі змінної `MONGODB_URI` (файл `.env`).
- Користувачі та статті більше не зберігаються в пам'яті — вони лежать у колекціях **`users`** і **`articles`**
  і **не зникають** після перезапуску сервера.
- **Операція читання:** сторінки `/articles`, `/articles/:articleId`, `/users`, `/users/:userId` читають дані з MongoDB
  і відображають їх (EJS для статей, PUG для користувачів).
- Новий маршрут **`GET /health`** перевіряє з'єднання з базою (команда `ping`).
- Під час першого запуску порожня база автоматично заповнюється тестовими даними.

## Можливості

- Підключення до MongoDB Atlas (Mongoose), схеми та валідація на рівні моделей
- Читання даних із колекцій і відображення на сторінках (з `populate` — підстановкою автора статті)
- Авторизація Passport (`passport-local`: email + пароль), сесії `express-session` (cookie `httpOnly`, `secure`, `sameSite`)
- Реєстрація, вхід, вихід, відновлення пароля через email
- Захищений маршрут `/protected`, ролі `admin` / `user`, права доступу до статей
- Favicon, тема оформлення (cookie), CSS зі світлою та темною темою
- Сервер слухає порт **3000**

## Налаштування MongoDB Atlas

1. Зареєструйтесь на <https://www.mongodb.com/cloud/atlas> і створіть безкоштовний кластер (**M0 / Free**).
2. **Database Access** → *Add New Database User*: створіть користувача з логіном і паролем та правом читання/запису
   (*Read and write to any database*). Запам'ятайте логін і пароль.
3. **Network Access** → *Add IP Address*: додайте свою поточну IP-адресу (*Add Current IP Address*).
   Для навчання можна дозволити будь-яку адресу `0.0.0.0/0`, але в реальному проєкті цього робити не слід.
4. **Database** → кнопка *Connect* у вашому кластері → *Drivers* (Node.js) → скопіюйте рядок підключення. Він має вигляд:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Підставте свої логін і пароль та додайте **назву бази** після `.mongodb.net/`, наприклад `express_app`:
   ```
   mongodb+srv://myUser:myPassword@cluster0.xxxxx.mongodb.net/express_app?retryWrites=true&w=majority
   ```
   Якщо в паролі є спецсимволи (`@ : / ? # %`), закодуйте їх: `@` → `%40`, `#` → `%23` тощо.
   База та колекції створюються автоматично — вручну нічого створювати не потрібно.

> Інтерфейс Atlas час від часу змінюється, назви кнопок можуть трохи відрізнятися, але порядок дій той самий.

## Встановлення та запуск

Потрібен Node.js 18+.

```bash
npm install
```

Створіть файл **`.env`** у корені проєкту (за зразком `.env.example`):

```env
MONGODB_URI=mongodb+srv://myUser:myPassword@cluster0.xxxxx.mongodb.net/express_app?retryWrites=true&w=majority
SESSION_SECRET=any-long-random-string
```

> Файл `.env` містить пароль до бази, тому він **винесений у `.gitignore`** і не потрапляє в Git.
> У репозиторій потрапляє лише `.env.example` без секретів.

Запуск:

```bash
npm start
```

У консолі має з'явитися:

```
MongoDB підключено: база "express_app"
База порожня — додано тестових користувачів і статті.
Сервер запущено: http://localhost:3000
```

Відкрийте <http://localhost:3000/health> — відповідь `OK ... MongoDB: підключено` означає, що з'єднання працює.
Далі відкрийте <http://localhost:3000/login> і увійдіть як `admin@example.com` / `admin123`.

Режим розробки: `npm run dev`. Для Yarn: `yarn install` та `yarn start`.

> Якщо PowerShell забороняє запуск `npm` (помилка *execution policies*), виконайте один раз:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

**Локальна MongoDB без Atlas.** Якщо MongoDB встановлена на комп'ютері, достатньо вказати
`MONGODB_URI=mongodb://127.0.0.1:27017/express_app`.

### Змінні середовища

| Змінна                    | За замовчуванням               | Опис                                                                              |
| ------------------------- | ------------------------------ | --------------------------------------------------------------------------------- |
| `MONGODB_URI`             | — (**обов'язкова**)            | Рядок підключення до MongoDB. Без неї сервер не стартує                           |
| `SESSION_SECRET`          | `dev-session-secret-change-me` | Секрет для підпису cookie сесії. У production обов'язковий                        |
| `PORT`                    | `3000`                         | Порт сервера                                                                      |
| `SEED_DATABASE`           | `true`                         | `false` вимикає автоматичне додавання тестових даних (рекомендовано в production) |
| `NODE_ENV`                | —                              | `production` вмикає `trust proxy` (потрібно за reverse-proxy з HTTPS)             |
| `COOKIE_SECURE`           | `auto`                         | `true` / `false` — примусово вмикає / вимикає прапорець `Secure` для cookie сесії |
| `APP_URL`                 | з заголовка `Host`             | Базова адреса для посилань у листах відновлення пароля                            |
| `RESET_TOKEN_TTL_MINUTES` | `60`                           | Термін дії посилання для відновлення пароля                                       |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | — | Налаштування пошти. Без `SMTP_HOST` лист виводиться в консоль сервера |

## Тестові користувачі

Додаються автоматично, **лише якщо колекція `users` порожня** (повторний запуск нічого не дублює):

| Email               | Пароль     | Роль    |
| ------------------- | ---------- | ------- |
| `admin@example.com` | `admin123` | `admin` |
| `user@example.com`  | `user123`  | `user`  |

У production встановіть `SEED_DATABASE=false`, щоб не створювати акаунти з відомими паролями.

## Структура проєкту

```
express-mongo-app/
├── package.json, README.md, .env.example, .gitignore
├── public/                         # favicon.ico, css/style.css
└── src/
    ├── server.js                   # підключення до БД → seed → запуск сервера (порт 3000)
    ├── app.js                      # шаблонізатори, сесії, Passport, маршрути
    ├── config.js                   # налаштування сесій, cookies, токенів
    ├── db/
    │   ├── connect.js              # mongoose.connect(MONGODB_URI)
    │   └── seed.js                 # тестові дані для порожньої бази
    ├── models/
    │   ├── userModel.js            # схема колекції users
    │   └── articleModel.js         # схема колекції articles
    ├── auth/passport.js            # локальна стратегія (email + пароль)
    ├── controllers/                # index, auth, passwordReset, protected, theme, users, articles, health
    ├── routes/                     # index, auth, protected, theme, users, articles, health
    ├── middlewares/                # logger, textResponse, theme, auth, validate, articleAccess, errorHandler
    ├── utils/                      # password, email, resetToken, mailer, authPage, asyncHandler
    └── views/                      # PUG: layout, auth/*, protected, users/*; EJS: articles/*, partials/*
```

## Як працює робота з MongoDB

**Підключення** (`src/db/connect.js`, `src/server.js`). При старті сервер викликає `mongoose.connect(process.env.MONGODB_URI)`.
Лише після успішного підключення запускається `app.listen`. Якщо базу не вдалося підключити (невірний пароль,
IP не дозволено в Network Access, немає інтернету), сервер виводить зрозуміле повідомлення й завершується з кодом `1`.
Рядок підключення з паролем у лог не виводиться.

**Колекції та схеми:**

| Колекція   | Поля                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| `users`    | `username`, `email` (унікальний), `passwordHash` (bcrypt), `role` (`user`/`admin`), `createdAt`, `updatedAt` |
| `articles` | `title`, `content`, `author` (посилання `ObjectId` на `users`), `createdAt`, `updatedAt`     |

- Поле `passwordHash` у схемі має `select: false`, тому хеш пароля не повертається із запитів, поки його явно не попросять
  (так робить лише стратегія входу), — він не потрапить у відповідь чи шаблон випадково.
- Ідентифікатори тепер `ObjectId` (24 hex-символи), напр. `/articles/64f1c2...`. Некоректний id → `400`, неіснуючий → `404`.

**Читання даних** (приклад — сторінка `/articles`, `controllers/articlesController.js`):

```js
const articles = await Article.find()
  .sort({ createdAt: -1 })           // нові зверху
  .populate('author', 'username');   // підставляємо ім'я автора з колекції users
res.render('articles/list.ejs', { articles: articles.map(toView) });
```

Запит іде в колекцію `articles` у MongoDB Atlas, результат передається в шаблон EJS і відображається на сторінці.
Якщо автора статті видалили, замість імені показується «невідомий автор».

**Безпека запитів.** Усі значення з тіла запиту перед запитом до бази проходять валідацію: рядки (`email`, `password`) не можуть
бути об'єктами, тому спроби NoSQL-ін'єкції на зразок `{"email": {"$ne": null}}` відхиляються з `400`.
Параметри `:userId` / `:articleId` перевіряються на формат `ObjectId`.

## Маршрути

**HTML** — сторінка, **текст** — `text/plain`. Дії з HTML-форм завершуються редіректом, запити з `Content-Type: application/json`
отримують текстову відповідь.

### Новий маршрут

| Метод | Шлях      | Відповіді                                                                                           |
| ----- | --------- | --------------------------------------------------------------------------------------------------- |
| GET   | `/health` | `200` текст: `OK`, стан підключення та назва бази (після `ping`); `503` — база недоступна           |

### Маршрути, які читають дані з MongoDB (потрібна сесія)

| Метод | Шлях                   | Мідлвари (після `ensureAuthenticated`) | Що відбувається                                                                  | Відповіді                              |
| ----- | ---------------------- | -------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------- |
| GET   | `/articles`            | —                                      | `Article.find().populate('author')` → сторінка зі списком статей (EJS)           | `200` HTML                             |
| GET   | `/articles/:articleId` | `validateIdParam`, `loadArticle`       | `Article.findById(id).populate('author')` → сторінка статті (EJS)                | `200` HTML; `400`; `404`               |
| GET   | `/users`               | —                                      | `User.find()` → таблиця користувачів (PUG); адмін бачить колонку Email           | `200` HTML                             |
| GET   | `/users/:userId`       | `validateIdParam`                      | `User.findById(id)` + `Article.find({ author })` → картка користувача (PUG)      | `200` HTML; `400`; `404`               |

### Маршрути, які змінюють дані в MongoDB (потрібна сесія)

| Метод  | Шлях                   | Мідлвари                                                                    | Відповіді                                |
| ------ | ---------------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| POST   | `/users`               | `requireRole('admin')`, `validateUserBody`                                  | `201`; `400`; `403`; `409`               |
| PUT    | `/users/:userId`       | `validateIdParam`, `selfOrAdmin`, `validateUserBody`                        | `200`; `400`; `403`; `404`; `409`        |
| DELETE | `/users/:userId`       | `validateIdParam`, `requireRole('admin')`                                   | `200`; `400`; `403`; `404`               |
| POST   | `/articles`            | `validateArticleBody`                                                       | `201`; `400`                             |
| PUT    | `/articles/:articleId` | `validateIdParam`, `loadArticle`, `canModifyArticle`, `validateArticleBody` | `200`; `400`; `403` не автор; `404`      |
| DELETE | `/articles/:articleId` | `validateIdParam`, `loadArticle`, `canModifyArticle`                        | `200`; `400`; `403` не автор; `404`      |

### Авторизація та інше

| Метод | Шлях                     | Опис                                                                                                      |
| ----- | ------------------------ | --------------------------------------------------------------------------------------------------------- |
| GET   | `/`                      | `200` текст — опис маршрутів                                                                              |
| GET   | `/protected`             | `200` HTML — профіль і час закінчення сесії (потрібна сесія); без неї `302 /login` або `401`              |
| GET   | `/login`, `/register`    | `200` HTML — сторінки входу та реєстрації                                                                 |
| POST  | `/login`                 | Passport `local` (поля `email`, `password`, `remember`): `303`/`200`; `400`; `401`                        |
| POST  | `/register`              | створює користувача в `users` і входить: `303`/`201`; `400`; `409` email зайнятий                         |
| POST  | `/logout`                | вихід, сесія знищується: `303`/`200`                                                                      |
| GET/POST | `/forgot-password`    | запит посилання для відновлення пароля (завжди однакова відповідь)                                        |
| GET/POST | `/reset-password/:token` | форма й збереження нового пароля; токен одноразовий і прострочується                                   |
| GET/POST | `/theme`              | поточна тема / збереження теми в cookie                                                                   |
| GET   | `/favicon.ico`           | іконка сайту                                                                                              |

Неіснуючий маршрут → `404`, помилка валідації схеми → `400`, порушення унікальності (email) → `409`, внутрішня помилка → `500`.

## Порядок мідлварів (`src/app.js`)

`serve-favicon` → логування → статика → `textResponse` → парсери тіла → `cookieParser` → тема → `express-session` →
`passport.initialize()` → `passport.session()` → `exposeUser` → маршрути → `notFound` → `errorHandler`.

## Приклади (PowerShell: використовуйте `curl.exe`)

```bash
# Перевірка підключення до MongoDB
curl.exe http://localhost:3000/health

# Вхід (cookie сесії зберігається у файл)
curl.exe -c cookies.txt -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"

# Створити статтю (запис у колекцію articles)
curl.exe -b cookies.txt -X POST http://localhost:3000/articles -H "Content-Type: application/json" -d "{\"title\":\"Моя стаття\",\"content\":\"Текст\"}"
```

Після цього оновіть сторінку <http://localhost:3000/articles> — нова стаття з'явиться у списку.
Перевірити дані можна й у самому Atlas: **Database → Browse Collections**.

## Типові проблеми

| Повідомлення / симптом                                          | Причина і рішення                                                                                              |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `Не задано MONGODB_URI`                                         | Немає файлу `.env` або в ньому немає змінної `MONGODB_URI`. Створіть `.env` за зразком `.env.example`         |
| `bad auth` / `Authentication failed`                            | Невірний логін або пароль користувача бази. Спецсимволи в паролі треба закодувати                              |
| `Could not connect to any servers` / `ETIMEDOUT`                | Вашу IP-адресу не додано в **Network Access**, або немає інтернету                                             |
| `querySrv ECONNREFUSED` / `ENOTFOUND _mongodb._tcp...`          | Мережа чи провайдер блокує SRV-запити DNS. Спробуйте інший DNS (напр. `8.8.8.8`) або «стандартний» рядок підключення з Atlas (формат `mongodb://...`) |
| Після перезапуску потрібно знову входити                        | Дані в базі збережені, але **сесії** зберігаються в пам'яті сервера. Для production використайте сховище сесій (Redis, `connect-mongo`) |

## Публікація в Git

```bash
git init
git add .
git commit -m "Add MongoDB Atlas integration (Mongoose)"
git branch -M main
git remote add origin <URL-вашого-репозиторію>
git push -u origin main
```

Перед `git add .` переконайтеся, що файл `.env` не потрапляє в індекс: `git status` не повинен його показувати.
