import { Card } from '@/components/ui/card';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Declarație de Accesibilitate | JuniorHub',
  description:
    'Declarația de accesibilitate JuniorHub conform Directivei Europene de Accesibilitate 2019/882.',
};

export default function AccessibilityPage() {
  return (
    <div className="bg-muted/50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-foreground mb-8 text-4xl font-bold">Declarație de Accesibilitate</h1>

        <Card className="prose prose-gray max-w-none p-8">
          <p className="text-muted-foreground text-sm">Ultima actualizare: 16.03.2026</p>

          <h2>Angajamentul nostru</h2>
          <p>
            JuniorHub se angajează să asigure accesibilitatea digitală pentru persoanele cu
            dizabilități, în conformitate cu Directiva Europeană privind Accesibilitatea (2019/882)
            și Legea nr. 448/2006 privind protecția și promovarea drepturilor persoanelor cu
            handicap.
          </p>
          <p>
            Ne străduim să respectăm standardele WCAG 2.1 nivel AA (Web Content Accessibility
            Guidelines) pentru a ne asigura că platforma noastră este utilizabilă de către cât mai
            mulți oameni.
          </p>

          <h2>Măsuri de accesibilitate implementate</h2>
          <ul>
            <li>
              <strong>Contrast culori:</strong> Culorile primare respectă raportul de contrast minim
              de 4.5:1 (WCAG AA)
            </li>
            <li>
              <strong>Navigare cu tastatura:</strong> Toate elementele interactive sunt accesibile
              prin navigare cu tastatura
            </li>
            <li>
              <strong>Text alternativ:</strong> Imaginile includ text alternativ descriptiv
            </li>
            <li>
              <strong>Structură semantică:</strong> Utilizăm HTML semantic cu heading-uri ierarhice
              corecte
            </li>
            <li>
              <strong>Responsiv:</strong> Platforma se adaptează la orice dimensiune de ecran
            </li>
            <li>
              <strong>Zoom:</strong> Conținutul rămâne funcțional la zoom de până la 200%
            </li>
            <li>
              <strong>Etichete formulare:</strong> Toate câmpurile de formular au etichete asociate
            </li>
            <li>
              <strong>Mod întunecat:</strong> Suportă preferința de sistem pentru mod întunecat
            </li>
          </ul>

          <h2>Limitări cunoscute</h2>
          <p>
            Lucrăm continuu la îmbunătățirea accesibilității. Următoarele aspecte sunt în curs de
            dezvoltare:
          </p>
          <ul>
            <li>Navigare cu screen reader - optimizare în curs pentru NVDA și VoiceOver</li>
            <li>Atribute ARIA pentru meniuri dropdown și modale</li>
            <li>Link &quot;Skip to content&quot; pentru navigare rapidă</li>
            <li>Subtitrări pentru eventualele conținuturi video</li>
          </ul>

          <h2>Feedback și contact</h2>
          <p>
            Dacă întâmpinați probleme de accesibilitate pe platforma noastră sau aveți sugestii
            pentru îmbunătățire, vă rugăm să ne contactați:
          </p>
          <ul>
            <li>
              Email: <a href="mailto:accesibilitate@juniorhub.ro">accesibilitate@juniorhub.ro</a>
            </li>
            <li>
              Formularul de contact: <Link href="/contact">pagina de contact</Link>
            </li>
          </ul>
          <p>
            Vom depune eforturi pentru a răspunde în termen de 5 zile lucrătoare și pentru a rezolva
            problemele raportate.
          </p>

          <h2>Baza legală</h2>
          <ul>
            <li>Directiva (UE) 2019/882 privind Actul European de Accesibilitate</li>
            <li>EN 301 549 - Cerințe de accesibilitate pentru produse și servicii TIC</li>
            <li>WCAG 2.1 - Web Content Accessibility Guidelines</li>
            <li>Legea nr. 448/2006 privind protecția drepturilor persoanelor cu handicap</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
