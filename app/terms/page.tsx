export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using Threads Auto Reply, you accept and agree to be bound by the terms and provision of
              this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
            <p className="mb-4">
              Threads Auto Reply is an automation service that helps users manage their Threads social media engagement
              through automated replies and intelligent response systems. Our service connects to your Threads account
              via Meta's official API to monitor mentions and comments, then automatically posts replies based on your
              predefined templates and keywords.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
            <p className="mb-4">You agree to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate and complete information when creating your account</li>
              <li>Maintain the security of your account credentials and Threads connection</li>
              <li>Use the service in compliance with all applicable laws and regulations</li>
              <li>Comply with Meta's Threads Terms of Service and Community Guidelines</li>
              <li>Not use the service for spam, harassment, or other prohibited activities</li>
              <li>Monitor and review automated replies to ensure appropriateness</li>
              <li>Take responsibility for all content posted through our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
            <p className="mb-4">You may not use our service to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Send spam, unsolicited messages, or promotional content</li>
              <li>Harass, abuse, or harm other users on Threads</li>
              <li>Violate any laws, regulations, or platform policies</li>
              <li>Impersonate others or provide false information</li>
              <li>Interfere with the proper functioning of Threads or our service</li>
              <li>Create automated replies that violate Threads community standards</li>
              <li>Use the service to manipulate engagement or spread misinformation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Threads Integration Terms</h2>
            <p className="mb-4">By connecting your Threads account, you acknowledge that:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>You grant us permission to access your Threads account via Meta's API</li>
              <li>You authorize us to post replies on your behalf based on your settings</li>
              <li>You remain responsible for all content posted through our service</li>
              <li>Meta may revoke API access, which could affect service functionality</li>
              <li>You must comply with Meta's developer terms and Threads policies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Service Limitations</h2>
            <p className="mb-4">Our service is subject to limitations imposed by the Threads API, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Rate limits on API requests and posting frequency</li>
              <li>Potential delays in processing mentions and posting replies</li>
              <li>Temporary service interruptions due to API maintenance</li>
              <li>Changes to Threads features that may affect functionality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
            <p className="mb-4">
              We strive to maintain high service availability but cannot guarantee uninterrupted access. We reserve the
              right to modify, suspend, or discontinue the service at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall Threads Auto Reply be liable for any indirect, incidental, special, consequential, or
              punitive damages arising out of your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account and access to the service immediately, without prior notice, for
              conduct that we believe violates these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via
              email or through the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:racksmartseo@gmail.com" className="text-primary hover:underline">
                racksmartseo@gmail.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
            <p className="mb-4">
              You retain ownership of your content and reply templates. By using our service, you grant us a limited
              license to process and post your content through the Threads API. We respect your intellectual property
              rights and expect the same from our users.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
