// Debug script to show the exact redirect URI being used
console.log("=== THREADS OAUTH REDIRECT URI DEBUG ===")

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
const redirectUri = `${baseUrl}/api/auth/threads/callback`

console.log("Base URL:", baseUrl)
console.log("Redirect URI:", redirectUri)
console.log("")
console.log("🔧 ADD THIS EXACT URI TO YOUR THREADS APP SETTINGS:")
console.log("👉", redirectUri)
console.log("")
console.log("📋 Steps to fix:")
console.log("1. Go to https://developers.facebook.com/apps/")
console.log("2. Select your Threads app")
console.log("3. Go to 'Threads Basic Display' → 'Basic Display Settings'")
console.log("4. In 'Valid OAuth Redirect URIs', add:")
console.log("   -", redirectUri)
console.log("   - http://localhost:3000/api/auth/threads/callback (for local dev)")
console.log("5. Save the settings")
console.log("")
console.log("⚠️  The URI must match EXACTLY (including https/http)")
