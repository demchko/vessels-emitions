# Vessel Emissions Visualization

Система візуалізації емісій суден з розрахунком відхилення від базових ліній Poseidon Principles.

## Архітектура проєкту

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Візуалізація**: Highcharts
- **База даних**: PostgreSQL з Prisma ORM

## Встановлення та запуск

### Передумови

1. Node.js (версія 18 або новіша)
2. PostgreSQL (версія 13 або новіша)
3. npm або yarn

### Крок 1: Клонування та встановлення залежностей

```bash
# Створення проєкту
mkdir vessel-emissions-app
cd vessel-emissions-app

# Створення backend
npx @nestjs/cli new backend
cd backend
npm install prisma @prisma/client decimal.js @nestjs/config pg
npm install -D @types/pg
npx prisma init

# Створення frontend
cd ..
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd frontend
npm install highcharts highcharts-react-official axios decimal.js
npm install -D @types/highcharts
```

### Крок 2: Налаштування бази даних

1. Створіть базу даних PostgreSQL:
```sql
CREATE DATABASE vessel_emissions;
```

2. Налаштуйте змінні середовища в `backend/.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/vessel_emissions?schema=public"
PORT=3001
```

3. Запустіть міграції:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### Крок 3: Підготовка даних

Створіть папку `backend/data/` та розмістіть там файли:
- `vessels.json`
- `pp-reference.json`
- `daily-log-emissions.json`

### Крок 4: Запуск програми

**Backend (термінал 1):**
```bash
cd backend
npm run start:dev
```

**Frontend (термінал 2):**
```bash
cd frontend
npm run dev
```

Відкрийте браузер та перейдіть до `http://localhost:3000`

## Основні функції

### 1. Імпорт даних
- Імпорт інформації про судна з `vessels.json`
- Імпорт базових ліній PP з `pp-reference.json`
- Імпорт щоденних емісій з `daily-log-emissions.json`

### 2. Розрахунок девіацій
- Групування емісій по кварталах
- Розрахунок базових ліній Poseidon Principles
- Обчислення відсоткових відхилень для останнього дня кварталу

### 3. Візуалізація
- Інтерактивний графік Highcharts
- Відображення девіацій по суднах та кварталах
- Детальні підказки з інформацією про емісії

## API Endpoints

### GET `/api/emissions/deviations`
Повертає квартальні девіації для всіх суден.

### GET `/api/emissions/vessels`
Повертає список суден з кількістю записів емісій.

### POST `/api/emissions/import`
Імпортує дані з JSON файлів в базу даних.

## Структура бази даних

### Таблиці:
- `vessels` - Інформація про судна
- `daily_log_emissions` - Щоденні записи емісій
- `pp_reference` - Довідкові значення Poseidon Principles

## Технічні особливості

### Backend
- **NestJS**: Структурований фреймворк для Node.js
- **Prisma**: Type-safe ORM для роботи з базою даних
- **Decimal.js**: Точні розрахунки з плаваючою комою
- **CORS**: Налаштовано для комунікації з frontend

### Frontend
- **Next.js 14**: React фреймворк з App Router
- **TypeScript**: Типізований JavaScript
- **Tailwind CSS**: Utility-first CSS фреймворк
- **Highcharts**: Потужна бібліотека для візуалізації

### Проблеми з базою даних:
```bash
# Скинути базу даних
npx prisma migrate reset

# Перегенерувати клієнт
npx prisma generate
```

### Проблеми з CORS:
Переконайтесь що backend запущений на порту 3001, а frontend на 3000.
