import { Card } from '@/components/ui/card';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Protecția Consumatorilor (ANPC) | JuniorHub',
  description:
    'Informații despre protecția consumatorilor, formularul de retragere și drepturile dumneavoastră conform legislației române.',
};

export default function AnpcPage() {
  return (
    <div className="bg-muted/50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-foreground mb-8 text-4xl font-bold">
          Protecția Consumatorilor / Consumer Protection
        </h1>

        <Card className="prose prose-gray max-w-none p-8">
          <h2>Informații pentru consumatori</h2>
          <p>
            JuniorHub respectă drepturile consumatorilor în conformitate cu legislația română și
            europeană, inclusiv:
          </p>
          <ul>
            <li>OG nr. 21/1992 privind protecția consumatorilor</li>
            <li>OUG nr. 34/2014 privind drepturile consumatorilor în contractele la distanță</li>
            <li>Legea nr. 365/2002 privind comerțul electronic</li>
            <li>Directiva Omnibus (UE) 2019/2161, transpusă prin OUG nr. 58/2022</li>
          </ul>

          <h2>Autoritatea Națională pentru Protecția Consumatorilor (ANPC)</h2>
          <p>
            ANPC este autoritatea publică responsabilă cu protecția drepturilor consumatorilor în
            România. Aveți dreptul de a depune o reclamație la ANPC dacă considerați că drepturile
            dumneavoastră au fost încălcate.
          </p>
          <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
            <p className="font-semibold">
              Autoritatea Națională pentru Protecția Consumatorilor (ANPC)
            </p>
            <ul className="mb-0 mt-2">
              <li>Adresă: Bulevardul Aviatorilor nr. 72, Sector 1, București, 011865</li>
              <li>Telefon: 021-9551 (Telefonul consumatorului)</li>
              <li>
                Website:{' '}
                <a
                  href="https://anpc.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  https://anpc.ro
                </a>
              </li>
              <li>
                Reclamații online:{' '}
                <a
                  href="https://anpc.ro/ce-este-sal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  https://anpc.ro/ce-este-sal/
                </a>
              </li>
            </ul>
          </div>

          <h2>Soluționarea Alternativă a Litigiilor (SAL)</h2>
          <p>
            Conform OG nr. 38/2015, aveți dreptul de a apela la o entitate de soluționare
            alternativă a litigiilor (SAL) pentru rezolvarea extrajudiciară a disputelor. Lista
            entităților SAL autorizate este disponibilă pe site-ul ANPC.
          </p>
          <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
            <p className="font-semibold">Soluționarea Alternativă a Litigiilor (SAL/ANPC)</p>
            <ul className="mb-0 mt-2">
              <li>
                <a
                  href="https://anpc.ro/ce-este-sal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  https://anpc.ro/ce-este-sal/
                </a>
              </li>
            </ul>
          </div>

          <h2>Platforma ODR (Online Dispute Resolution)</h2>
          <p>
            Conform Regulamentului (UE) nr. 524/2013, Comisia Europeană pune la dispoziție o
            platformă online pentru soluționarea litigiilor (platforma ODR), accesibilă la:
          </p>
          <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
            <p className="font-semibold">Platforma ODR a Comisiei Europene</p>
            <ul className="mb-0 mt-2">
              <li>
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
              </li>
            </ul>
            <p className="mt-2 text-sm">
              Puteți utiliza această platformă pentru a depune o reclamație referitoare la un produs
              sau serviciu achiziționat online.
            </p>
          </div>

          <h2>Dreptul de retragere</h2>
          <p>
            În conformitate cu OUG nr. 34/2014, aveți dreptul de a vă retrage din orice contract
            încheiat la distanță, fără a indica motive, în termen de{' '}
            <strong>14 zile calendaristice</strong>.
          </p>

          <h3>Pentru piața de haine de copii (Kids Clothes Marketplace)</h3>
          <ul>
            <li>
              Perioada de retragere: <strong>14 zile</strong> de la primirea produselor
            </li>
            <li>Produsele trebuie returnate în starea originală, neutilizate</li>
            <li>
              Costurile de returnare sunt suportate de cumpărător, cu excepția cazului în care
              vânzătorul a agreat altfel
            </li>
            <li>
              Rambursarea se efectuează în termen de 14 zile de la primirea notificării de retragere
            </li>
          </ul>
          <p>
            <strong>Excepție:</strong> Dreptul de retragere nu se aplică donațiilor (articole
            oferite gratuit prin funcția &quot;Donate&quot;).
          </p>

          <h3>Formular standard de retragere</h3>
          <p>
            Pentru a vă exercita dreptul de retragere, puteți utiliza următorul model de declarație
            de retragere:
          </p>
          <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
            <p className="italic">
              &quot;Către [numele vânzătorului],
              <br />
              Vă notific prin prezenta retragerea mea din contractul de vânzare a următoarelor
              produse: [descrierea produsului]
              <br />
              Comandat pe / primit pe: [data]
              <br />
              Numele consumatorului: [numele dvs.]
              <br />
              Adresa consumatorului: [adresa dvs.]
              <br />
              Data: [data curentă]
              <br />
              Semnătura (doar pentru formularul pe hârtie)&quot;
            </p>
          </div>

          <h2>Reclamații</h2>
          <p>
            Dacă aveți o reclamație legată de serviciile noastre, vă rugăm să contactați în primul
            rând echipa noastră de suport:
          </p>
          <ul>
            <li>Email: support@juniorhub.ro</li>
            <li>
              Formularul de contact:{' '}
              <Link href="/contact" className="text-primary underline">
                Contactează-ne
              </Link>
            </li>
          </ul>
          <p>
            Ne angajăm să răspundem la toate reclamațiile în termen de{' '}
            <strong>30 de zile calendaristice</strong>. Dacă nu sunteți mulțumit de rezoluția
            oferită, puteți contacta ANPC sau puteți utiliza platforma ODR menționată mai sus.
          </p>

          <h2>Identificarea operatorului</h2>
          <p>În conformitate cu Legea nr. 365/2002 privind comerțul electronic:</p>
          <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
            <ul className="mb-0">
              <li>
                <strong>Denumire:</strong> JuniorHub SRL
              </li>
              <li>
                <strong>CUI:</strong> [CUI]
              </li>
              <li>
                <strong>Nr. Registrul Comerțului:</strong> [J__/____/____]
              </li>
              <li>
                <strong>Sediul social:</strong> [Adresa completă]
              </li>
              <li>
                <strong>Email:</strong> contact@juniorhub.ro
              </li>
              <li>
                <strong>Telefon:</strong> [Număr telefon]
              </li>
            </ul>
          </div>

          <h2>Formularul de Retragere (OUG 34/2014)</h2>
          <p>
            În conformitate cu OUG nr. 34/2014, aveți dreptul de a vă retrage din contractul
            încheiat la distanță, în termen de <strong>14 zile calendaristice</strong>, fără a
            indica vreun motiv.
          </p>
          <p>
            <strong>Important:</strong> Dreptul de retragere nu se aplică serviciilor deja prestate
            integral cu acordul dumneavoastră expres, confirmat înainte de începerea prestării (Art.
            16 lit. a) din OUG 34/2014).
          </p>
          <h3>Model de formular de retragere</h3>
          <div className="bg-muted rounded-lg p-4 text-sm">
            <p>
              <strong>Către:</strong> JuniorHub SRL, [Adresa completă], Email: contact@juniorhub.ro
            </p>
            <p className="mt-2">
              Subsemnatul/Subsemnata, vă notific prin prezenta retragerea mea din contractul privind
              prestarea următorului serviciu: _______________
            </p>
            <p className="mt-2">Comandat la data: ___ / Primit la data: ___</p>
            <p className="mt-2">Numele consumatorului: _______________</p>
            <p className="mt-2">Adresa consumatorului: _______________</p>
            <p className="mt-2">Data: ___ / Semnătura: ___</p>
          </div>
          <p className="mt-4 text-sm">
            Rambursarea se efectuează în termen de maximum 14 zile de la primirea notificării de
            retragere, utilizând aceeași modalitate de plată folosită pentru tranzacția inițială,
            fără costuri suplimentare.
          </p>

          <h2>Informații conform Legea 365/2002 (Comerț Electronic)</h2>
          <ul>
            <li>
              <strong>Prețuri:</strong> Toate prețurile afișate pe platformă includ TVA unde este
              cazul. Comisioanele platformei sunt afișate transparent înainte de finalizarea
              tranzacției.
            </li>
            <li>
              <strong>Costuri de livrare:</strong> Nu se aplică — serviciile sunt prestate la
              locația convenită între părți.
            </li>
            <li>
              <strong>Etapele tehnice ale contractului:</strong> 1) Publicarea cererii/ofertei de
              serviciu; 2) Primirea și acceptarea ofertei; 3) Confirmarea prin email; 4) Prestarea
              serviciului.
            </li>
            <li>
              <strong>Stocarea contractului:</strong> Toate contractele sunt stocate electronic și
              accesibile din contul utilizatorului.
            </li>
            <li>
              <strong>Corectarea erorilor:</strong> Utilizatorii pot modifica sau anula cererile
              înainte de acceptarea ofertei.
            </li>
            <li>
              <strong>Limbi disponibile:</strong> Contractele sunt disponibile în limba română și
              engleză.
            </li>
          </ul>

          <h2>Clasificare Furnizori și Obligații Fiscale</h2>
          <p>
            Furnizorii de servicii care utilizează platforma JuniorHub sunt responsabili pentru
            propria conformitate fiscală și juridică, inclusiv:
          </p>
          <ul>
            <li>Înregistrarea ca PFA, SRL sau alt tip de entitate juridică, după caz</li>
            <li>Emiterea de facturi sau chitanțe conform legislației în vigoare</li>
            <li>Plata impozitelor și contribuțiilor sociale aferente</li>
            <li>Obținerea autorizațiilor necesare pentru activitatea desfășurată</li>
          </ul>
          <p className="text-muted-foreground text-sm">
            JuniorHub nu oferă consultanță juridică sau fiscală. Recomandăm consultarea unui
            specialist pentru situația dumneavoastră specifică.
          </p>

          <h2>Cerințe de Siguranță Alimentară (DSVSA)</h2>
          <p>Vânzătorii de produse alimentare de pe platforma JuniorHub trebuie să respecte:</p>
          <ul>
            <li>Regulamentul (CE) nr. 852/2004 privind igiena produselor alimentare</li>
            <li>Legea nr. 150/2004 privind siguranța alimentelor și a hranei pentru animale</li>
            <li>Obligația de a declara alergenii conform Regulamentului (UE) nr. 1169/2011</li>
            <li>Normele DSVSA pentru comercializarea produselor alimentare</li>
          </ul>
          <p className="text-muted-foreground text-sm">
            JuniorHub nu verifică conformitatea cu normele de siguranță alimentară.
            Responsabilitatea revine integral vânzătorului.
          </p>

          <hr />

          <p className="text-muted-foreground text-sm">
            Această pagină conține informații obligatorii conform legislației române privind
            protecția consumatorilor și comerțul electronic. Consultați și{' '}
            <Link href="/terms" className="text-primary underline">
              Termenii și Condițiile
            </Link>{' '}
            și{' '}
            <Link href="/privacy" className="text-primary underline">
              Politica de Confidențialitate
            </Link>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}
