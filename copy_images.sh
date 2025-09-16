#!/bin/sh
# Simple script to copy image files

# Define source and destination paths
SRC="/Users/antonelloguarnieri/Desktop/sito web/Immagini lavori/lavori/gpf"
DST="/Users/antonelloguarnieri/Desktop/sito web/Prod3/progetti/gpf/img"

# Copy each file
cp "$SRC/gpf_blocco_uno.jpg" "$DST/"
cp "$SRC/gpf_blocco_due_uno.jpg" "$DST/"
cp "$SRC/gpf_blocco_due_due.jpg" "$DST/"

# List the destination directory to verify
echo "Files copied to destination:"
ls -la "$DST/"