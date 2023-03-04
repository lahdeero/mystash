FROM postgres:9.6.12
COPY ./sql/create_tables.sql /docker-entrypoint-initdb.d/

ENV POSTGRES_PASSWORD=password

EXPOSE 5432
