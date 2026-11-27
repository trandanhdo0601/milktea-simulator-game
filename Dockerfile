# ====================================================
# Stage 1: Build Frontend React / Vite
# ====================================================
FROM node:20-alpine AS fe-build
WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm ci

# Copy toàn bộ mã nguồn frontend và build ra thư mục dist
COPY index.html vite.config.js ./
COPY src/ ./src/
RUN npm run build

# ====================================================
# Stage 2: Build Backend Spring Boot với Frontend tĩnh
# ====================================================
FROM maven:3.9.9-eclipse-temurin-21 AS be-build
WORKDIR /app

COPY pom.xml .
COPY src ./src

# Nhúng thư mục dist từ Stage 1 vào static resources của Spring Boot
COPY --from=fe-build /app/dist ./src/main/resources/static

RUN mvn -B -DskipTests package

# ====================================================
# Stage 3: Runtime image nhỏ gọn chạy Java
# ====================================================
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=be-build /app/target/milk-tea-game-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 10000

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-Xmx350m", "-Xms128m", "-Xss512k", "-jar", "app.jar"]
