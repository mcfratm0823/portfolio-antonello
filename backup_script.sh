#!/bin/bash

# Create backup directory
BACKUP_DIR="/Users/antonelloguarnieri/Desktop/sito web/Prod3/backups/backup-20250818-complete"
mkdir -p "$BACKUP_DIR"

# Copy all files and directories except the ones we want to exclude
rsync -av --exclude='backups/' --exclude='.git/' --exclude='node_modules/' "/Users/antonelloguarnieri/Desktop/sito web/Prod3/" "$BACKUP_DIR/"

echo "Backup completed successfully!"
echo "Backup location: $BACKUP_DIR"

# Get backup size
du -sh "$BACKUP_DIR"