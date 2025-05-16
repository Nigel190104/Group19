FROM node:15.13-alpine
WORKDIR /react

# Copy only package files first to leverage Docker caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest and build
COPY . .
CMD ["sh", "-c", "npm run build && npm start"]
