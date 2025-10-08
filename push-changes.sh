#!/bin/bash

# Day 2-3 Push Script

cd /Users/hectorestrada/Desktop/Velora

git add .

git commit -m "Day 2-3: Calendar, Time Handling, Cost Tracking & Language Support

📅 Calendar & Time Handling (Day 2):

• RFC 5545 compliant ICS generation with proper formatting
• Google Calendar & Outlook Calendar one-click links
• Weekend adjustment: Saturday/Sunday → Monday 9am automatically
• EOD handling: Default 5pm, configurable per user
• DST timezone support with automatic transition detection
• Comprehensive test suite for edge cases (leap years, timezones)

💰 Cost Tracking System (Day 3):

• Real-time per-user cost monitoring (emails, LLM, Firestore)
• Cost breakdown: \$0.50/1k emails, \$0.001/1k tokens (GPT-5-mini)
• COGS calculation: Target <30% of ARPU (\$15/month Pro)
• Health indicators: Green/Yellow/Red for profitability
• Monthly cost projections and estimates
• Firebase null-check fixes for reliability

🌍 Multilingual Support (Day 3):

• Language detection: English + Spanish with confidence scoring
• Spanish patterns: asks, promises, deadlines, polite phrases
• Language-specific draft templates
• Automatic pattern selection based on detected language

📁 New Files (5):
• frontend/lib/icsGenerator.ts - Calendar file generation
• frontend/lib/costTracker.ts - Cost monitoring
• frontend/lib/__tests__/aliasParser.test.ts - Timezone tests
• backend/lib/icsGenerator.ts - Backend ICS support
• backend/lib/languageDetector.ts - Multilingual patterns

🎯 Critical Improvements:
• Users can add follow-ups to calendar with one click
• No weekend scheduling (maintains professionalism)
• Real cost visibility prevents unprofitable users
• Spanish-speaking users get accurate detection
• All Firebase null checks for production reliability

Ready for Day 4: Observability & alert system."

git push origin main

echo "✅ Push complete!"

