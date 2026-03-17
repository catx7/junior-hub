import { Card } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termeni și Condiții | JuniorHub',
  description: 'Termenii și condițiile de utilizare a platformei JuniorHub pentru servicii locale.',
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-muted/50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <Breadcrumb
          items={[{ label: 'Acasă', href: '/' }, { label: 'Termeni și condiții' }]}
          className="mb-6"
        />
        <h1 className="text-foreground mb-8 text-4xl font-bold">Termeni și Condiții</h1>

        <Card className="prose prose-gray max-w-none p-8">
          <p className="text-muted-foreground text-sm">Ultima actualizare: 15.03.2026</p>

          <h2>1. Acceptarea termenilor</h2>
          <p>
            Prin accesarea și utilizarea platformei JuniorHub (&quot;Platforma&quot;,
            &quot;Serviciul&quot;), acceptați și sunteți de acord să respectați prevederile
            prezentului acord. Acești Termeni și Condiții (&quot;Termenii&quot;) reglementează
            accesul și utilizarea site-ului web și a aplicațiilor mobile JuniorHub.
          </p>

          <h2>2. Identificarea operatorului</h2>
          <p>În conformitate cu Legea nr. 365/2002 privind comerțul electronic:</p>
          <ul>
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

          <h2>3. Natura platformei</h2>
          <p>
            JuniorHub este o platformă de tip marketplace care facilitează conectarea între
            utilizatorii care caută servicii locale și furnizorii de servicii. JuniorHub acționează
            exclusiv ca intermediar și <strong>nu este parte</strong> în contractele dintre
            utilizatori și furnizori. Responsabilitatea pentru calitatea serviciilor prestate revine
            exclusiv furnizorului de servicii.
          </p>

          <h2>4. Utilizarea serviciului</h2>
          <h3>4.1 Eligibilitate</h3>
          <p>
            Trebuie să aveți cel puțin 16 ani pentru a crea un cont pe platformă, conform Legii nr.
            190/2018 privind protecția datelor cu caracter personal. Utilizatorii cu vârsta cuprinsă
            între 16 și 18 ani pot utiliza Serviciul doar cu implicarea și consimțământul unui
            părinte sau tutore legal.
          </p>

          <h3>4.2 Înregistrarea contului</h3>
          <p>
            Pentru a accesa anumite funcționalități, trebuie să vă creați un cont. Sunteți de acord:
          </p>
          <ul>
            <li>Să furnizați informații exacte, actuale și complete</li>
            <li>Să mențineți și actualizați informațiile</li>
            <li>Să mențineți securitatea parolei</li>
            <li>Să acceptați responsabilitatea pentru toate activitățile de sub contul dvs.</li>
            <li>Să ne notificați imediat cu privire la orice utilizare neautorizată</li>
          </ul>

          <h2>5. Verificarea furnizorilor de servicii</h2>
          <h3>5.1 Verificări</h3>
          <p>
            Furnizorii de servicii care oferă servicii de îngrijire a copiilor trebuie să treacă
            prin procesul de verificare, care include:
          </p>
          <ul>
            <li>Verificarea documentului de identitate emis de stat</li>
            <li>Verificarea antecedentelor</li>
            <li>Verificarea referințelor</li>
          </ul>

          <h3>5.2 Declinare de responsabilitate</h3>
          <p>
            Deși efectuăm proceduri de verificare, JuniorHub nu garantează acuratețea, fiabilitatea
            sau siguranța niciunui furnizor de servicii. Utilizatorii sunt responsabili să efectueze
            propria diligență.
          </p>

          <h2>6. Conduita utilizatorului</h2>
          <p>Sunteți de acord să nu:</p>
          <ul>
            <li>Încălcați legile sau reglementările aplicabile</li>
            <li>Încălcați drepturile de proprietate intelectuală</li>
            <li>Transmiteți cod dăunător sau malițios</li>
            <li>Hărțuiți, abuzați sau provocați daune unei alte persoane</li>
            <li>Vă dați drept altă persoană sau entitate</li>
            <li>Vă implicați în activități frauduloase</li>
            <li>Publicați conținut fals, înșelător sau manipulator</li>
            <li>Publicați recenzii false sau manipulați sistemul de rating</li>
          </ul>

          <h2>7. Conținut și proprietate intelectuală</h2>
          <h3>7.1 Conținutul dvs.</h3>
          <p>
            Dețineți dreptul de proprietate asupra conținutului pe care îl publicați. Prin
            publicarea conținutului, acordați JuniorHub o licență mondială, neexclusivă, fără
            redevențe, de a utiliza, reproduce și afișa conținutul dvs. în legătură cu Serviciul.
          </p>

          <h3>7.2 Conținutul nostru</h3>
          <p>
            Serviciul și conținutul său original (excluzând conținutul utilizatorilor),
            funcționalitățile sunt deținute de JuniorHub și sunt protejate de legile internaționale
            privind drepturile de autor, marca comercială și alte legi privind proprietatea
            intelectuală.
          </p>

          <h2>8. Plăți și taxe</h2>
          <p>
            Tranzacțiile între solicitanții de servicii și furnizori sunt efectuate direct între
            utilizatori. JuniorHub poate percepe taxe de platformă sau comisioane, conform
            notificărilor către utilizatori. Fiecare furnizor este responsabil pentru propriile
            obligații fiscale.
          </p>

          <h2>9. Responsabilitate și limitări</h2>
          <h3>9.1 Serviciul &quot;ca atare&quot;</h3>
          <p>
            Serviciul este furnizat &quot;ca atare&quot;, fără garanții de niciun fel, explicite sau
            implicite, inclusiv, dar fără a se limita la garanțiile de comercializare, adecvare
            pentru un anumit scop sau neîncălcare.
          </p>

          <h3>9.2 Limitarea răspunderii</h3>
          <p>
            În conformitate cu legislația română și europeană, JuniorHub nu va fi răspunzător
            pentru:
          </p>
          <ul>
            <li>Daune indirecte, incidentale, speciale, consecvente sau punitive</li>
            <li>Pierderea profiturilor, veniturilor, datelor sau utilizării</li>
            <li>Acțiunile sau omisiunile furnizorilor de servicii</li>
            <li>Daunele rezultate din interacțiunile între utilizatori</li>
          </ul>

          <h2>10. Conformitate cu legislația română</h2>
          <h3>10.1 Conformitate GDPR</h3>
          <p>
            Respectăm Regulamentul General privind Protecția Datelor (GDPR) și Legea nr. 190/2018.
            Consultați{' '}
            <Link href="/privacy" className="text-primary underline">
              Politica de Confidențialitate
            </Link>{' '}
            pentru detalii privind prelucrarea datelor.
          </p>

          <h3>10.2 Protecția consumatorilor</h3>
          <p>
            În conformitate cu OG nr. 21/1992 privind protecția consumatorilor, aveți dreptul la:
          </p>
          <ul>
            <li>Informații exacte despre servicii</li>
            <li>Protecție împotriva practicilor neloiale</li>
            <li>Mecanisme de soluționare a reclamațiilor</li>
          </ul>

          <h3>10.3 Reglementări e-commerce</h3>
          <p>
            Această platformă respectă Legea nr. 365/2002 privind comerțul electronic și Directiva
            2000/31/CE.
          </p>

          <h3>10.4 Politica privind recenziile</h3>
          <p>
            În conformitate cu Directiva Omnibus (UE) 2019/2161, transpusă prin OUG nr. 58/2022:
          </p>
          <ul>
            <li>
              Recenziile pot fi lăsate doar de utilizatori care au interacționat efectiv cu
              furnizorul
            </li>
            <li>Recenziile false sunt interzise și vor fi eliminate</li>
            <li>Recenziile nu sunt stimulate financiar</li>
            <li>
              Moderăm recenziile pentru conținut inadecvat, dar nu eliminăm recenziile negative
              legitime
            </li>
            <li>Scorul de rating este calculat ca medie aritmetică a tuturor recenziilor</li>
          </ul>

          <h2>11. Soluționarea disputelor</h2>
          <h3>11.1 Negociere</h3>
          <p>
            În cazul oricărei dispute, utilizatorii sunt de acord să încerce mai întâi rezolvarea
            prin negociere de bună credință.
          </p>

          <h3>11.2 ANPC și SAL</h3>
          <p>
            Consumatorii au dreptul de a depune reclamații la Autoritatea Națională pentru Protecția
            Consumatorilor (ANPC) și de a apela la Soluționarea Alternativă a Litigiilor (SAL):
          </p>
          <ul>
            <li>
              <strong>ANPC:</strong>{' '}
              <a
                href="https://anpc.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                https://anpc.ro
              </a>{' '}
              | Telefon: 021-9551
            </li>
            <li>
              <strong>SAL:</strong>{' '}
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

          <h3>11.3 Platforma ODR (Soluționarea Online a Litigiilor)</h3>
          <p>
            Conform Regulamentului (UE) nr. 524/2013, puteți utiliza platforma ODR a Comisiei
            Europene pentru soluționarea litigiilor online:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              https://ec.europa.eu/consumers/odr
            </a>
          </p>

          <h3>11.4 Mediere</h3>
          <p>
            Dacă negocierea eșuează, disputele pot fi supuse medierii în conformitate cu legislația
            română.
          </p>

          <h3>11.5 Jurisdicție</h3>
          <p>
            Acești Termeni sunt guvernați de legislația română. Orice dispute vor fi soluționate de
            instanțele din România, cu jurisdicție în București.
          </p>

          <h2>12. Dreptul de retragere</h2>
          <p>
            În conformitate cu OUG nr. 34/2014 privind drepturile consumatorilor în contractele la
            distanță:
          </p>
          <ul>
            <li>
              Pentru <strong>piața de haine de copii</strong>: aveți dreptul de retragere în termen
              de 14 zile calendaristice de la primirea produselor
            </li>
            <li>Produsele trebuie returnate în starea originală, neutilizate</li>
            <li>Dreptul de retragere nu se aplică donațiilor (articole gratuite)</li>
          </ul>
          <p>
            Pentru detalii complete și formularul de retragere, consultați{' '}
            <Link href="/anpc" className="text-primary underline">
              pagina de Protecția Consumatorilor
            </Link>
            .
          </p>

          <h2>13. Rezilierea</h2>
          <p>
            Putem rezilia sau suspenda contul și accesul dvs. la Serviciu imediat, fără notificare
            prealabilă, pentru conduită care considerăm că încalcă acești Termeni sau este
            dăunătoare altor utilizatori, nouă sau terților.
          </p>

          <h2>14. Modificarea termenilor</h2>
          <p>
            Ne rezervăm dreptul de a modifica acești Termeni în orice moment. Vom notifica
            utilizatorii cu privire la modificări semnificative prin email sau notificare pe
            platformă. Utilizarea continuă a Serviciului după modificări constituie acceptarea
            noilor Termeni.
          </p>

          <h2>15. Informații de contact</h2>
          <p>Pentru întrebări referitoare la acești Termeni, contactați-ne la:</p>
          <ul>
            <li>Email: contact@juniorhub.ro</li>
            <li>Adresă: [Adresa completă]</li>
            <li>Telefon: [Număr telefon]</li>
          </ul>

          <h2>16. Separabilitate</h2>
          <p>
            Dacă orice prevedere a acestor Termeni este considerată invalidă sau neexecutabilă,
            aceasta va fi eliminată, iar prevederile rămase vor fi aplicate în conformitate cu
            legislația română.
          </p>

          <h2>17. Conformitatea cu Digital Services Act (DSA)</h2>
          <p>
            În conformitate cu Regulamentul (UE) 2022/2065 privind Actul legislativ privind
            serviciile digitale:
          </p>
          <h3>a) Punct de contact</h3>
          <p>
            Punctul unic de contact pentru comunicarea cu autoritățile și utilizatorii în legătură
            cu DSA: <a href="mailto:dsa@juniorhub.ro">dsa@juniorhub.ro</a>
          </p>
          <h3>b) Mecanismul de notificare și acțiune</h3>
          <p>
            Orice persoană poate notifica JuniorHub cu privire la conținut ilegal prin intermediul
            adresei <a href="mailto:abuse@juniorhub.ro">abuse@juniorhub.ro</a>. Notificarea trebuie
            să conțină:
          </p>
          <ul>
            <li>Explicația motivelor pentru care se consideră că informația este ilegală</li>
            <li>Indicarea clară a localizării electronice a informației (URL sau ID)</li>
            <li>Numele și adresa de email a persoanei care trimite notificarea</li>
            <li>O declarație care confirmă buna-credință a notificării</li>
          </ul>
          <p>
            JuniorHub examinează notificările cu diligență, ia decizii motivate și informează
            expeditorul cu privire la decizia luată.
          </p>
          <h3>c) Politica de moderare a conținutului</h3>
          <p>
            JuniorHub moderează conținutul pentru a elimina: conținut ilegal, fraudă, hărțuire,
            conținut care exploatează minori, discriminare, spam și conținut înșelător. Deciziile de
            moderare pot fi contestate prin email la adresa{' '}
            <a href="mailto:contestatii@juniorhub.ro">contestatii@juniorhub.ro</a>.
          </p>
          <h3>d) Transparență</h3>
          <p>
            JuniorHub publică anual un raport de transparență care include: numărul de notificări
            primite, tipurile de conținut ilegal identificat, numărul de decizii de moderare și
            termenele de procesare.
          </p>

          <h2>18. Forță majoră</h2>
          <p>
            Niciuna dintre părți nu va fi responsabilă pentru neexecutarea sau executarea cu
            întârziere a obligațiilor sale dacă aceasta se datorează unor evenimente de forță
            majoră, inclusiv, dar fără a se limita la: dezastre naturale, războaie, acțiuni
            guvernamentale, pandemii, pene de curent extinse, atacuri cibernetice majore sau orice
            alt eveniment în afara controlului rezonabil al părții afectate.
          </p>
          <p>
            Partea afectată trebuie să notifice cealaltă parte în termen de 5 zile lucrătoare de la
            apariția evenimentului de forță majoră.
          </p>

          <h2>
            19. Procedura de eliminare a conținutului care încalcă drepturile de proprietate
            intelectuală
          </h2>
          <p>
            În conformitate cu Legea nr. 8/1996 privind dreptul de autor și drepturile conexe,
            JuniorHub respectă drepturile de proprietate intelectuală ale terților.
          </p>
          <p>
            Dacă considerați că un conținut publicat pe platformă vă încalcă drepturile de autor sau
            alte drepturi de proprietate intelectuală, trimiteți o notificare la{' '}
            <a href="mailto:legal@juniorhub.ro">legal@juniorhub.ro</a> care să conțină:
          </p>
          <ul>
            <li>Identificarea operei protejate a cărei drept pretindeți că a fost încălcat</li>
            <li>
              Identificarea materialului care se pretinde a fi contrafăcut (URL sau descriere)
            </li>
            <li>Datele de contact ale titularului drepturilor</li>
            <li>O declarație pe propria răspundere că utilizarea nu este autorizată</li>
            <li>O declarație de acuratețe și bună-credință</li>
          </ul>
          <p>
            JuniorHub va examina notificarea și, dacă este justificată, va elimina sau dezactiva
            accesul la conținutul în cauză în termen de 48 de ore.
          </p>

          <h2>20. Asigurări și Răspundere</h2>
          <p>
            JuniorHub recomandă tuturor furnizorilor de servicii să dețină o asigurare de răspundere
            civilă profesională adecvată activității desfășurate. Platforma nu oferă acoperire
            asigurativă și nu este responsabilă pentru:
          </p>
          <ul>
            <li>Accidente sau vătămări survenite în timpul prestării serviciului</li>
            <li>Daune materiale cauzate de furnizori</li>
            <li>Pierderi financiare rezultate din tranzacții între utilizatori</li>
          </ul>
          <p>
            Utilizatorii sunt sfătuiți să verifice existența unei asigurări valabile înainte de a
            angaja un furnizor de servicii, în special pentru activități care implică îngrijirea
            copiilor.
          </p>

          <hr />

          <p className="text-muted-foreground text-sm">
            Consultați și{' '}
            <Link href="/privacy" className="text-primary underline">
              Politica de Confidențialitate
            </Link>
            ,{' '}
            <Link href="/cookies" className="text-primary underline">
              Politica Cookie-uri
            </Link>{' '}
            și{' '}
            <Link href="/anpc" className="text-primary underline">
              Protecția Consumatorilor
            </Link>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}
