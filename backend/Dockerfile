# syntax=docker/dockerfile:1
FROM python:3.8-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /code

COPY requirements.txt .

RUN apt-get update && apt-get install -y dos2unix \
	&& pip install --no-cache-dir -r requirements.txt

COPY . .

RUN dos2unix docker-entrypoint.sh && chmod +x docker-entrypoint.sh

ENTRYPOINT ["/code/docker-entrypoint.sh"]
