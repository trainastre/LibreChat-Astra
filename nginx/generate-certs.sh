#!/bin/bash
# Génère un certificat SSL auto-signé pour astra.ia
# Fonctionne avec Git Bash, WSL, ou Linux/macOS

mkdir -p "$(dirname "$0")/ssl"

# MSYS_NO_PATHCONV=1 empêche Git Bash de convertir les chemins Unix → Windows
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "$(pwd)/nginx/ssl:/ssl" \
  alpine sh -c "
    mkdir -p /ssl && \
    apk add --no-cache openssl && \
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
      -keyout /ssl/astra.ia.key \
      -out /ssl/astra.ia.crt \
      -subj '/C=FR/ST=Local/L=Local/O=Local/CN=astra.ia' \
      -addext 'subjectAltName=DNS:astra.ia' && \
    chmod 644 /ssl/astra.ia.key /ssl/astra.ia.crt
  "

echo "Certificats générés dans nginx/ssl/"
echo ""
echo "N'oublie pas d'ajouter dans C:\\Windows\\System32\\drivers\\etc\\hosts :"
echo "  127.0.0.1  astra.ia"
