'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

export default function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error(t('errors.fillAllFields'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      toast.success(result.message || t('success.messageSent'));
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(t('errors.failedToSend'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-muted/50 min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold">Contact Us</h1>
          <p className="text-muted-foreground text-lg">
            We're here to help. Reach out with any questions or concerns.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Form */}
          <Card className="p-8 lg:col-span-2">
            <h2 className="text-foreground mb-6 text-2xl font-semibold">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="mt-2 w-full resize-none rounded-lg border px-4 py-3"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                <Send className="mr-2 h-5 w-5" />
                Send Message
              </Button>
            </form>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <Mail className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-foreground mb-2 font-semibold">Email</h3>
              <p className="text-muted-foreground">support@localservices.com</p>
              <p className="text-muted-foreground text-sm">We respond within 24 hours</p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-foreground mb-2 font-semibold">Phone</h3>
              <p className="text-muted-foreground">+40 XXX XXX XXX</p>
              <p className="text-muted-foreground text-sm">Mon-Fri, 9am-6pm EET</p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-foreground mb-2 font-semibold">Office</h3>
              <p className="text-muted-foreground">
                București, România
                <br />
                [Your Business Address]
              </p>
            </Card>

            <Card className="bg-primary/5 p-6">
              <h3 className="text-foreground mb-3 font-semibold">Office Hours</h3>
              <div className="text-muted-foreground space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
