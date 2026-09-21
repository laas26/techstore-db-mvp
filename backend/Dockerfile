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
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]

# 6. Produção no compose: servidor sem nodemon. Para dev local use `yarn dev`.
CMD ["yarn", "start"]
