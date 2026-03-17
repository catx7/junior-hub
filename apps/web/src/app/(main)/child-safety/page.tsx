import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Phone, AlertTriangle, Heart, BookOpen, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Siguranța Copiilor',
  description:
    'Informații despre siguranța copiilor, numere de urgență și proceduri de raportare pe platforma JuniorHub.',
};

export default function ChildSafetyPage() {
  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="text-primary h-8 w-8" />
          <h1 className="text-foreground text-3xl font-bold">Siguranța Copiilor</h1>
        </div>

        {/* Emergency Numbers */}
        <div className="mb-8 rounded-xl border-2 border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-bold text-red-800 dark:text-red-300">Numere de Urgență</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="tel:112"
              className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-red-950/50"
            >
              <Phone className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">112</div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Urgențe (Poliție, Ambulanță, Pompieri)
                </div>
              </div>
            </a>
            <a
              href="tel:116111"
              className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-red-950/50"
            >
              <Phone className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">116 111</div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Telefonul Copilului - linie gratuită 24/7
                </div>
              </div>
            </a>
            <a
              href="tel:0800500500"
              className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-red-950/50"
            >
              <Phone className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  0800 500 500
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  DGASPC - Protecția Copilului
                </div>
              </div>
            </a>
            <a
              href="tel:0800801200"
              className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-red-950/50"
            >
              <Phone className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  0800 801 200
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Violență domestică - linie gratuită
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Mandatory Reporting */}
        <div className="bg-card mb-6 rounded-xl border p-6">
          <h2 className="text-foreground mb-4 flex items-center gap-2 text-xl font-bold">
            <AlertTriangle className="text-primary h-5 w-5" />
            Obligația de Raportare
          </h2>
          <p className="text-muted-foreground mb-3">
            Conform <strong>Legii 272/2004</strong> privind protecția și promovarea drepturilor
            copilului (Art. 89-91), orice persoană care are cunoștință despre un copil aflat în
            pericol, abuzat, neglijat sau exploatat are <strong>obligația legală</strong> de a
            raporta situația către:
          </p>
          <ul className="text-muted-foreground mb-4 list-inside list-disc space-y-1">
            <li>
              <strong>DGASPC</strong> (Direcția Generală de Asistență Socială și Protecția
              Copilului) din județul dvs.
            </li>
            <li>
              <strong>Poliția</strong> - apelați 112 în caz de pericol iminent
            </li>
            <li>
              <strong>Telefonul Copilului</strong> - 116 111 (gratuit, 24/7, confidențial)
            </li>
          </ul>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Nerespectarea obligației de raportare constituie contravenție și se sancționează conform
            legii.
          </p>
        </div>

        {/* Platform Safety Measures */}
        <div className="bg-card mb-6 rounded-xl border p-6">
          <h2 className="text-foreground mb-4 flex items-center gap-2 text-xl font-bold">
            <Shield className="text-primary h-5 w-5" />
            Măsurile Noastre de Siguranță
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="bg-primary/10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <span className="text-primary text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Verificarea Identității</h3>
                <p className="text-muted-foreground text-sm">
                  Toți furnizorii de servicii trebuie să își verifice identitatea prin documente
                  oficiale înainte de a putea oferi servicii.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-primary/10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <span className="text-primary text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Cazier Judiciar</h3>
                <p className="text-muted-foreground text-sm">
                  Persoanele care oferă servicii de îngrijire a copiilor trebuie să prezinte un
                  certificat de cazier judiciar valid (nu mai vechi de 6 luni), conform Legii
                  272/2004 și Legii 118/2019 privind Registrul Național al Infractorilor Sexuali.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-primary/10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <span className="text-primary text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Recenzii și Evaluări</h3>
                <p className="text-muted-foreground text-sm">
                  Sistemul de recenzii permite familiilor să evalueze furnizorii de servicii după
                  fiecare interacțiune, creând un istoric transparent.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-primary/10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <span className="text-primary text-sm font-bold">4</span>
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Moderarea Conținutului</h3>
                <p className="text-muted-foreground text-sm">
                  Monitorizăm activ platforma pentru a preveni comportamente inadecvate. Datele de
                  contact sunt protejate până când ambele părți agreează colaborarea.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Procedures During Babysitting */}
        <div className="bg-card mb-6 rounded-xl border p-6">
          <h2 className="text-foreground mb-4 flex items-center gap-2 text-xl font-bold">
            <Heart className="text-primary h-5 w-5" />
            Proceduri de Urgență în Timpul Îngrijirii
          </h2>
          <p className="text-muted-foreground mb-3">
            Recomandăm ca părinții și furnizorii să stabilească următoarele <strong>înainte</strong>{' '}
            de fiecare sesiune de îngrijire:
          </p>
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-foreground mb-2 font-semibold">Checklist Informații de Urgență:</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                Număr de telefon al ambilor părinți
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                Număr de telefon al medicului de familie al copilului
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                Alergii cunoscute ale copilului (alimentare, medicamentoase)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                Medicamente curente și dozaje
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                Adresa exactă unde se află copilul (pentru ambulanță)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                Persoana de contact alternativă (bunic, vecin de încredere)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                Locul unde se află trusa de prim ajutor
              </li>
            </ul>
          </div>
        </div>

        {/* Reporting on Platform */}
        <div className="bg-card mb-6 rounded-xl border p-6">
          <h2 className="text-foreground mb-4 flex items-center gap-2 text-xl font-bold">
            <BookOpen className="text-primary h-5 w-5" />
            Raportare pe Platformă
          </h2>
          <p className="text-muted-foreground mb-4">
            Dacă observați un comportament suspect sau inadecvat pe platformă, vă rugăm să:
          </p>
          <ol className="text-muted-foreground mb-4 list-inside list-decimal space-y-2 text-sm">
            <li>
              Raportați imediat utilizatorul din profilul acestuia folosind butonul{' '}
              <strong>&quot;Raportează&quot;</strong>
            </li>
            <li>
              Contactați-ne direct la{' '}
              <a href="mailto:siguranta@juniorhub.ro" className="text-primary hover:underline">
                siguranta@juniorhub.ro
              </a>{' '}
              pentru situații urgente
            </li>
            <li>
              În caz de pericol iminent pentru un copil, sunați <strong>112</strong> IMEDIAT, apoi
              raportați pe platformă
            </li>
          </ol>
          <p className="text-muted-foreground text-sm">
            Rapoartele referitoare la siguranța copiilor sunt tratate cu{' '}
            <strong>prioritate maximă</strong> și sunt investigate în cel mai scurt timp posibil.
          </p>
        </div>

        {/* External Resources */}
        <div className="bg-card mb-6 rounded-xl border p-6">
          <h2 className="text-foreground mb-4 text-xl font-bold">Resurse Utile</h2>
          <div className="space-y-2">
            <a
              href="https://copfranta.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary flex items-center gap-2 text-sm hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Autoritatea Națională pentru Protecția Drepturilor Copilului
            </a>
            <a
              href="https://www.telefonulcopilului.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary flex items-center gap-2 text-sm hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Telefonul Copilului - 116 111
            </a>
            <a
              href="https://www.salvaticopiiii.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary flex items-center gap-2 text-sm hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Salvați Copiii România
            </a>
          </div>
        </div>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          Ultima actualizare: Martie 2026 |{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Termeni și Condiții
          </Link>{' '}
          |{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Politica de Confidențialitate
          </Link>
        </p>
      </div>
    </div>
  );
}
