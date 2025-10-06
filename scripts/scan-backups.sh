#!/bin/bash
# Script to scan for backup files that shouldn't exist

echo "🔍 Scanning for backup files..."

# Find backup files
backup_files=$(find . -type f \( \
  -name "*copy*" -o \
  -name "*-copy.*" -o \
  -name "*.bak" -o \
  -name "*.backup.*" -o \
  -name "*.orig" -o \
  -name "*.old.*" -o \
  -name "*_backup*" \
\) -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.next/*")

if [ -z "$backup_files" ]; then
  echo "✅ No backup files found"
  exit 0
else
  echo "❌ Found backup files:"
  echo "$backup_files"
  exit 1
fi