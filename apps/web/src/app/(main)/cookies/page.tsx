import { Card } from '@/components/ui/card';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica Cookie-uri | JuniorHub',
  description: 'Politica privind cookie-urile utilizate pe platforma JuniorHub.',
};

export default function CookiePolicyPage() {
  return (
    <div className="bg-muted/50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-foreground mb-8 text-4xl font-bold">
          Politica privind Cookie-urile / Cookie Policy
        </h1>

        <Card className="prose prose-gray max-w-none p-8">
          <p className="text-muted-foreground text-sm">
            Ultima actualizare / Last updated: 15.03.2026
          </p>

          <h2>1. Ce sunt cookie-urile?</h2>
          <p>
            Cookie-urile sunt fișiere text mici care sunt stocate pe dispozitivul dumneavoastră
            (computer, telefon, tabletă) atunci când vizitați un site web. Acestea sunt utilizate pe
            scară largă pentru a face site-urile web să funcționeze mai eficient și pentru a furniza
            informații proprietarilor site-ului.
          </p>

          <h2>2. Cum folosim cookie-urile</h2>
          <p>
            JuniorHub utilizează cookie-uri și tehnologii similare în conformitate cu Legea nr.
            506/2004 privind prelucrarea datelor cu caracter personal și protecția vieții private în
            sectorul comunicațiilor electronice și Directiva ePrivacy (2002/58/CE).
          </p>

          <h2>3. Tipuri de cookie-uri utilizate</h2>

          <h3>3.1 Cookie-uri strict necesare</h3>
          <p>
            Aceste cookie-uri sunt esențiale pentru funcționarea site-ului și nu pot fi dezactivate.
            Ele sunt setate de obicei ca răspuns la acțiunile dvs., cum ar fi autentificarea,
            completarea formularelor sau setarea preferințelor de confidențialitate.
          </p>
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Furnizor</th>
                <th>Scop</th>
                <th>Durată</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>__session</td>
                <td>Firebase Auth</td>
                <td>Autentificare utilizator</td>
                <td>Sesiune</td>
              </tr>
              <tr>
                <td>juniorhub-cookie-consent</td>
                <td>JuniorHub</td>
                <td>Stocarea preferințelor de cookie</td>
                <td>1 an</td>
              </tr>
              <tr>
                <td>__vercel_*</td>
                <td>Vercel</td>
                <td>Funcționalitate hosting</td>
                <td>Sesiune</td>
              </tr>
            </tbody>
          </table>

          <h3>3.2 Cookie-uri funcționale</h3>
          <p>
            Aceste cookie-uri permit site-ului să ofere funcționalități și personalizare
            îmbunătățite, cum ar fi limba preferată și setările de afișare.
          </p>
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Furnizor</th>
                <th>Scop</th>
                <th>Durată</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>juniorhub-locale</td>
                <td>JuniorHub</td>
                <td>Preferința de limbă</td>
                <td>1 an</td>
              </tr>
              <tr>
                <td>juniorhub-theme</td>
                <td>JuniorHub</td>
                <td>Preferința de temă (light/dark)</td>
                <td>1 an</td>
              </tr>
            </tbody>
          </table>

          <h3>3.3 Cookie-uri analitice</h3>
          <p>
            Aceste cookie-uri ne permit să numărăm vizitele și sursele de trafic pentru a putea
            măsura și îmbunătăți performanța site-ului. Necesită consimțământul dumneavoastră.
          </p>

          <h3>3.4 Cookie-uri de marketing</h3>
          <p>
            Aceste cookie-uri pot fi setate prin intermediul site-ului nostru de către partenerii
            noștri de publicitate. Necesită consimțământul dumneavoastră explicit.
          </p>

          <h2>4. Cum puteți controla cookie-urile</h2>

          <h3>4.1 Prin banner-ul de consimțământ</h3>
          <p>
            La prima vizită pe site, vi se va afișa un banner de consimțământ pentru cookie-uri.
            Puteți alege să acceptați toate cookie-urile, să le respingeți pe cele neesențiale sau
            să vă personalizați preferințele.
          </p>

          <h3>4.2 Prin setările browser-ului</h3>
          <p>
            Majoritatea browserelor vă permit să controlați cookie-urile prin setările lor. Puteți
            seta browser-ul să refuze cookie-urile sau să le șteargă pe cele existente:
          </p>
          <ul>
            <li>
              <strong>Chrome:</strong> Setări → Confidențialitate și securitate → Cookie-uri
            </li>
            <li>
              <strong>Firefox:</strong> Setări → Confidențialitate și securitate
            </li>
            <li>
              <strong>Safari:</strong> Preferințe → Confidențialitate
            </li>
            <li>
              <strong>Edge:</strong> Setări → Cookie-uri și permisiuni site
            </li>
          </ul>

          <h3>4.3 Modificarea preferințelor</h3>
          <p>
            Puteți modifica oricând preferințele de cookie-uri prin linkul &quot;Setări
            Cookie-uri&quot; din subsolul fiecărei pagini.
          </p>

          <h2>5. Cookie-uri terțe</h2>
          <p>
            Unele cookie-uri sunt plasate de servicii terțe care apar pe paginile noastre. Nu
            controlăm aceste cookie-uri terțe. Vă recomandăm să consultați politicile de
            confidențialitate ale acestor servicii:
          </p>
          <ul>
            <li>
              <strong>Google/Firebase:</strong> Autentificare, notificări push
            </li>
            <li>
              <strong>Cloudinary:</strong> Stocarea imaginilor
            </li>
            <li>
              <strong>Vercel:</strong> Hosting
            </li>
          </ul>

          <h2>6. Temeiul legal</h2>
          <p>
            Cookie-urile strict necesare sunt procesate pe baza interesului nostru legitim de a
            asigura funcționarea corectă a platformei (Art. 6(1)(f) GDPR). Toate celelalte
            cookie-uri sunt procesate exclusiv pe baza consimțământului dumneavoastră (Art. 6(1)(a)
            GDPR), în conformitate cu Legea nr. 506/2004.
          </p>

          <h2>7. Actualizări ale politicii</h2>
          <p>
            Putem actualiza periodic această politică privind cookie-urile. Orice modificare
            semnificativă va fi notificată prin afișarea unui nou banner de consimțământ.
          </p>

          <h2>8. Contact</h2>
          <p>Pentru întrebări referitoare la utilizarea cookie-urilor, contactați-ne la:</p>
          <ul>
            <li>Email: privacy@juniorhub.ro</li>
            <li>Adresă: [Adresa companiei]</li>
          </ul>

          <p>
            Consultați și{' '}
            <Link href="/privacy" className="text-primary underline">
              Politica de Confidențialitate
            </Link>{' '}
            pentru informații complete despre prelucrarea datelor dumneavoastră personale.
          </p>
        </Card>
      </div>
    </div>
  );
}
