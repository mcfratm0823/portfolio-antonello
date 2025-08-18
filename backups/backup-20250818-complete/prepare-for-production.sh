#!/bin/bash

# Prepare for Production Script
# Removes debug files and optimizes for deployment

echo "🚀 Preparing site for production..."

# Create production directory
mkdir -p production-ready
echo "📁 Created production-ready directory"

# Copy all files except debug and test files
rsync -av --exclude='*.backup' \
          --exclude='debug-*.js' \
          --exclude='double-load-*.js' \
          --exclude='test-*.html' \
          --exclude='*-wrapper.js' \
          --exclude='*-guard.js' \
          --exclude='backups/' \
          --exclude='docs/' \
          --exclude='production-ready/' \
          --exclude='.git/' \
          --exclude='prepare-for-production.sh' \
          --exclude='TECHNICAL_ISSUES.md' \
          --exclude='DOUBLE_LOAD_FIX_REPORT.md' \
          --exclude='EVENT_DRIVEN_ARCHITECTURE.md' \
          --exclude='MIGRATION_CHECKLIST.md' \
          ./ ./production-ready/

echo "📋 Copied files to production-ready directory"

# Remove debug files from js directory
cd production-ready/js
rm -f debug-init-tracker.js double-load-detector.js nuovahome-init-wrapper.js preloader-guard.js
echo "🗑️  Removed debug files"

# Remove old nuovahome.js since we're using refactored version
rm -f nuovahome.js
echo "🔄 Removed old nuovahome.js (using nuovahome-refactored.js)"

# Update index.html to remove debug script references
cd ..
sed -i.bak '/<script>.*debug=true/,/<\/script>/d' index.html
sed -i.bak '/<!-- Debug tracker/,/-->/d' index.html
rm -f index.html.bak
echo "✏️  Cleaned index.html"

# Create deployment info
cat > DEPLOYMENT_INFO.txt << EOF
Production Ready Build
Created: $(date)

Changes Made:
- Removed all debug files
- Removed test files
- Removed wrapper/guard files
- Cleaned HTML debug references
- Using nuovahome-refactored.js

Architecture:
- Event-driven system (core/*.js)
- Module-based initialization
- Single entry point (app.js)

Test Before Deploy:
1. Open index.html locally
2. Check console for errors
3. Verify no double loading
4. Test all animations
5. Test navigation

EOF

echo "📄 Created deployment info"
echo ""
echo "✅ Production preparation complete!"
echo ""
echo "Next steps:"
echo "1. Test the site in production-ready directory"
echo "2. Deploy the production-ready directory to your server"
echo "3. Keep the original directory as development version"
echo ""
echo "Files are ready in: ./production-ready/"