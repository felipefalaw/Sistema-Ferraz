FROM openjdk:17-jdk-slim

WORKDIR /app

COPY . .

ENV LANG=C.UTF-8
ENV MAVEN_OPTS="-Dfile.encoding=UTF-8"

RUN apt-get update && apt-get install -y maven dos2unix netcat iconv \
    && iconv -f ISO-8859-1 -t UTF-8 src/main/resources/application.properties -o src/main/resources/application.properties.utf8 \
    && mv src/main/resources/application.properties.utf8 src/main/resources/application.properties \
    && dos2unix src/main/resources/application.properties \
    && chmod +x wait-for-it.sh

RUN mvn clean package -DskipTests

EXPOSE 8080

# Espera o MySQL estar pronto antes de iniciar
CMD ["./wait-for-it.sh", "db:3306", "--", "java", "-jar", "target/armazenar-0.0.1-SNAPSHOT.jar"]
