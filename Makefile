up:
	docker compose up -d

down:
	docker compose down

dev:
	npm run dev

build:
	npm run build

start:
	npm start

migrate:
	node src/run-migrate.js
