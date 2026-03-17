import { Card } from '@/components/ui/card';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Procedura de Notificare a Încălcărilor de Securitate | JuniorHub',
  description:
    'Procedura JuniorHub pentru gestionarea încălcărilor de securitate a datelor conform GDPR.',
};

export default function DataBreachPage() {
  return (
    <div className="bg-muted/50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-foreground mb-8 text-4xl font-bold">
          Procedura de Notificare a Încălcărilor de Securitate a Datelor
        </h1>

        <Card className="prose prose-gray max-w-none p-8">
          <p className="text-muted-foreground text-sm">
            Conform Regulamentului (UE) 2016/679 (GDPR), Articolele 33 și 34
          </p>

          <h2>1. Definiție</h2>
          <p>
            O &quot;încălcare a securității datelor cu caracter personal&quot; înseamnă o încălcare
            a securității care duce la distrugerea, pierderea, modificarea accidentală sau ilegală,
            sau la divulgarea neautorizată a datelor cu caracter personal transmise, stocate sau
            prelucrate în alt mod, sau la accesul neautorizat la acestea.
          </p>

          <h2>2. Detectare și Raportare Internă</h2>
          <ul>
            <li>
              Orice angajat sau colaborator care detectează o potențială încălcare trebuie să
              notifice imediat echipa tehnică.
            </li>
            <li>Echipa tehnică evaluează incidentul în maximum 4 ore de la raportare.</li>
            <li>
              Se documentează: data/ora descoperirii, natura încălcării, categoriile de date
              afectate, numărul aproximativ de persoane vizate.
            </li>
          </ul>

          <h2>3. Notificarea ANSPDCP (Art. 33 GDPR)</h2>
          <p>
            Dacă încălcarea este susceptibilă să genereze un risc pentru drepturile și libertățile
            persoanelor fizice, JuniorHub notifică Autoritatea Națională de Supraveghere a
            Prelucrării Datelor cu Caracter Personal (ANSPDCP) în termen de{' '}
            <strong>72 de ore</strong> de la luarea la cunoștință.
          </p>
          <p>Notificarea conține:</p>
          <ul>
            <li>Natura încălcării și categoriile de date afectate</li>
            <li>Numărul aproximativ de persoane vizate</li>
            <li>Numele și datele de contact ale responsabilului cu protecția datelor</li>
            <li>Consecințele probabile ale încălcării</li>
            <li>Măsurile luate sau propuse pentru remedierea încălcării</li>
          </ul>
          <p>
            Contact ANSPDCP:{' '}
            <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">
              www.dataprotection.ro
            </a>{' '}
            | B-dul G-ral Gheorghe Magheru nr. 28-30, Sector 1, București
          </p>

          <h2>4. Notificarea Persoanelor Vizate (Art. 34 GDPR)</h2>
          <p>
            Dacă încălcarea este susceptibilă să genereze un <strong>risc ridicat</strong> pentru
            drepturile și libertățile persoanelor fizice, JuniorHub informează persoanele vizate
            fără întârzieri nejustificate, prin:
          </p>
          <ul>
            <li>Email direct către utilizatorii afectați</li>
            <li>Notificare în aplicație</li>
            <li>Anunț public pe site (dacă numărul persoanelor vizate este foarte mare)</li>
          </ul>

          <h2>5. Măsuri de Remediere</h2>
          <ul>
            <li>Izolarea imediată a sistemelor afectate</li>
            <li>Resetarea credențialelor compromise</li>
            <li>Implementarea de patch-uri de securitate</li>
            <li>Monitorizare intensificată post-incident</li>
            <li>Revizuirea și actualizarea măsurilor de securitate</li>
          </ul>

          <h2>6. Registrul Încălcărilor</h2>
          <p>
            JuniorHub menține un registru al tuturor încălcărilor de securitate a datelor,
            indiferent dacă acestea necesită notificarea ANSPDCP sau a persoanelor vizate. Registrul
            conține: faptele legate de încălcare, efectele acesteia și măsurile de remediere luate.
          </p>

          <h2>7. Contact</h2>
          <p>Pentru a raporta o potențială încălcare de securitate:</p>
          <ul>
            <li>
              Email: <a href="mailto:security@juniorhub.ro">security@juniorhub.ro</a>
            </li>
            <li>Telefon urgențe: disponibil în contul de administrator</li>
          </ul>

          <div className="bg-muted mt-6 rounded-lg p-4 text-sm">
            <p className="mb-2 font-semibold">Documente conexe:</p>
            <ul className="space-y-1">
              <li>
                <Link href="/privacy" className="text-primary hover:underline">
                  Politica de Confidențialitate
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-primary hover:underline">
                  Termeni și Condiții
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-primary hover:underline">
                  Politica Cookie-uri
                </Link>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
