# Base image
FROM openjdk:17-jdk-slim

# Diretório de trabalho
WORKDIR /app

# Copia todo o projeto
COPY . .

# Variáveis de ambiente para encoding
ENV LANG=C.UTF-8
ENV MAVEN_OPTS="-Dfile.encoding=UTF-8"

# Instala dependências necessárias
RUN apt-get update && apt-get install -y \
        maven \
        dos2unix \
        netcat \
        curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Ajusta encoding do properties (remove possíveis problemas de CRLF)
RUN dos2unix src/main/resources/application.properties

# Baixa e dá permissão de execução ao wait-for-it.sh
RUN curl -o wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x wait-for-it.sh

# Build do projeto com encoding UTF-8
RUN mvn clean package -DskipTests -Dproject.build.sourceEncoding=UTF-8

# Expõe porta da aplicação
EXPOSE 8080

# Comando para esperar o MySQL iniciar antes de rodar a aplicação
CMD ["./wait-for-it.sh", "mysql_armazenar:3306", "--", "java", "-jar", "app.jar"]
