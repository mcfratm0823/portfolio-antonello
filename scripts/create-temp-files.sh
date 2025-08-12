#!/bin/bash

# Crea 6 file temporanei con slug diversi per evitare conflitti
for i in {1..6}; do
  cat > "data/temp-del-$i.json" << EOF
{
  "id": $((990 + i)),
  "slug": "temp-del-$i",
  "title": "-",
  "subtitle": "TEMPORANEO DA ELIMINARE",
  "category": "DIGITAL",
  "year": "2024",
  "client": "TEMP",
  "meta_description": "Temporaneo da eliminare",
  "info_block": {
    "label": "(INFO)",
    "text": "QUESTO È UN PROGETTO TEMPORANEO DA ELIMINARE"
  },
  "hero_image": "https://via.placeholder.com/150",
  "approach_block": {
    "label": "(APPROCCIO)",
    "text": "TEMPORANEO"
  },
  "gallery_pair": [],
  "extra_sections": [],
  "credits": [],
  "related_projects": []
}
EOF
done

echo "Creati 6 file temporanei con slug diversi"