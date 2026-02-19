import { Card } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-muted/50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-foreground mb-8 text-4xl font-bold">Privacy Policy</h1>

        <Card className="prose prose-gray max-w-none p-8">
          <p className="text-muted-foreground text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p className="text-muted-foreground text-sm">
            Effective date: {new Date().toLocaleDateString()}
          </p>

          <h2>1. Introduction</h2>
          <p>
            JuniorHub ("we", "our", "us") is committed to protecting your privacy. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your information when you
            use our platform.
          </p>
          <p>This policy complies with:</p>
          <ul>
            <li>EU General Data Protection Regulation (GDPR)</li>
            <li>Romanian Law 190/2018 on data protection</li>
            <li>Romanian Law 506/2004 on personal data processing</li>
          </ul>

          <h2>2. Information We Collect</h2>

          <h3>2.1 Information You Provide</h3>
          <ul>
            <li>
              <strong>Account Information:</strong> Name, email address, password, phone number
            </li>
            <li>
              <strong>Profile Information:</strong> Avatar, bio, location, languages
            </li>
            <li>
              <strong>Job Postings:</strong> Service descriptions, budgets, locations
            </li>
            <li>
              <strong>Messages:</strong> Communications with other users
            </li>
            <li>
              <strong>Payment Information:</strong> Processed by third-party providers
            </li>
            <li>
              <strong>Verification Documents:</strong> Government ID, background checks (for
              providers)
            </li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <ul>
            <li>
              <strong>Usage Data:</strong> Pages visited, features used, time spent
            </li>
            <li>
              <strong>Device Information:</strong> IP address, browser type, device type
            </li>
            <li>
              <strong>Location Data:</strong> Approximate location for service matching
            </li>
            <li>
              <strong>Cookies:</strong> Session cookies, preference cookies
            </li>
          </ul>

          <h2>3. How We Use Your Information</h2>

          <h3>Legal Basis for Processing (GDPR Article 6)</h3>
          <p>We process your data based on:</p>
          <ul>
            <li>
              <strong>Contract Performance:</strong> To provide services you requested
            </li>
            <li>
              <strong>Consent:</strong> For marketing communications (opt-in)
            </li>
            <li>
              <strong>Legitimate Interests:</strong> Platform improvement, fraud prevention
            </li>
            <li>
              <strong>Legal Obligation:</strong> Compliance with Romanian law
            </li>
          </ul>

          <h3>Specific Uses</h3>
          <ul>
            <li>Provide and maintain the Service</li>
            <li>Process transactions and send confirmations</li>
            <li>Send notifications about your account and activities</li>
            <li>Respond to your requests and provide customer support</li>
            <li>Detect, prevent, and address fraud and security issues</li>
            <li>Improve and personalize the Service</li>
            <li>Conduct provider verification and background checks</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Data Sharing and Disclosure</h2>

          <h3>4.1 With Other Users</h3>
          <p>
            Your profile information, job postings, and reviews are visible to other users. Direct
            messages are only visible to conversation participants.
          </p>

          <h3>4.2 Service Providers</h3>
          <p>We share data with trusted third parties:</p>
          <ul>
            <li>
              <strong>Firebase (Google):</strong> Authentication, hosting
            </li>
            <li>
              <strong>Vercel:</strong> Website hosting
            </li>
            <li>
              <strong>Supabase:</strong> Database hosting
            </li>
            <li>
              <strong>Google Gemini AI:</strong> AI features (data not retained)
            </li>
            <li>
              <strong>Background check providers:</strong> For verification (with consent)
            </li>
          </ul>

          <h3>4.3 Legal Requirements</h3>
          <p>We may disclose your information if required by:</p>
          <ul>
            <li>Romanian or EU law</li>
            <li>Legal process or government request</li>
            <li>Protection of rights, property, or safety</li>
            <li>Prevention of fraud or security issues</li>
          </ul>

          <h2>5. Your Rights (GDPR)</h2>

          <p>Under Romanian and EU law, you have the right to:</p>

          <h3>5.1 Access (Article 15)</h3>
          <p>Request a copy of your personal data we hold.</p>

          <h3>5.2 Rectification (Article 16)</h3>
          <p>Correct inaccurate or incomplete data.</p>

          <h3>5.3 Erasure (Article 17)</h3>
          <p>Request deletion of your data ("right to be forgotten").</p>

          <h3>5.4 Restriction (Article 18)</h3>
          <p>Request limitation of data processing.</p>

          <h3>5.5 Portability (Article 20)</h3>
          <p>Receive your data in a structured, machine-readable format.</p>

          <h3>5.6 Object (Article 21)</h3>
          <p>Object to processing based on legitimate interests.</p>

          <h3>5.7 Withdraw Consent</h3>
          <p>Withdraw consent for marketing communications at any time.</p>

          <p>
            <strong>To exercise your rights, contact:</strong> privacy@localservices.com
          </p>

          <h2>6. Data Retention</h2>
          <p>We retain your data for:</p>
          <ul>
            <li>
              <strong>Account Data:</strong> Duration of account plus 30 days after deletion
            </li>
            <li>
              <strong>Transaction Records:</strong> 7 years (Romanian tax law requirement)
            </li>
            <li>
              <strong>Verification Documents:</strong> 7 years (legal compliance)
            </li>
            <li>
              <strong>Messages:</strong> Duration of conversation or until deleted
            </li>
            <li>
              <strong>AI Chat History:</strong> Not stored (processed in real-time only)
            </li>
            <li>
              <strong>Product Scans:</strong> Images deleted immediately after analysis
            </li>
          </ul>

          <h2>7. Children's Privacy</h2>
          <h3>7.1 Age Restriction</h3>
          <p>
            Our Service is not intended for children under 13. We do not knowingly collect personal
            information from children under 13. If we learn we have collected data from a child
            under 13, we will delete it.
          </p>

          <h3>7.2 Parental Consent</h3>
          <p>
            For users aged 13-18, parental consent is required in accordance with Romanian Law
            272/2004 on the protection of children's rights.
          </p>

          <h2>8. Data Security</h2>
          <p>We implement security measures including:</p>
          <ul>
            <li>SSL/TLS encryption for data transmission</li>
            <li>Encrypted storage of sensitive data</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
            <li>Secure third-party services (SOC 2 compliant)</li>
          </ul>

          <h2>9. Cookies and Tracking</h2>
          <h3>9.1 Types of Cookies</h3>
          <ul>
            <li>
              <strong>Essential Cookies:</strong> Required for platform functionality
            </li>
            <li>
              <strong>Preference Cookies:</strong> Remember your settings
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Understand usage patterns (with consent)
            </li>
          </ul>

          <h3>9.2 Cookie Consent</h3>
          <p>
            In compliance with Romanian Law 506/2004 and ePrivacy Directive, we request your consent
            for non-essential cookies.
          </p>

          <h2>10. International Data Transfers</h2>
          <p>
            Your data may be transferred to and processed in countries outside the European Economic
            Area (EEA). We ensure adequate protection through:
          </p>
          <ul>
            <li>Standard Contractual Clauses (EU-approved)</li>
            <li>Services certified under EU-US Data Privacy Framework</li>
            <li>Adequacy decisions by the European Commission</li>
          </ul>

          <h2>11. Data Breach Notification</h2>
          <p>In accordance with GDPR Article 33 and Romanian Law 190/2018, we will notify:</p>
          <ul>
            <li>
              <strong>Supervisory Authority (ANSPDCP):</strong> Within 72 hours of becoming aware
            </li>
            <li>
              <strong>Affected Users:</strong> Without undue delay if high risk to rights and
              freedoms
            </li>
          </ul>

          <h2>12. Third-Party Links</h2>
          <p>
            Our Service may contain links to third-party websites. We are not responsible for their
            privacy practices. We encourage you to review their privacy policies.
          </p>

          <h2>13. Changes to Privacy Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of material changes
            via:
          </p>
          <ul>
            <li>Email notification</li>
            <li>Platform notification</li>
            <li>Updated "Last modified" date</li>
          </ul>

          <h2>14. Contact and Complaints</h2>

          <h3>14.1 Data Protection Officer</h3>
          <p>
            Email: dpo@localservices.com
            <br />
            Address: [Your Romanian Business Address]
          </p>

          <h3>14.2 Supervisory Authority</h3>
          <p>You have the right to lodge a complaint with the Romanian supervisory authority:</p>
          <p>
            <strong>
              ANSPDCP (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter
              Personal)
            </strong>
            <br />
            Address: B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București
            <br />
            Phone: +40 21 252 5599
            <br />
            Website: www.dataprotection.ro
            <br />
            Email: anspdcp@dataprotection.ro
          </p>

          <h2>15. Definitions</h2>
          <ul>
            <li>
              <strong>Personal Data:</strong> Information relating to an identified or identifiable
              person
            </li>
            <li>
              <strong>Processing:</strong> Any operation performed on personal data
            </li>
            <li>
              <strong>Controller:</strong> JuniorHub (determines purposes and means of processing)
            </li>
            <li>
              <strong>Processor:</strong> Third parties processing data on our behalf
            </li>
          </ul>

          <h2>16. Your Choices</h2>
          <h3>16.1 Marketing Communications</h3>
          <p>Opt out of marketing emails via unsubscribe link or account settings.</p>

          <h3>16.2 Location Services</h3>
          <p>Disable location access in browser or device settings (may limit functionality).</p>

          <h3>16.3 Account Deletion</h3>
          <p>
            Request account deletion via Settings → Delete Account. Data will be permanently removed
            within 30 days, except where retention is required by law.
          </p>

          <hr />

          <p className="text-muted-foreground text-sm">
            <strong>Note:</strong> This Privacy Policy complies with Romanian and EU regulations as
            of the last updated date. Users should review periodically for changes.
          </p>
        </Card>
      </div>
    </div>
  );
}
