#!/bin/bash

# Script pour télécharger le bulletin PDF de test
# ID Élève: 9
# ID Trimestre: 993

echo "📥 Téléchargement du bulletin PDF..."
echo ""

# URL de l'API (ajustez le port si nécessaire)
API_URL="http://localhost:5000/api/bulletins/eleve/9/trimestre/993/pdf"

# Nom du fichier de sortie
OUTPUT_FILE="bulletin_test_COMPAORE_3eme_trimestre.pdf"

# Télécharger le fichier
curl -X GET "$API_URL" \
  -H "Content-Type: application/json" \
  -o "$OUTPUT_FILE" \
  --silent \
  --show-error

if [ $? -eq 0 ]; then
  echo "✅ Bulletin téléchargé avec succès !"
  echo "📄 Fichier: $OUTPUT_FILE"
  echo ""
  echo "Vous pouvez ouvrir le fichier avec:"
  echo "  xdg-open $OUTPUT_FILE"
  echo "  ou"
  echo "  firefox $OUTPUT_FILE"
else
  echo "❌ Erreur lors du téléchargement"
  exit 1
fi
