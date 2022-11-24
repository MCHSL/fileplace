# syntax=docker/dockerfile:1
FROM python:3.8-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /code

RUN apt-get update
RUN apt-get install -y build-essential dos2unix libpq-dev

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN dos2unix docker-entrypoint.sh && chmod +x docker-entrypoint.sh

ENTRYPOINT ["/code/docker-entrypoint.sh"]
