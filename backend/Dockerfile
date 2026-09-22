FROM node:20-alpine

WORKDIR /app

# 1. Copia o manifesto e a trava oficial do YARN
COPY package.json yarn.lock ./

# 2. Instala usando o motor do YARN garantindo que nenhuma versão mude
RUN yarn install --frozen-lockfile

# 3. Copia o restante do código do backend
COPY . .

# 4. Compila o motor do Prisma Client especificamente para o ambiente Linux do container
RUN npx prisma generate

# 5. Bootstrap automático: entrypoint aguarda o banco, faz db push + seed e inicia a API.
# Permite `docker compose up -d` do zero sem comandos manuais.
COPY entrypoint.sh ./
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "/app/entrypoint.sh"]

# 6. Modo desenvolvimento no compose: nodemon com hot-reload sobre o bind mount ./backend.
# Para subir sem hot-reload use `command: ["yarn", "start"]`.
CMD ["yarn", "dev"]
