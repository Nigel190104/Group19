FROM python:3.8-alpine
RUN apk add --no-cache python3 py3-pip
ENV PYTHONUNBUFFERED 1
WORKDIR /django_backend/Betterdays
# Install system dependencies
RUN apk add --no-cache gcc musl-dev python3-dev libffi-dev openssl-dev
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY . .
# Apply migrations to create the SQLite DB
RUN python3 manage.py migrate
RUN python3 manage.py mood_data