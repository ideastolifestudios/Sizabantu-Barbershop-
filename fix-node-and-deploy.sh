#!/bin/bash

echo "🚀 Starting Node.js fix and deployment..."

# Move layout/page if they are in the wrong spot
if [ -f "layout.tsx" ]; then
    mv layout.tsx app/layout.tsx
    mv page.tsx app/page.tsx
    echo "✅ Moved layout and page to /app directory"
fi

# Set Node.js version in package.json to 20 (Vercel preference)
sed -i 's/"node": ">=18.17.0"/"node": "20.x"/g' package.json

# Clean up any leftover debris
rm -f fix-booking-service.patch sizabantu-os.zip

# Add, Commit, and Push
git add .
git commit -m "fix: node version and directory structure for Sizabantu OS v2"
git push origin main

# Final Production Deploy
echo "📦 Triggering Vercel Production Deploy..."
npx vercel --prod --yes
