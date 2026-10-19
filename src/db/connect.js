import mongoose from 'mongoose';

mongoose.connection.on('error', error => console.error('Помилка MongoDB:', error.message));
mongoose.connection.on('disconnected', () => console.warn('MongoDB: з\'єднання втрачено'));
mongoose.connection.on('reconnected', () => console.log('MongoDB: з\'єднання відновлено'));

/** Підключається до MongoDB (Atlas або локальної). Рядок підключення береться з MONGODB_URI. */
export async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error('Не задано MONGODB_URI. Створіть файл .env за зразком .env.example.');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000, // не чекати вічно, якщо кластер недоступний
  });

  // Рядок підключення містить пароль, тому його в лог не виводимо.
  console.log(`MongoDB підключено: база "${mongoose.connection.name}"`);
}

export const disconnectDB = () => mongoose.disconnect();
