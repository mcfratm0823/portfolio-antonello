#!/bin/bash

# Professional Template Generator Script
# Generates all 9 project files from master template

echo "🚀 PROFESSIONAL TEMPLATE GENERATOR"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "scripts/template-generator.js" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if master template exists
if [ ! -f "progetti/backup-progetti-interni.html" ]; then
    echo "❌ Error: Master template 'backup-progetti-interni.html' not found"
    exit 1
fi

# Check if projects data exists
if [ ! -f "js/projects-data.js" ]; then
    echo "❌ Error: Projects data file 'js/projects-data.js' not found"
    exit 1
fi

echo "✅ All dependencies found"
echo ""

# Generate all project files
echo "📝 Generating individual project files..."
node scripts/template-generator.js

echo ""
echo "🎉 Generation complete!"
echo ""
echo "📁 Generated files:"
ls -1 progetti/*.html | grep -E "(cafe-124|generali|audi|curasept|gpf|mediaset|intrum|gas-sales|mipharm).html" || echo "No project files found"

echo ""
echo "✨ Professional template generation finished!"