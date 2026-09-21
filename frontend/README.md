# TechStore - FrontEnd

> Interface web da plataforma TechStore

---

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React-19-000000?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-000000?style=flat-square&logo=vite)
![Nginx](https://img.shields.io/badge/Nginx-Docker-000000?style=flat-square&logo=nginx)
![Biome](https://img.shields.io/badge/Biome-Linter-000000?style=flat-square)

* **Framework:** React + Vite
* **Roteamento & Estado:** React Router DOM e Context API (`AuthContext`)
* **Code Style:** Biome (Linter & Formatter)
* **Servidor Web:** Nginx com Proxy Reverso em container Docker
---
## ⚙️ Variáveis de Ambiente

Crie o arquivo `.env` na pasta `frontend/` definindo o endpoint da API conforme a forma de execução:
```bash
cp .env.example .env
```
```env
# Execução Local (npm run dev -> Backend na porta 3000)
VITE_API_URL=http://localhost:3000

# Execução em Container (Docker + Nginx Proxy)
# VITE_API_URL=/api
```
---
## 🚀 Instalação e Execução
### 🧑🏽‍💻 Desenvolvimento Local (sem Docker)
Recomendado para o dia a dia. Oferece **Hot Reload** em tempo real via **Vite**.
```bash
# Instale as dependências do projeto
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```
📍 Aplicação disponível em: **http://localhost:5173**

#### Outros Comandos Úteis
```bash
# Valide a qualidade do código (Linter/Formatter)
npm run lint

# Valida e aplica correções automáticas no código (Linter/Formatter)
npm run lint:fix

# Executa os testes automatizados
npm test

# Gera os arquivos estáticos na pasta dist/
npm run build

# Testa o build de produção localmente antes do deploy
npm run preview
```
### 🐳 Via Docker (Container Nginx)
Recomendado para validar o build de produção e o comportamento das rotas no **Nginx**.

1. No arquivo **.env**, certifique-se de definir a variável para o **Nginx Proxy:**
   `VITE_API_URL=/api`
2. Execute a construção e inicialização do container:
```bash
docker compose up -d --build frontend
```
📍 Aplicação disponível em: **http://localhost:8080** (ou a porta configurada no docker-compose.yml)

#### Outros Comandos Úteis

```bash
# Reiniciar o container
docker compose restart frontend

# Parar o container do frontend
docker compose stop frontend
```
Para rodar o projeto completo (**backend** + **frontend** via **Docker**), veja o [**README principal**](../README.md).