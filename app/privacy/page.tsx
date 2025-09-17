export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us, such as when you create an account, connect your
              Threads account, or contact us for support.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Account information (email address, username)</li>
              <li>Threads account connection data and access tokens</li>
              <li>Auto-reply templates, keywords, and response settings</li>
              <li>Message interaction data and reply statistics</li>
              <li>Usage analytics and performance data</li>
              <li>Device information and IP addresses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide and maintain our automated reply service for Threads</li>
              <li>Monitor your Threads mentions and comments for auto-reply triggers</li>
              <li>Process and send automated replies on your behalf through Threads API</li>
              <li>Analyze engagement patterns to improve reply effectiveness</li>
              <li>Improve our service and develop new automation features</li>
              <li>Communicate with you about your account and our services</li>
              <li>Ensure compliance with Threads platform policies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Threads Integration</h2>
            <p className="mb-4">When you connect your Threads account, we access and process:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Your Threads profile information (username, display name)</li>
              <li>Mentions and comments on your Threads posts</li>
              <li>Permission to post replies on your behalf</li>
              <li>Thread engagement metrics for optimization</li>
            </ul>
            <p className="mb-4">
              We only access the minimum data necessary to provide our auto-reply service and comply with Meta's data
              usage policies. Your Threads data is processed in accordance with Meta's Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
            <p className="mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties except as
              described in this policy. We may share your information with:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Service providers who assist in operating our platform</li>
              <li>Legal authorities when required by law</li>
              <li>Other parties with your explicit consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of certain communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <p className="mb-4">
              We retain your personal information for as long as your account is active or as needed to provide
              services. Threads connection data and reply templates are stored until you disconnect your account or
              delete your data. Analytics data may be retained in aggregated, anonymized form for service improvement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="mb-4">
              Our service integrates with Meta's Threads platform and may use other third-party services:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Meta Threads API for account connection and posting</li>
              <li>Supabase for secure data storage and authentication</li>
              <li>Vercel for hosting and performance monitoring</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:racksmartseo@gmail.com" className="text-primary hover:underline">
                racksmartseo@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
