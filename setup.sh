#!/usr/bin/env bash
set -e

echo "=== Установка зависимостей для всех модулей ==="
npm install
npm run install-all

echo
if [ ! -f backend/.env ]; then
  if [ -f backend/.env.example ]; then
    cp backend/.env.example backend/.env
    echo "Создан backend/.env из шаблона. Отредактируйте его перед запуском."
  else
    echo "Шаблон backend/.env.example не найден. Создайте backend/.env вручную."
  fi
else
  echo "backend/.env уже существует."
fi

echo
if [ ! -f fullstack/client/.env ]; then
  cat > fullstack/client/.env <<'EOF'
VITE_API_BASE_URL=http://localhost:3001
EOF
  echo "Создан файл fullstack/client/.env. Проверьте адрес API при развертывании."
else
  echo "fullstack/client/.env уже существует."
fi

echo
if [ ! -f fullstack/admin/.env ]; then
  cat > fullstack/admin/.env <<'EOF'
VITE_API_BASE_URL=http://localhost:3001
EOF
  echo "Создан файл fullstack/admin/.env. Проверьте адрес API при развертывании."
else
  echo "fullstack/admin/.env уже существует."
fi

echo
 echo "Готово. Запустите 'npm run dev' для старта backend, client и admin одновременно."