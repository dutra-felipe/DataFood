# frontend/Dockerfile
FROM node:22-alpine
WORKDIR /app

# Copia APENAS o package.json
COPY package.json ./

# Instala as dependências (React, Axios, etc.)
RUN npm install

# Copia o resto do código-fonte
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]