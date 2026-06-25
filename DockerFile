FROM postgres:15

ENV POSTGRES_USER=bytestore_user
ENV POSTGRES_PASSWORD=bytestore_pass
ENV POSTGRES_DB=bytestore_db

COPY src/db/init.sql /docker-entrypoint-initdb.d/init.sql

EXPOSE 5432