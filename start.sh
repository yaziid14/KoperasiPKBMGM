#!/bin/bash
set -eu

export PYTHONUNBUFFERED=true

VIRTUALENV=.data/venv

# Buat virtualenv kalau belum ada
if [ ! -d "$VIRTUALENV" ]; then
  python3 -m venv "$VIRTUALENV"
fi

# Install pip kalau belum ada
if [ ! -f "$VIRTUALENV/bin/pip" ]; then
  curl --silent --show-error --retry 5 https://bootstrap.pypa.io/get-pip.py | "$VIRTUALENV/bin/python"
fi

# Install semua requirements
"$VIRTUALENV/bin/pip" install -r requirements.txt

# Jalankan app
"$VIRTUALENV/bin/python" app.py
