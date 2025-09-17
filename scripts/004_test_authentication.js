// Test script to verify authentication and database setup
// This script tests the core functionality of the Threads Auto Reply app

console.log("🧪 Testing Threads Auto Reply Authentication & Database Setup")
console.log("=".repeat(60))

// Test 1: Environment Variables
console.log("\n1. Testing Environment Variables:")
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "THREADS_CLIENT_ID",
  "THREADS_CLIENT_SECRET",
  "NEXT_PUBLIC_APP_URL",
]

requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar]
  if (value) {
    console.log(`✅ ${envVar}: ${envVar.includes("SECRET") || envVar.includes("KEY") ? "***" : value}`)
  } else {
    console.log(`❌ ${envVar}: Not set`)
  }
})

// Test 2: Database Connection
console.log("\n2. Testing Database Connection:")
try {
  // Import Supabase client
  const { createClient } = require("@supabase/supabase-js")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log("✅ Supabase client created successfully")

    // Test database connection by checking tables
    supabase
      .from("users")
      .select("count", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (error) {
          console.log("❌ Database connection failed:", error.message)
        } else {
          console.log("✅ Database connection successful")
          console.log(`📊 Users table accessible (${count || 0} records)`)
        }
      })
      .catch((err) => {
        console.log("❌ Database test failed:", err.message)
      })
  } else {
    console.log("❌ Supabase environment variables not configured")
  }
} catch (error) {
  console.log("❌ Failed to test database connection:", error.message)
}

// Test 3: Threads OAuth Configuration
console.log("\n3. Testing Threads OAuth Configuration:")
const threadsClientId = process.env.THREADS_CLIENT_ID
const threadsClientSecret = process.env.THREADS_CLIENT_SECRET
const appUrl = process.env.NEXT_PUBLIC_APP_URL

if (threadsClientId && threadsClientSecret && appUrl) {
  console.log("✅ Threads OAuth credentials configured")
  console.log(`📱 Client ID: ${threadsClientId}`)
  console.log(`🔗 Redirect URI: ${appUrl}/api/auth/threads/callback`)

  // Test OAuth URL generation
  const params = new URLSearchParams({
    client_id: threadsClientId,
    redirect_uri: `${appUrl}/api/auth/threads/callback`,
    scope: "threads_basic,threads_content_publish,threads_manage_insights",
    response_type: "code",
    state: "test-state",
  })

  const authUrl = `https://threads.net/oauth/authorize?${params.toString()}`
  console.log("✅ OAuth URL generated successfully")
  console.log(`🔗 Auth URL: ${authUrl.substring(0, 100)}...`)
} else {
  console.log("❌ Threads OAuth configuration incomplete")
  if (!threadsClientId) console.log("   Missing: THREADS_CLIENT_ID")
  if (!threadsClientSecret) console.log("   Missing: THREADS_CLIENT_SECRET")
  if (!appUrl) console.log("   Missing: NEXT_PUBLIC_APP_URL")
}

// Test 4: API Endpoints
console.log("\n4. Testing API Endpoints:")
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

const endpoints = [
  "/api/auth/threads",
  "/api/auth/threads/callback",
  "/api/threads/accounts",
  "/api/rules",
  "/api/templates",
  "/api/history",
]

console.log(`🌐 Base URL: ${baseUrl}`)
endpoints.forEach((endpoint) => {
  console.log(`📍 ${endpoint} - Ready for testing`)
})

console.log("\n" + "=".repeat(60))
console.log("🎉 Test Setup Complete!")
console.log("\nNext Steps:")
console.log("1. Deploy the app to Vercel")
console.log("2. Test user registration at /auth/sign-up")
console.log("3. Test user login at /auth/login")
console.log("4. Test Threads account connection at /dashboard/accounts")
console.log("5. Monitor browser console for debug logs")
