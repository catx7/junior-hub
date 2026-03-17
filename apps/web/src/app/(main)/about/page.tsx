import { Heart, Shield, Users, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui';
import { t } from '@localservices/shared';

const tr = (key: string) => t('ro', key);

export default function AboutPage() {
  const values = [
    { icon: Heart, titleKey: 'about.communityFirst', descKey: 'about.communityFirstDesc' },
    { icon: Shield, titleKey: 'about.safetyTrust', descKey: 'about.safetyTrustDesc' },
    { icon: Users, titleKey: 'about.inclusivity', descKey: 'about.inclusivityDesc' },
    { icon: Zap, titleKey: 'about.innovation', descKey: 'about.innovationDesc' },
  ];

  return (
    <div className="bg-muted/50 min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 pt-8">
        <Breadcrumb
          items={[{ label: 'Acasă', href: '/' }, { label: 'Despre noi' }]}
          className="mb-4"
        />
      </div>
      <div className="from-primary to-primary/70 bg-gradient-to-r py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-4 text-5xl font-bold text-white">{tr('about.pageTitle')}</h1>
          <p className="text-primary-foreground/80 text-xl">{tr('about.pageSubtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Card className="p-8">
          <h2 className="text-foreground mb-4 text-3xl font-bold">{tr('about.missionTitle')}</h2>
          <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
            {tr('about.missionP1')}
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">{tr('about.missionP2')}</p>
        </Card>

        <div className="mt-16">
          <h2 className="text-foreground mb-8 text-center text-3xl font-bold">
            {tr('about.valuesTitle')}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                    <Icon className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="text-foreground mb-2 text-xl font-semibold">
                    {tr(value.titleKey)}
                  </h3>
                  <p className="text-muted-foreground">{tr(value.descKey)}</p>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="mt-16 p-8">
          <h2 className="text-foreground mb-4 text-3xl font-bold">{tr('about.storyTitle')}</h2>
          <div className="text-muted-foreground space-y-4">
            <p>{tr('about.storyP1')}</p>
            <p>{tr('about.storyP2')}</p>
            <p>{tr('about.storyP3')}</p>
          </div>
        </Card>

        <div className="mt-16">
          <h2 className="text-foreground mb-8 text-center text-3xl font-bold">
            {tr('about.teamTitle')}
          </h2>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-lg">{tr('about.teamDesc')}</p>
          </Card>
        </div>

        <Card className="from-primary/5 to-primary/10 mt-16 bg-gradient-to-r p-8 text-center">
          <h2 className="text-foreground mb-4 text-2xl font-bold">{tr('about.contactTitle')}</h2>
          <p className="text-muted-foreground mb-6">{tr('about.contactDesc')}</p>
          <a
            href="/contact"
            className="bg-primary hover:bg-primary/90 inline-block rounded-lg px-6 py-3 font-medium text-white transition"
          >
            {tr('about.contactButton')}
          </a>
        </Card>
      </div>
    </div>
  );
}
