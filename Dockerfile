FROM openjdk:17-jdk-slim

WORKDIR /app

# Instala dependências
RUN apt-get update && apt-get install -y dos2unix netcat curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copia o script e converte formato
COPY wait-for-it.sh wait-for-it.sh
RUN dos2unix wait-for-it.sh && chmod +x wait-for-it.sh

# Copia o JAR buildado
COPY target/armazenar-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["./wait-for-it.sh", "mysql_armazenar:3306", "--", "java", "-jar", "app.jar"]
