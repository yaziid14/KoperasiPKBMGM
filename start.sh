#!/bin/bash
set -eu

export PYTHONUNBUFFERED=true
VIRTUALENV=.data/venv

# Buat virtualenv jika belum ada
if [ ! -d "$VIRTUALENV" ]; then
  python3 -m venv "$VIRTUALENV"
fi

# Jika pip belum ada, ambil manual (karena ensurepip tidak tersedia)
if [ ! -f "$VIRTUALENV/bin/pip" ]; then
  curl --silent --show-error --retry 5 https://bootstrap.pypa.io/pip/3.6/get-pip.py | "$VIRTUALENV/bin/python"
fi

# Install/update pip dan install requirements
"$VIRTUALENV/bin/pip" install --upgrade pip setuptools wheel
"$VIRTUALENV/bin/pip" install -r requirements.txt

# Jalankan aplikasi
"$VIRTUALENV/bin/python" app.py
