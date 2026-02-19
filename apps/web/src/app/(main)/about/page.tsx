import { Heart, Shield, Users, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: 'Community First',
      description:
        'We believe in building strong, supportive local communities where neighbors help neighbors.',
    },
    {
      icon: Shield,
      title: 'Safety & Trust',
      description:
        'Provider verification and background checks ensure the safety of families and children.',
    },
    {
      icon: Users,
      title: 'Inclusivity',
      description:
        'Everyone deserves access to quality services, regardless of background or income.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'AI-powered tools help parents make informed decisions about health and safety.',
    },
  ];

  return (
    <div className="bg-muted/50 min-h-screen">
      {/* Hero */}
      <div className="from-primary to-primary/70 bg-gradient-to-r py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-4 text-5xl font-bold text-white">About JuniorHub</h1>
          <p className="text-primary-foreground/80 text-xl">
            Connecting families with trusted local service providers
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Card className="p-8">
          <h2 className="text-foreground mb-4 text-3xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
            JuniorHub was created to make finding reliable, trustworthy local services simple and
            safe for families. Whether you need a babysitter, house cleaning, or homemade Romanian
            food, we connect you with verified providers in your community.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We empower parents to make informed decisions about their children's wellbeing through
            our community-driven platform and trusted network of service providers.
          </p>
        </Card>

        {/* Values */}
        <div className="mt-16">
          <h2 className="text-foreground mb-8 text-center text-3xl font-bold">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                    <Icon className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="text-foreground mb-2 text-xl font-semibold">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Story */}
        <Card className="mt-16 p-8">
          <h2 className="text-foreground mb-4 text-3xl font-bold">Our Story</h2>
          <div className="text-muted-foreground space-y-4">
            <p>
              JuniorHub was born from a simple need: finding reliable childcare in a new city. As
              parents ourselves, we experienced the anxiety of entrusting our children to strangers
              and the frustration of unreliable services.
            </p>
            <p>
              We realized that technology could solve this problem - not by replacing human
              connection, but by enhancing it. By combining thorough verification, community
              reviews, and innovative AI tools, we created a platform where families can find
              services they can truly trust.
            </p>
            <p>
              Today, JuniorHub serves thousands of families across Romania, connecting them with
              verified providers for babysitting, house cleaning, local food, and more.
            </p>
          </div>
        </Card>

        {/* Team */}
        <div className="mt-16">
          <h2 className="text-foreground mb-8 text-center text-3xl font-bold">
            Built for Families, by Families
          </h2>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-lg">
              Our team of parents, developers, and child safety experts work together to create the
              safest, most reliable platform for local services.
            </p>
          </Card>
        </div>

        {/* Contact CTA */}
        <Card className="from-primary/5 to-primary/10 mt-16 bg-gradient-to-r p-8 text-center">
          <h2 className="text-foreground mb-4 text-2xl font-bold">Get in Touch</h2>
          <p className="text-muted-foreground mb-6">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <a
            href="/contact"
            className="bg-primary hover:bg-primary/90 inline-block rounded-lg px-6 py-3 font-medium text-white transition"
          >
            Contact Us
          </a>
        </Card>
      </div>
    </div>
  );
}
