ARG PYTHON_VERSION=3.8.1-alpine3.11

FROM python:${PYTHON_VERSION} as builder

ENV PYTHONUNBUFFERED 1

# Set build directory
WORKDIR /wheels

# Copy files necessary
COPY ./requirements.txt .

# Perform build and cleanup artifacts
RUN \
  apk add --no-cache \
    git \
    git-fast-import \
  && apk add --no-cache --virtual .build gcc musl-dev \
  && python -m pip install --upgrade pip \
  && pip install -r requirements.txt \
  && apk del .build gcc musl-dev \
  && rm -rf /usr/local/lib/python3.8/site-packages/mkdocs/themes/*/* \
  && rm -rf /tmp/*



# Set final MkDocs working directory
WORKDIR /docs

# Expose MkDocs development server port
EXPOSE 8000

# Start development server by default
ENTRYPOINT ["mkdocs"]
CMD ["serve", "--dev-addr=0.0.0.0:8000"]
