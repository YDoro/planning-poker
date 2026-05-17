.PHONY: help welcome prepare dev test test\:local build

help: welcome
	@echo "Comandos disponíveis:"
	@echo "  prepare    - Prepara o ambiente e instala dependências"
	@echo "  dev        - Inicia o ambiente de desenvolvimento via Docker Compose"
	@echo "  test       - Roda testes dentro do Docker"
	@echo "  test:local - Roda testes localmente"
	@echo "  build      - Compila a aplicação"

welcome:
	@printf "\033[33m  ____  _                   _               ____       _              \n\033[0m"
	@printf "\033[33m |  _ \\\\| | __ _ _ __  _ __ (_)_ __   __ _  |  _ \\\\ ___ | | _____ _ __  \n\033[0m"
	@printf "\033[33m | |_) | |/ _\` | '_ \\\\| '_ \\\\| | '_ \\\\ / _\` | | |_) / _ \\\\| |/ / _ \\\\ '__| \n\033[0m"
	@printf "\033[33m |  __/| | (_| | | | | | | | | | | | (_| | |  __/ (_) |   <  __/ |    \n\033[0m"
	@printf "\033[33m |_|   |_|\\__,_|_| |_|_| |_|_|_| |_|\\__, | |_|   \\___/|_|\\_\\___|_|    \n\033[0m"
	@printf "\033[33m                                    |___/                             \n\033[0m"
	@echo ""

prepare: welcome
	@echo "=> Preparing environment..."
	@if [ ! -f .env ]; then \
		if [ -f .env.default ]; then cp .env.default .env; echo "=> Copied .env.default to .env"; \
		elif [ -f .env.example ]; then cp .env.example .env; echo "=> Copied .env.example to .env"; \
		else echo "=> No .env.default or .env.example found"; fi \
	fi
	@echo "=> Installing dependencies..."
	yarn install

dev: welcome
	@echo "=> Starting development environment via Docker Compose..."
	docker compose up

test: welcome
	@echo "=> Running tests inside Docker..."
	docker compose run --rm app yarn test

test\:local: welcome
	@echo "=> Running tests locally..."
	yarn test

build: welcome
	@echo "=> Building the application..."
	yarn build
