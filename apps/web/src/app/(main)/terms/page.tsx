import { Card } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="bg-muted/50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-foreground mb-8 text-4xl font-bold">Terms of Service</h1>

        <Card className="prose prose-gray max-w-none p-8">
          <p className="text-muted-foreground text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing and using JuniorHub ("Platform", "Service"), you accept and agree to be
            bound by the terms and provision of this agreement. These Terms of Service ("Terms")
            govern your access to and use of the JuniorHub website and mobile applications.
          </p>

          <h2>2. Use of Service</h2>
          <h3>2.1 Eligibility</h3>
          <p>
            You must be at least 18 years old to use this Service. By using this Service, you
            represent and warrant that you meet this requirement. Users under 18 may use the Service
            only with the involvement and consent of a parent or legal guardian.
          </p>

          <h3>2.2 Account Registration</h3>
          <p>To access certain features, you must register for an account. You agree to:</p>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information</li>
            <li>Maintain the security of your password</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of unauthorized use</li>
          </ul>

          <h2>3. Service Provider Verification</h2>
          <h3>3.1 Background Checks</h3>
          <p>
            Service providers offering childcare services must undergo background verification
            including:
          </p>
          <ul>
            <li>Government-issued identification verification</li>
            <li>Criminal background check</li>
            <li>Reference verification</li>
          </ul>

          <h3>3.2 Verification Disclaimer</h3>
          <p>
            While we conduct verification procedures, JuniorHub does not guarantee the accuracy,
            reliability, or safety of any service provider. Users are responsible for conducting
            their own due diligence.
          </p>

          <h2>4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit harmful or malicious code</li>
            <li>Harass, abuse, or harm another person</li>
            <li>Impersonate any person or entity</li>
            <li>Engage in fraudulent activities</li>
            <li>Post false, misleading, or deceptive content</li>
          </ul>

          <h2>5. Content and Intellectual Property</h2>
          <h3>6.1 Your Content</h3>
          <p>
            You retain ownership of content you post. By posting content, you grant JuniorHub a
            worldwide, non-exclusive, royalty-free license to use, reproduce, and display your
            content in connection with the Service.
          </p>

          <h3>6.2 Our Content</h3>
          <p>
            The Service and its original content (excluding user content), features, and
            functionality are owned by JuniorHub and are protected by international copyright,
            trademark, and other intellectual property laws.
          </p>

          <h2>7. Payment and Fees</h2>
          <p>
            Transactions between service requesters and providers are conducted directly between
            users. JuniorHub may charge platform fees or commissions as notified to users.
          </p>

          <h2>8. Liability and Disclaimers</h2>
          <h3>8.1 Service "As Is"</h3>
          <p>
            The Service is provided "as is" without warranties of any kind, either express or
            implied, including but not limited to warranties of merchantability, fitness for a
            particular purpose, or non-infringement.
          </p>

          <h3>8.2 Limitation of Liability</h3>
          <p>
            In accordance with Romanian Law 363/2018 and EU regulations, JuniorHub shall not be
            liable for:
          </p>
          <ul>
            <li>Indirect, incidental, special, consequential, or punitive damages</li>
            <li>Loss of profits, revenue, data, or use</li>
            <li>Actions or omissions of service providers</li>
            <li>Damage resulting from user interactions</li>
          </ul>

          <h2>9. Romanian Law Compliance</h2>
          <h3>9.1 GDPR Compliance</h3>
          <p>
            We comply with the General Data Protection Regulation (GDPR) and Romanian Law 190/2018.
            See our Privacy Policy for details on data processing.
          </p>

          <h3>9.2 Consumer Protection</h3>
          <p>
            Under Romanian Government Ordinance 21/1992 on consumer protection, you have the right
            to:
          </p>
          <ul>
            <li>Accurate information about services</li>
            <li>Protection against unfair practices</li>
            <li>Complaint resolution mechanisms</li>
          </ul>

          <h3>9.3 E-Commerce Regulations</h3>
          <p>
            This platform complies with Romanian Law 365/2002 on electronic commerce and Directive
            2000/31/EC.
          </p>

          <h2>10. Dispute Resolution</h2>
          <h3>10.1 Negotiation</h3>
          <p>
            In the event of any dispute, users agree to first attempt resolution through good-faith
            negotiation.
          </p>

          <h3>10.2 Mediation</h3>
          <p>
            If negotiation fails, disputes may be submitted to mediation in accordance with Romanian
            law.
          </p>

          <h3>10.3 Jurisdiction</h3>
          <p>
            These Terms shall be governed by Romanian law. Any disputes shall be resolved in the
            courts of Romania, with jurisdiction in Bucharest.
          </p>

          <h2>11. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service immediately, without
            prior notice, for conduct that we believe violates these Terms or is harmful to other
            users, us, or third parties, or for any other reason.
          </p>

          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of material
            changes via email or platform notification. Continued use of the Service after changes
            constitutes acceptance of the new Terms.
          </p>

          <h2>13. Contact Information</h2>
          <p>For questions about these Terms, please contact us at:</p>
          <ul>
            <li>Email: legal@localservices.com</li>
            <li>Address: [Your Romanian Business Address]</li>
            <li>Phone: [Your Contact Number]</li>
          </ul>

          <h2>14. Severability</h2>
          <p>
            If any provision of these Terms is held to be invalid or unenforceable, such provision
            shall be struck and the remaining provisions shall be enforced in accordance with
            Romanian law.
          </p>
        </Card>
      </div>
    </div>
  );
}
