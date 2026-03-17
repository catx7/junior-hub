import { Card } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de Confidențialitate | JuniorHub',
  description:
    'Politica de confidențialitate JuniorHub - cum colectăm, utilizăm și protejăm datele dumneavoastră conform GDPR.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-muted/50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <Breadcrumb
          items={[{ label: 'Acasă', href: '/' }, { label: 'Politica de confidențialitate' }]}
          className="mb-6"
        />
        <h1 className="text-foreground mb-8 text-4xl font-bold">Politica de Confidențialitate</h1>

        <Card className="prose prose-gray max-w-none p-8">
          <p className="text-muted-foreground text-sm">Ultima actualizare: 15.03.2026</p>
          <p className="text-muted-foreground text-sm">Data intrării în vigoare: 15.03.2026</p>

          <h2>1. Introducere</h2>
          <p>
            JuniorHub SRL (&quot;noi&quot;, &quot;al nostru&quot;, &quot;compania&quot;) se
            angajează să protejeze confidențialitatea datelor dumneavoastră. Această Politică de
            Confidențialitate explică modul în care colectăm, utilizăm, divulgăm și protejăm
            informațiile dvs. atunci când utilizați platforma noastră.
          </p>

          <h3>Operatorul de date</h3>
          <ul>
            <li>
              <strong>Denumire:</strong> JuniorHub SRL
            </li>
            <li>
              <strong>CUI:</strong> [CUI]
            </li>
            <li>
              <strong>Sediul social:</strong> [Adresa completă]
            </li>
            <li>
              <strong>Email DPO:</strong> dpo@juniorhub.ro
            </li>
          </ul>

          <p>Această politică respectă:</p>
          <ul>
            <li>Regulamentul General privind Protecția Datelor (UE) 2016/679 (GDPR)</li>
            <li>Legea nr. 190/2018 privind protecția datelor cu caracter personal</li>
            <li>
              Legea nr. 506/2004 privind prelucrarea datelor cu caracter personal și protecția
              vieții private în sectorul comunicațiilor electronice
            </li>
          </ul>

          <h2>2. Datele pe care le colectăm</h2>

          <h3>2.1 Date furnizate de dumneavoastră</h3>
          <ul>
            <li>
              <strong>Date de cont:</strong> Nume, adresă de email, parolă, număr de telefon
            </li>
            <li>
              <strong>Date de profil:</strong> Avatar, biografie, locație, limbi vorbite
            </li>
            <li>
              <strong>Anunțuri de servicii:</strong> Descrieri, bugete, locații
            </li>
            <li>
              <strong>Mesaje:</strong> Comunicări cu alți utilizatori prin chat-ul intern
            </li>
            <li>
              <strong>Documente de verificare:</strong> Act de identitate (pentru furnizori),
              încărcat prin Cloudinary
            </li>
            <li>
              <strong>Recenzii și evaluări:</strong> Feedback public despre servicii
            </li>
            <li>
              <strong>Fotografii:</strong> Imagini de profil, fotografii produse (haine copii,
              mâncare)
            </li>
          </ul>

          <h3>2.2 Date colectate automat</h3>
          <ul>
            <li>
              <strong>Date de utilizare:</strong> Pagini vizitate, funcționalități utilizate, timp
              petrecut
            </li>
            <li>
              <strong>Date despre dispozitiv:</strong> Adresă IP, tip browser, tip dispozitiv
            </li>
            <li>
              <strong>Date de localizare:</strong> Locație aproximativă pentru potrivirea
              serviciilor
            </li>
            <li>
              <strong>Token notificări push:</strong> Firebase Cloud Messaging token
            </li>
            <li>
              <strong>Cookie-uri:</strong> Cookie-uri de sesiune, preferințe (vezi{' '}
              <Link href="/cookies" className="text-primary underline">
                Politica Cookie-uri
              </Link>
              )
            </li>
          </ul>

          <h2>3. Cum utilizăm datele dumneavoastră</h2>

          <h3>Temeiuri juridice pentru prelucrare (Articolul 6 GDPR)</h3>
          <ul>
            <li>
              <strong>Executarea contractului (Art. 6(1)(b)):</strong> Crearea contului, potrivirea
              serviciilor, mesagerie, procesarea tranzacțiilor
            </li>
            <li>
              <strong>Consimțământul (Art. 6(1)(a)):</strong> Comunicări de marketing, notificări
              push, cookie-uri neesențiale, autentificare prin Google/Facebook
            </li>
            <li>
              <strong>Interesul legitim (Art. 6(1)(f)):</strong> Prevenirea fraudei, securitatea
              platformei, îmbunătățirea serviciului, sistemul de recenzii
            </li>
            <li>
              <strong>Obligație legală (Art. 6(1)(c)):</strong> Conformitate cu legislația fiscală,
              ANPC, verificarea identității
            </li>
          </ul>

          <h3>Scopuri specifice</h3>
          <ul>
            <li>Furnizarea și menținerea Serviciului</li>
            <li>Procesarea tranzacțiilor și trimiterea confirmărilor</li>
            <li>Trimiterea notificărilor despre contul și activitățile dvs.</li>
            <li>Răspunsul la solicitări și furnizarea suportului</li>
            <li>Detectarea, prevenirea și abordarea problemelor de fraudă și securitate</li>
            <li>Îmbunătățirea și personalizarea Serviciului</li>
            <li>Efectuarea verificărilor furnizorilor</li>
            <li>Conformitatea cu obligațiile legale</li>
          </ul>

          <h2>4. Partajarea și divulgarea datelor</h2>

          <h3>4.1 Cu alți utilizatori</h3>
          <p>
            Informațiile de profil, anunțurile și recenziile dvs. sunt vizibile altor utilizatori.
            Mesajele directe sunt vizibile doar participanților la conversație.
          </p>

          <h3>4.2 Furnizori de servicii terți (procesatori de date)</h3>
          <p>Partajăm date cu terți de încredere:</p>
          <ul>
            <li>
              <strong>Firebase (Google):</strong> Autentificare, notificări push — SUA (Clauze
              Contractuale Standard)
            </li>
            <li>
              <strong>Cloudinary:</strong> Stocarea imaginilor și documentelor de verificare
            </li>
            <li>
              <strong>Vercel:</strong> Hosting website
            </li>
            <li>
              <strong>PostgreSQL (hosting):</strong> Baza de date
            </li>
          </ul>

          <h3>4.3 Cerințe legale</h3>
          <p>Putem divulga informațiile dvs. dacă este necesar conform:</p>
          <ul>
            <li>Legislației române sau europene</li>
            <li>Proceselor legale sau solicitărilor guvernamentale</li>
            <li>Protecției drepturilor, proprietății sau siguranței</li>
            <li>Prevenirii fraudei sau problemelor de securitate</li>
          </ul>

          <h2>5. Drepturile dumneavoastră (GDPR)</h2>

          <p>Conform legislației române și europene, aveți dreptul la:</p>

          <h3>5.1 Acces (Articolul 15)</h3>
          <p>Solicitarea unei copii a datelor personale pe care le deținem despre dvs.</p>

          <h3>5.2 Rectificare (Articolul 16)</h3>
          <p>Corectarea datelor inexacte sau incomplete.</p>

          <h3>5.3 Ștergere (Articolul 17)</h3>
          <p>Solicitarea ștergerii datelor dvs. (&quot;dreptul de a fi uitat&quot;).</p>

          <h3>5.4 Restricționare (Articolul 18)</h3>
          <p>Solicitarea limitării prelucrării datelor.</p>

          <h3>5.5 Portabilitate (Articolul 20)</h3>
          <p>
            Primirea datelor într-un format structurat, utilizat frecvent și care poate fi citit
            automat (JSON).
          </p>

          <h3>5.6 Opoziție (Articolul 21)</h3>
          <p>Opoziția la prelucrarea bazată pe interese legitime.</p>

          <h3>5.7 Retragerea consimțământului</h3>
          <p>
            Retragerea consimțământului pentru comunicări de marketing, notificări push sau
            cookie-uri neesențiale în orice moment, fără a afecta legalitatea prelucrării
            anterioare.
          </p>

          <p>
            <strong>Pentru a vă exercita drepturile, contactați:</strong> dpo@juniorhub.ro
          </p>
          <p>
            Vom răspunde solicitării dvs. în termen de <strong>30 de zile calendaristice</strong>.
          </p>

          <h2>6. Păstrarea datelor</h2>
          <p>Păstrăm datele dvs. pentru:</p>
          <ul>
            <li>
              <strong>Date de cont:</strong> Pe durata existenței contului + 3 ani după ștergere
              (termen de prescripție din dreptul comercial)
            </li>
            <li>
              <strong>Înregistrări fiscale:</strong> 10 ani (conform Codului Fiscal)
            </li>
            <li>
              <strong>Documente de verificare:</strong> Pe durata statutului de furnizor + 5 ani
            </li>
            <li>
              <strong>Mesaje:</strong> Pe durata existenței contului + 1 an
            </li>
            <li>
              <strong>Loguri tehnice:</strong> 6 luni
            </li>
          </ul>

          <h2>7. Protecția minorilor</h2>
          <h3>7.1 Restricție de vârstă</h3>
          <p>
            Conform Legii nr. 190/2018, vârsta minimă pentru consimțământul digital în România este
            de 16 ani. Nu colectăm cu bună știință date personale de la persoane sub 16 ani. Dacă
            aflăm că am colectat date de la o persoană sub 16 ani, le vom șterge.
          </p>

          <h3>7.2 Fotografii cu copii</h3>
          <p>
            Deoarece platforma include funcționalități legate de copii (evenimente, haine),
            responsabilitatea publicării fotografiilor cu minori revine exclusiv părintelui sau
            tutorelui legal. JuniorHub nu utilizează aceste imagini în scopuri de marketing fără
            consimțământ explicit.
          </p>

          <h3>7.3 Date colectate pentru înregistrarea la evenimente</h3>
          <p>
            Pentru înregistrarea copiilor la evenimente, colectăm următoarele date: numele
            copilului, vârsta și eventuale cerințe speciale (alergii, nevoi medicale). Baza legală:
            consimțământul părintelui/tutorelui (Art. 8 GDPR, Legea 190/2018 Art. 8).
          </p>
          <p>
            Aceste date sunt păstrate pe durata evenimentului și 30 de zile după finalizarea
            acestuia, apoi sunt șterse automat. Părintele/tutorele poate solicita oricând accesul,
            rectificarea sau ștergerea datelor copilului contactându-ne la adresa de email indicată
            mai sus.
          </p>

          <h2>8. Securitatea datelor</h2>
          <p>Implementăm măsuri de securitate, inclusiv:</p>
          <ul>
            <li>Criptare SSL/TLS pentru transmiterea datelor</li>
            <li>Stocarea criptată a datelor sensibile</li>
            <li>Audituri de securitate periodice</li>
            <li>Controale de acces și autentificare</li>
            <li>Servicii terțe securizate (conforme SOC 2)</li>
          </ul>

          <h2>9. Cookie-uri și urmărire</h2>
          <p>
            Utilizăm cookie-uri în conformitate cu Legea nr. 506/2004 și Directiva ePrivacy. Pentru
            detalii complete despre cookie-urile utilizate și cum le puteți controla, consultați{' '}
            <Link href="/cookies" className="text-primary underline">
              Politica privind Cookie-urile
            </Link>
            .
          </p>

          <h2>10. Transferuri internaționale de date</h2>
          <p>
            Datele dvs. pot fi transferate și prelucrate în țări din afara Spațiului Economic
            European (SEE), în special SUA (Firebase/Google, Cloudinary). Asigurăm protecție
            adecvată prin:
          </p>
          <ul>
            <li>Clauze Contractuale Standard (aprobate de UE)</li>
            <li>Servicii certificate în cadrul EU-US Data Privacy Framework</li>
            <li>Decizii de adecvare ale Comisiei Europene</li>
          </ul>

          <h2>11. Notificarea în caz de încălcare a securității datelor</h2>
          <p>În conformitate cu Articolul 33 GDPR și Legea nr. 190/2018, vom notifica:</p>
          <ul>
            <li>
              <strong>Autoritatea de supraveghere (ANSPDCP):</strong> În termen de 72 de ore de la
              conștientizare
            </li>
            <li>
              <strong>Utilizatorii afectați:</strong> Fără întârzieri nejustificate, dacă există
              risc ridicat pentru drepturile și libertățile persoanelor
            </li>
          </ul>

          <h2>12. Linkuri către terți</h2>
          <p>
            Serviciul nostru poate conține linkuri către site-uri terțe. Nu suntem responsabili
            pentru practicile lor de confidențialitate. Vă încurajăm să le revizuiți politicile de
            confidențialitate.
          </p>

          <h2>13. Modificări ale Politicii de Confidențialitate</h2>
          <p>
            Putem actualiza periodic această Politică. Vă vom notifica cu privire la modificări
            semnificative prin:
          </p>
          <ul>
            <li>Notificare prin email</li>
            <li>Notificare pe platformă</li>
            <li>Actualizarea datei &quot;Ultima actualizare&quot;</li>
          </ul>

          <h2>14. Contact și reclamații</h2>

          <h3>14.1 Responsabilul cu Protecția Datelor (DPO)</h3>
          <p>
            Email: dpo@juniorhub.ro
            <br />
            Adresă: [Adresa completă]
          </p>

          <h3>14.2 Autoritatea de supraveghere</h3>
          <p>Aveți dreptul de a depune o plângere la autoritatea română de supraveghere:</p>
          <p>
            <strong>
              ANSPDCP (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter
              Personal)
            </strong>
            <br />
            Adresă: B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București
            <br />
            Telefon: +40 21 252 5599
            <br />
            Website:{' '}
            <a
              href="https://www.dataprotection.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              www.dataprotection.ro
            </a>
            <br />
            Email: anspdcp@dataprotection.ro
          </p>

          <h2>15. Definiții</h2>
          <ul>
            <li>
              <strong>Date cu caracter personal:</strong> Informații referitoare la o persoană
              fizică identificată sau identificabilă
            </li>
            <li>
              <strong>Prelucrare:</strong> Orice operațiune efectuată asupra datelor cu caracter
              personal
            </li>
            <li>
              <strong>Operator:</strong> JuniorHub SRL (stabilește scopurile și mijloacele de
              prelucrare)
            </li>
            <li>
              <strong>Persoană împuternicită:</strong> Terți care prelucrează datele în numele
              nostru
            </li>
          </ul>

          <h2>16. Opțiunile dumneavoastră</h2>
          <h3>16.1 Comunicări de marketing</h3>
          <p>
            Dezabonați-vă de la emailurile de marketing prin linkul de dezabonare sau setările
            contului.
          </p>

          <h3>16.2 Servicii de localizare</h3>
          <p>
            Dezactivați accesul la locație în setările browserului sau dispozitivului (poate limita
            funcționalitatea).
          </p>

          <h3>16.3 Ștergerea contului</h3>
          <p>
            Solicitați ștergerea contului prin Setări → Șterge contul. Datele vor fi eliminate
            permanent în termen de 30 de zile, cu excepția cazurilor în care păstrarea este
            obligatorie prin lege.
          </p>

          <hr />

          <p className="text-muted-foreground text-sm">
            Consultați și{' '}
            <Link href="/terms" className="text-primary underline">
              Termenii și Condițiile
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
