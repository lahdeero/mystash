docker run -d \
	--name dev-postgres \
	-e POSTGRES_PASSWORD=password \
	-v ./postgres-data/:/var/lib/postgresql/data \
  -p 5432:5432 \
	postgres


