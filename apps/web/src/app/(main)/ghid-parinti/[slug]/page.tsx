import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

export const revalidate = 3600;

interface GuideArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categoryColor: 'default' | 'secondary' | 'destructive' | 'outline';
  readTime: string;
  date: string;
  content: React.ReactNode;
  relatedSlugs: string[];
}

const guides: Record<string, GuideArticle> = {
  'cum-sa-alegi-o-bona-de-incredere': {
    slug: 'cum-sa-alegi-o-bona-de-incredere',
    title: 'Cum să alegi o bonă de încredere',
    excerpt:
      'Ghid complet pentru părinți care caută o bonă potrivită. Află ce întrebări să pui la interviu, ce referințe să verifici și cum să te asiguri că copilul tău este pe mâini bune.',
    category: 'Babysitting',
    categoryColor: 'default',
    readTime: '8 min',
    date: '2026-03-10',
    relatedSlugs: ['pregatirea-copilului-pentru-bona-noua', 'siguranta-copilului-acasa'],
    content: (
      <>
        <p>
          Alegerea unei bone de încredere este una dintre cele mai importante decizii pe care le iau
          părinții. Indiferent dacă aveți nevoie de o bonă cu normă întreagă, part-time sau
          ocazională, procesul de selecție trebuie să fie riguros și bine structurat.
        </p>

        <h2>De unde să începi căutarea</h2>
        <p>
          Primul pas este să stabilești exact ce ai nevoie. Gândește-te la programul tău, la vârsta
          copilului și la activitățile pe care dorești ca bona să le facă. Iată câteva surse de unde
          poți începe căutarea:
        </p>
        <ul>
          <li>
            <strong>Platforme specializate</strong> precum JuniorHub, unde furnizorii sunt
            verificați și evaluați de alți părinți din comunitate.
          </li>
          <li>
            <strong>Recomandări de la alți părinți</strong> din cercul tău de prieteni, de la
            grădiniță sau din grupuri locale de părinți.
          </li>
          <li>
            <strong>Agenții specializate</strong> care oferă bone cu experiență și referințe
            verificate.
          </li>
        </ul>

        <h2>Întrebări esențiale la interviu</h2>
        <p>
          Interviul cu potențiala bonă este momentul cel mai important al procesului de selecție.
          Pregătește-te cu o listă de întrebări care să acopere toate aspectele relevante:
        </p>
        <h3>Experiența și calificările</h3>
        <ul>
          <li>Câți ani de experiență ai cu copiii?</li>
          <li>Ce grupe de vârstă ai îngrijit până acum?</li>
          <li>Ai cursuri de prim ajutor pediatric?</li>
          <li>Ai experiență cu copii cu nevoi speciale sau alergii?</li>
        </ul>
        <h3>Situații practice</h3>
        <ul>
          <li>Ce faci dacă copilul plânge neconsolat?</li>
          <li>Cum gestionezi o situație de urgență medicală?</li>
          <li>Care este abordarea ta față de disciplină?</li>
          <li>Ce activități propui pentru dezvoltarea copilului?</li>
        </ul>
        <h3>Aspecte logistice</h3>
        <ul>
          <li>Ești disponibilă în programul de care avem nevoie?</li>
          <li>Ai permis de conducere și mașină proprie?</li>
          <li>Ești dispusă să faci și alte sarcini casnice ușoare?</li>
          <li>Care sunt așteptările tale salariale?</li>
        </ul>

        <h2>Verificarea referințelor</h2>
        <p>
          Nu sări niciodată peste verificarea referințelor. Contactează cel puțin 2-3 familii pentru
          care bona a lucrat anterior și întreabă despre:
        </p>
        <ul>
          <li>Punctualitatea și seriozitatea</li>
          <li>Modul în care interacționa cu copiii</li>
          <li>Respectarea regulilor familiei</li>
          <li>Motivul pentru care s-a încheiat colaborarea</li>
          <li>Dacă ar recomanda-o altor familii</li>
        </ul>

        <h2>Perioada de probă</h2>
        <p>
          Stabilește o perioadă de probă de 1-2 săptămâni în care să observi cum interacționează
          bona cu copilul tău. În primele zile, rămâi acasă sau în apropiere pentru ca atât copilul,
          cât și bona să se obișnuiască unul cu celălalt. Observă:
        </p>
        <ul>
          <li>Cum comunică bona cu copilul</li>
          <li>Dacă respectă rutina stabilită</li>
          <li>Cum reacționează copilul în prezența bonei</li>
          <li>Dacă bona ia inițiativă în activități educative</li>
        </ul>

        <h2>Semne de alarmă</h2>
        <p>Fii atent la anumite semnale care pot indica că bona nu este potrivită:</p>
        <ul>
          <li>Refuză să ofere referințe sau datele nu se confirmă</li>
          <li>Este prea vagă în răspunsuri despre experiența anterioară</li>
          <li>Nu pune întrebări despre copilul tău și nevoile lui</li>
          <li>Utilizează excesiv telefonul în timpul programului</li>
          <li>Copilul tău manifestă anxietate neobișnuită sau regres comportamental</li>
        </ul>

        <h2>Stabilirea regulilor și așteptărilor</h2>
        <p>
          Odată ce ai ales bona potrivită, stabilește clar regulile casei și așteptările tale. Pune
          totul în scris: programul zilnic, regulile privind mesele, somnul, timpul petrecut în fața
          ecranelor, contactele de urgență și procedurile în caz de urgență. O comunicare deschisă
          și transparentă este cheia unei colaborări de succes pe termen lung.
        </p>
      </>
    ),
  },
  'siguranta-copilului-acasa': {
    slug: 'siguranta-copilului-acasa',
    title: 'Siguranța copilului acasă',
    excerpt:
      'Sfaturi esențiale pentru a transforma casa într-un mediu sigur pentru copii. De la protecția prizelor la depozitarea corectă a substanțelor periculoase.',
    category: 'Siguranță',
    categoryColor: 'destructive',
    readTime: '6 min',
    date: '2026-03-05',
    relatedSlugs: ['cum-sa-alegi-o-bona-de-incredere', 'activitati-educative-pentru-copii'],
    content: (
      <>
        <p>
          Casa ar trebui să fie cel mai sigur loc pentru copilul tău, dar statisticile arată că
          majoritatea accidentelor la copii se întâmplă tocmai acasă. Vestea bună este că
          majoritatea acestor accidente pot fi prevenite prin măsuri simple de siguranță.
        </p>

        <h2>Siguranța în bucătărie</h2>
        <p>
          Bucătăria este una dintre cele mai periculoase încăperi din casă pentru un copil mic. Iată
          cum să o faci mai sigură:
        </p>
        <ul>
          <li>
            Instalează <strong>încuietori de siguranță</strong> la toate dulapurile de jos, mai ales
            cele care conțin substanțe de curățat, obiecte ascuțite sau sticle de sticlă.
          </li>
          <li>
            Folosește <strong>protecții pentru aragaz</strong> care împiedică copilul să atingă
            oalele fierbinți sau să aprindă focul.
          </li>
          <li>
            Păstrează cuțitele, foarfecele și alte obiecte ascuțite în sertare cu încuietori de
            siguranță sau la înălțime.
          </li>
          <li>
            Nu lăsa niciodată recipiente cu lichide fierbinți la marginea mesei sau a blatului.
          </li>
        </ul>

        <h2>Siguranța electrică</h2>
        <p>
          Prizele și cablurile electrice sunt extrem de atractive pentru copiii mici. Protejează-ți
          copilul prin:
        </p>
        <ul>
          <li>
            Montarea de <strong>protecții pentru prize</strong> în toate încăperile. Alege modele
            care necesită două mișcări simultane pentru a fi scoase.
          </li>
          <li>Ascunderea cablurilor electrice în canale speciale sau în spatele mobilierului.</li>
          <li>Verificarea periodică a aparatelor electrice pentru cabluri deteriorate.</li>
          <li>
            Niciodată nu lăsa aparate electrice conectate și nesupravegheate în camera copilului.
          </li>
        </ul>

        <h2>Prevenirea căderilor</h2>
        <p>
          Căderile sunt cauza numărul 1 a accidentelor la copii. Ia măsuri preventive în fiecare
          cameră:
        </p>
        <ul>
          <li>
            Instalează <strong>porți de siguranță</strong> la capătul scărilor, atât sus cât și jos.
          </li>
          <li>
            Fixează mobilierul înalt (rafturi, dulapuri, comode) de perete cu dispozitive
            anti-răsturnare.
          </li>
          <li>Montează balustrăzi la ferestrele de la etaj sau limitatoare de deschidere.</li>
          <li>Folosește covoare anti-alunecare în baie și pe parchetul lucios.</li>
        </ul>

        <h2>Substanțe periculoase</h2>
        <p>
          Copiii mici sunt curioși și au tendința de a pune totul în gură. Depozitează corect
          substanțele periculoase:
        </p>
        <ul>
          <li>
            Păstrează medicamentele, vitaminele și suplimentele în dulapuri încuiate, la înălțime.
          </li>
          <li>
            Produsele de curățat trebuie depozitate în locuri inaccesibile copilului, niciodată sub
            chiuvetă fără încuietoare.
          </li>
          <li>Nu transfera niciodată substanțe chimice în recipiente alimentare.</li>
          <li>
            Ține la îndemână numărul <strong>Centrului Antitoxico</strong> și al serviciului de
            urgență <strong>112</strong>.
          </li>
        </ul>

        <h2>Siguranța în baie</h2>
        <p>
          Baia prezintă riscuri multiple: apă fierbinte, suprafețe alunecoase și risc de înec.
          Respectă aceste reguli:
        </p>
        <ul>
          <li>
            Nu lăsa <strong>niciodată</strong> un copil mic nesupravegheat în cadă, nici măcar
            pentru câteva secunde.
          </li>
          <li>Reglează temperatura apei calde la maximum 48 grade Celsius la centrala termică.</li>
          <li>Folosește covoare anti-alunecare atât în cadă, cât și pe podeaua băii.</li>
          <li>Păstrează uscătorul de păr și alte aparate electrice departe de apă.</li>
        </ul>

        <h2>Lista de verificare pentru siguranța casei</h2>
        <p>Parcurge periodic această listă pentru a te asigura că locuința ta este sigură:</p>
        <ul>
          <li>Detectoare de fum funcționale în fiecare cameră</li>
          <li>Detector de monoxid de carbon instalat</li>
          <li>Trusă de prim ajutor completă și accesibilă adulților</li>
          <li>Numere de urgență afișate vizibil</li>
          <li>Plan de evacuare în caz de incendiu discutat cu toți membrii familiei</li>
          <li>Toate protecțiile de siguranță verificate și funcționale</li>
        </ul>
      </>
    ),
  },
  'activitati-educative-pentru-copii': {
    slug: 'activitati-educative-pentru-copii',
    title: 'Activități educative pentru copii',
    excerpt:
      'Idei creative de activități care combină distracția cu învățarea. Activități potrivite pe grupe de vârstă, de la 1 an la 10 ani, pentru dezvoltarea armonioasă a copilului.',
    category: 'Educație',
    categoryColor: 'secondary',
    readTime: '7 min',
    date: '2026-02-28',
    relatedSlugs: ['sfaturi-pentru-parinti-care-lucreaza', 'pregatirea-copilului-pentru-bona-noua'],
    content: (
      <>
        <p>
          Copiii învață cel mai bine prin joc. Activitățile educative nu trebuie să fie
          plictisitoare sau rigide. Dimpotrivă, cele mai eficiente sunt cele care stimulează
          curiozitatea naturală și creativitatea copilului. Iată o colecție de activități organizate
          pe grupe de vârstă.
        </p>

        <h2>Activități pentru copii de 1-3 ani</h2>
        <p>
          La această vârstă, copiii descoperă lumea prin simțuri. Concentrează-te pe activități care
          stimulează dezvoltarea motorie și senzorială.
        </p>
        <h3>Jocuri senzoriale</h3>
        <ul>
          <li>
            <strong>Cutia senzorială:</strong> Umple o cutie cu orez, paste, fasole sau nisip
            cinetic. Adaugă linguri, pahare și jucării mici pe care copilul le poate explora.
          </li>
          <li>
            <strong>Pictura cu degetele:</strong> Folosește vopsele non-toxice pe bază de apă.
            Atașează o foaie mare pe podea sau pe masă și lasă copilul să experimenteze cu culorile.
          </li>
          <li>
            <strong>Plastilina de casă:</strong> Prepară plastilină din făină, sare, apă și colorant
            alimentar. Este sigură chiar dacă copilul o pune în gură.
          </li>
        </ul>
        <h3>Dezvoltarea limbajului</h3>
        <ul>
          <li>Citește povești scurte cu imagini colorate în fiecare zi.</li>
          <li>Cântă cântecele pentru copii cu gesturi și mișcări.</li>
          <li>Numește obiectele din jur pe parcursul zilei.</li>
        </ul>

        <h2>Activități pentru copii de 3-6 ani</h2>
        <p>
          Copiii preșcolari sunt gata pentru activități mai complexe care dezvoltă gândirea logică
          și abilitățile sociale.
        </p>
        <h3>Activități creative</h3>
        <ul>
          <li>
            <strong>Colaje din natură:</strong> Colectați frunze, pietricele și flori în timpul
            plimbărilor, apoi creați colaje pe carton.
          </li>
          <li>
            <strong>Teatru de păpuși:</strong> Creați împreună păpuși din șosete vechi și puneți în
            scenă povești inventate.
          </li>
          <li>
            <strong>Gătit împreună:</strong> Rețete simple precum biscuiți sau salată de fructe,
            unde copilul poate amesteca, turna și decora.
          </li>
        </ul>
        <h3>Dezvoltarea gândirii logice</h3>
        <ul>
          <li>Puzzle-uri cu piese mari, adaptate vârstei.</li>
          <li>Jocuri de sortare după culoare, formă sau dimensiune.</li>
          <li>Numărarea obiectelor din viața de zi cu zi: fructe, jucării, degete.</li>
        </ul>

        <h2>Activități pentru copii de 6-10 ani</h2>
        <p>
          Școlarii mici au nevoie de activități care să le stimuleze curiozitatea intelectuală și să
          le dezvolte autonomia.
        </p>
        <h3>Experimente științifice simple</h3>
        <ul>
          <li>
            <strong>Vulcanul de bicarbonat:</strong> Amestecul de bicarbonat de sodiu și oțet
            creează o reacție spectaculoasă care introduce concepte de chimie.
          </li>
          <li>
            <strong>Cultivarea plantelor:</strong> Plantați semințe în ghivece și observați
            creșterea zilnică. Copilul poate ține un jurnal cu desene.
          </li>
          <li>
            <strong>Cristale de zahăr:</strong> Experiment pe termen lung care învață răbdarea și
            procesul de cristalizare.
          </li>
        </ul>
        <h3>Activități în aer liber</h3>
        <ul>
          <li>Vânătoare de comori în natură cu o listă de obiecte de găsit.</li>
          <li>Observarea păsărilor cu un ghid ilustrat simplu.</li>
          <li>Construirea de căsuțe pentru insecte din materiale naturale.</li>
        </ul>

        <h2>Sfaturi pentru părinți</h2>
        <p>Indiferent de vârsta copilului, respectă câteva principii importante:</p>
        <ul>
          <li>
            <strong>Lasă copilul să conducă:</strong> Urmărește interesele lui naturale și adaptează
            activitățile în consecință.
          </li>
          <li>
            <strong>Procesul contează mai mult decât rezultatul:</strong> Nu corecta și nu
            perfecționa lucrările copilului. Lăsați-l să experimenteze liber.
          </li>
          <li>
            <strong>Limitează timpul de ecran:</strong> Activitățile practice sunt mult mai benefice
            pentru dezvoltare decât tabletele sau televizorul.
          </li>
          <li>
            <strong>Fii prezent:</strong> Implicarea ta activă contează enorm. Participă la
            activități alături de copil, nu doar supraveghează.
          </li>
        </ul>
      </>
    ),
  },
  'pregatirea-copilului-pentru-bona-noua': {
    slug: 'pregatirea-copilului-pentru-bona-noua',
    title: 'Pregătirea copilului pentru bonă nouă',
    excerpt:
      'Cum să faci tranziția ușoară atunci când introduci o bonă nouă în viața copilului. Sfaturi practice pentru a reduce anxietatea de separare și a construi încredere.',
    category: 'Babysitting',
    categoryColor: 'default',
    readTime: '5 min',
    date: '2026-02-20',
    relatedSlugs: ['cum-sa-alegi-o-bona-de-incredere', 'sfaturi-pentru-parinti-care-lucreaza'],
    content: (
      <>
        <p>
          Introducerea unei bone noi în viața copilului poate fi o experiență stresantă atât pentru
          cel mic, cât și pentru părinți. Cu o pregătire adecvată și o tranziție graduală, procesul
          poate fi mult mai ușor și mai natural. Iată cum să faci acest pas cu succes.
        </p>

        <h2>Pregătirea înainte de prima întâlnire</h2>
        <p>Începe prin a vorbi cu copilul despre schimbarea care urmează, adaptat vârstei lui:</p>
        <ul>
          <li>
            <strong>Copii de 1-2 ani:</strong> Deși nu înțeleg explicațiile complexe, tonul tău calm
            și pozitiv transmite siguranță. Menționează numele bonei de câteva ori pe zi.
          </li>
          <li>
            <strong>Copii de 3-5 ani:</strong> Explică simplu: &quot;O persoană drăguță va veni să
            se joace cu tine când mama și tata sunt la serviciu. Se numește [Nume].&quot;
          </li>
          <li>
            <strong>Copii de 6 ani și peste:</strong> Poți avea o conversație mai detaliată despre
            motivul pentru care aveți nevoie de ajutor și ce activități vor face împreună.
          </li>
        </ul>

        <h2>Tranziția graduală</h2>
        <p>Nu lăsa copilul singur cu bona de la prima întâlnire. Planifică o tranziție în etape:</p>
        <h3>Săptămâna 1: Familiarizarea</h3>
        <ul>
          <li>
            Prima vizită: bona vine acasă și vă cunoașteți toți trei. Stai în cameră și lasă-i să
            interacționeze natural.
          </li>
          <li>
            A doua vizită: bona se joacă cu copilul în timp ce tu ești în casă, dar în altă cameră.
          </li>
          <li>
            A treia vizită: pleacă din casă pentru 30-60 de minute și lasă copilul în grija bonei.
          </li>
        </ul>
        <h3>Săptămâna 2: Extinderea timpului</h3>
        <ul>
          <li>Crește treptat intervalul de absență de la 1-2 ore la programul complet.</li>
          <li>
            Stabilește o rutină clară pe care bona o urmează: mese, siestă, activități, plimbări.
          </li>
          <li>Discută seara cu copilul despre cum a fost ziua și validează-i emoțiile.</li>
        </ul>

        <h2>Gestionarea anxietății de separare</h2>
        <p>
          Anxietatea de separare este normală, mai ales la copiii între 8 luni și 3 ani. Nu te simți
          vinovat și nu te întoarce din drum dacă copilul plânge. Iată ce poți face:
        </p>
        <ul>
          <li>
            <strong>Creează un ritual de despărțire:</strong> Un sărut, o îmbrățișare și o frază
            pozitivă: &quot;Mă întorc după ce mănânci prânzul.&quot;
          </li>
          <li>
            <strong>Nu te furișa:</strong> Pleacă mereu cu un &quot;Pa-pa!&quot; clar. Dacă dispari
            fără să spui, copilul va deveni și mai anxios.
          </li>
          <li>
            <strong>Lasă un obiect de confort:</strong> Un tricou cu mirosul tău, o jucărie
            preferată sau o fotografie de familie.
          </li>
          <li>
            <strong>Fii punctual la întoarcere:</strong> Dacă ai promis că te întorci la o anumită
            oră, respectă promisiunea.
          </li>
        </ul>

        <h2>Comunicarea cu bona</h2>
        <p>O relație bună între tine și bonă este esențială pentru bunăstarea copilului:</p>
        <ul>
          <li>Stabilește un canal de comunicare (mesaje, aplicație) pentru actualizări zilnice.</li>
          <li>
            Cere rapoarte scurte despre cum a fost ziua: ce a mâncat, cât a dormit, ce activități au
            făcut.
          </li>
          <li>Programează discuții regulate despre progresul copilului și eventualele probleme.</li>
          <li>
            Fii deschis la sugestiile bonei. Ea petrece mult timp cu copilul și poate observa
            lucruri pe care tu nu le vezi.
          </li>
        </ul>

        <h2>Când lucrurile nu merg bine</h2>
        <p>
          Dacă, după 2-3 săptămâni de tranziție, copilul încă prezintă semne puternice de stres
          (regres în comportament, coșmaruri frecvente, refuz alimentar persistent), ia în
          considerare că bona aleasă poate să nu fie potrivită. Nu ezita să cauți o altă opțiune.
          Chimia dintre bonă și copil contează enorm și nu poate fi forțată.
        </p>
      </>
    ),
  },
  'sfaturi-pentru-parinti-care-lucreaza': {
    slug: 'sfaturi-pentru-parinti-care-lucreaza',
    title: 'Sfaturi pentru părinți care lucrează',
    excerpt:
      'Cum să menții echilibrul între carieră și familie. Strategii testate de gestionare a timpului, organizarea rutinei zilnice și modalități de a rămâne conectat cu copilul.',
    category: 'Educație',
    categoryColor: 'secondary',
    readTime: '6 min',
    date: '2026-02-15',
    relatedSlugs: ['activitati-educative-pentru-copii', 'cum-sa-alegi-o-bona-de-incredere'],
    content: (
      <>
        <p>
          Echilibrul între carieră și viața de familie este una dintre cele mai mari provocări ale
          părinților moderni. Vinovăția, oboseala și sentimentul că nu faci destul sunt emoții
          comune. Dar cu o organizare bună și o atitudine pozitivă, poți fi un părinte prezent și
          implicat chiar și cu un program de muncă solicitant.
        </p>

        <h2>Organizarea rutinei zilnice</h2>
        <p>
          O rutină bine stabilită reduce stresul pentru toată familia. Iată cum să o construiești:
        </p>
        <h3>Dimineața</h3>
        <ul>
          <li>
            <strong>Trezește-te cu 30 de minute înainte de copil</strong> pentru a te pregăti în
            liniște și a avea câteva momente doar pentru tine.
          </li>
          <li>
            Pregătește hainele și ghiozdanul din seara anterioară pentru a evita graba de dimineață.
          </li>
          <li>
            Micul dejun este un moment perfect pentru conexiune. Stai la masă cu copilul, chiar dacă
            doar 15 minute.
          </li>
        </ul>
        <h3>Seara</h3>
        <ul>
          <li>
            <strong>Prima oră după ce ajungi acasă este sacră:</strong> Lasă telefonul deoparte și
            oferă-i copilului atenție nedivizată.
          </li>
          <li>
            Implică copilul în activitățile casei: gătit împreună, pus masa, aranjat jucăriile.
          </li>
          <li>
            Ritualul de somn (poveste, cântec, discuție despre ziua care a trecut) este esențial
            pentru conexiunea emoțională.
          </li>
        </ul>

        <h2>Calitate versus cantitate</h2>
        <p>
          Cercetările arată că nu cantitatea de timp petrecut cu copilul contează cel mai mult, ci
          calitatea acestuia. Iată cum să maximizezi impactul timpului petrecut împreună:
        </p>
        <ul>
          <li>
            <strong>Fii cu adevărat prezent:</strong> Când ești cu copilul, fii acolo mental și
            emoțional. Telefonul pe silențios, laptopul închis.
          </li>
          <li>
            <strong>Creează tradiții săptămânale:</strong> O plimbare în parc sâmbăta dimineața,
            gătit pizza vineri seara sau o seară de jocuri de societate.
          </li>
          <li>
            <strong>Transformă drumurile zilnice în momente de calitate:</strong> Drumul cu mașina
            la grădiniță poate fi ocazia pentru cântece, povești sau conversații.
          </li>
        </ul>

        <h2>Gestionarea vinovăției</h2>
        <p>
          Vinovăția de părinte este normală, dar poate fi copleșitoare. Iată câteva strategii pentru
          a o gestiona:
        </p>
        <ul>
          <li>
            Amintește-ți că un părinte mulțumit profesional este un model pozitiv pentru copil.
          </li>
          <li>Copiii au nevoie de părinți fericiți, nu de părinți perfecți.</li>
          <li>
            Nu te compara cu alți părinți de pe rețelele sociale. Fiecare familie are propriul ritm.
          </li>
          <li>
            Dacă vinovăția devine copleșitoare, vorbește cu un psiholog specialist în problemele
            parentale.
          </li>
        </ul>

        <h2>Lucrul de acasă cu copii</h2>
        <p>Dacă lucrezi de acasă, stabilește limite clare:</p>
        <ul>
          <li>Amenajează un spațiu dedicat muncii, cu ușa care se poate închide.</li>
          <li>
            Folosește un semn vizual (de exemplu, o lumină roșie pe ușă) care indică că ești într-un
            apel important.
          </li>
          <li>Planifică pauze scurte pe parcursul zilei pentru a petrece timp cu copilul.</li>
          <li>
            Dacă copilul este mic, o bonă sau asistentă este esențială chiar și când ești acasă.
          </li>
        </ul>

        <h2>Delegarea și ajutorul</h2>
        <p>Nu încerca să faci totul singur. Cere și acceptă ajutor:</p>
        <ul>
          <li>
            <strong>Partenerul de viață:</strong> Împărțiți responsabilitățile în mod echitabil.
            Faceți o listă cu sarcinile zilnice și stabiliți cine se ocupă de fiecare.
          </li>
          <li>
            <strong>Bunicii și familia extinsă:</strong> Dacă sunt disponibili și dispuși,
            implicarea lor este valoroasă atât pentru copil, cât și pentru tine.
          </li>
          <li>
            <strong>Servicii externe:</strong> Curățenia, cumpărăturile sau gătitul pot fi delegate
            pentru a elibera timp prețios pe care să-l petreci cu familia.
          </li>
        </ul>
      </>
    ),
  },
  'alegerea-serviciilor-de-curatenie': {
    slug: 'alegerea-serviciilor-de-curatenie',
    title: 'Alegerea serviciilor de curățenie',
    excerpt:
      'Cum să găsești servicii de curățenie fiabile și sigure pentru familia ta. Ce să cauți, ce produse sunt sigure pentru copii și cum să evaluezi calitatea serviciilor.',
    category: 'Curățenie',
    categoryColor: 'outline',
    readTime: '5 min',
    date: '2026-02-10',
    relatedSlugs: ['siguranta-copilului-acasa', 'sfaturi-pentru-parinti-care-lucreaza'],
    content: (
      <>
        <p>
          Când ai copii mici, menținerea curățeniei acasă devine o provocare constantă. Apelarea la
          un serviciu profesional de curățenie nu este un lux, ci o investiție în sănătatea familiei
          și în timpul tău. Dar cum alegi serviciul potrivit, mai ales când ai copii?
        </p>

        <h2>De ce contează curățenia profesională</h2>
        <p>
          Copiii mici petrec mult timp pe podea, ating toate suprafețele și pun mâinile în gură. O
          curățenie profesională regulată reduce semnificativ:
        </p>
        <ul>
          <li>Alergenii din praf, polen și păr de animale</li>
          <li>Bacteriile și germenii de pe suprafețe</li>
          <li>Mucegaiul din zonele umede (baie, bucătărie)</li>
          <li>Acarienii din covoare, saltele și tapițerie</li>
        </ul>

        <h2>Ce să cauți la un serviciu de curățenie</h2>
        <h3>Experiența cu familii cu copii</h3>
        <p>
          Un serviciu care lucrează frecvent în case cu copii mici va ști deja ce produse sunt
          sigure, va fi atent la jucăriile de pe podea și va avea o abordare diferită față de
          curățenia într-un birou sau apartament de adulți. Întreabă direct:
        </p>
        <ul>
          <li>Au experiență în case cu copii mici?</li>
          <li>Pot adapta programul la somnul copilului?</li>
          <li>Sunt dispuși să folosească produsele furnizate de tine?</li>
        </ul>

        <h3>Produse sigure pentru copii</h3>
        <p>
          Multe produse convenționale de curățenie conțin substanțe chimice agresive care nu sunt
          potrivite într-o casă cu copii. Verifică sau solicită:
        </p>
        <ul>
          <li>
            <strong>Produse ecologice certificate</strong> (Ecolabel EU, Nordic Swan sau similare).
          </li>
          <li>
            <strong>Fără parfumuri sintetice puternice</strong> care pot irita căile respiratorii.
          </li>
          <li>
            <strong>Evitarea candelinei și substanțelor corozive</strong> în zonele accesibile
            copiilor.
          </li>
          <li>
            Alternative naturale: oțet alb, bicarbonat de sodiu, acid citric și săpun de Marsilia.
          </li>
        </ul>

        <h2>Evaluarea calității serviciilor</h2>
        <p>După primele ședințe de curățenie, evaluează calitatea serviciului:</p>
        <ul>
          <li>
            <strong>Consistența:</strong> Calitatea trebuie să fie aceeași de fiecare dată, nu doar
            la prima vizită.
          </li>
          <li>
            <strong>Atenția la detalii:</strong> Colțuri, sub mobilier, sertare de bucătărie,
            comutatoare.
          </li>
          <li>
            <strong>Punctualitatea:</strong> Respectarea orarului convenit este esențială, mai ales
            dacă programul tău depinde de asta.
          </li>
          <li>
            <strong>Comunicarea:</strong> Persoana de curățenie ar trebui să te informeze despre
            orice problemă descoperită (mucegai, insecte, defecțiuni).
          </li>
        </ul>

        <h2>Frecvența optimă</h2>
        <p>Frecvența curățeniei profesionale depinde de mai mulți factori:</p>
        <ul>
          <li>
            <strong>Casă cu copii mici (0-3 ani):</strong> Ideal de două ori pe săptămână, minimum o
            dată.
          </li>
          <li>
            <strong>Copii preșcolari și școlari:</strong> O dată pe săptămână este de obicei
            suficient.
          </li>
          <li>
            <strong>Dacă ai animale de companie:</strong> Adaugă o ședință suplimentară pentru
            aspirat și dezinfectat.
          </li>
        </ul>

        <h2>Stabilirea așteptărilor</h2>
        <p>Comunică clar ce te aștepți de la fiecare vizită:</p>
        <ul>
          <li>
            Fă o listă cu prioritățile tale (de exemplu: podeaua din camera copilului mereu aspirată
            și spălată, baia dezinfectată complet).
          </li>
          <li>Stabilește ce camere sunt incluse și care sunt opționale.</li>
          <li>Indică zonele sensibile: camera bebelușului, zona de joacă, bucătăria.</li>
          <li>Discută despre accesul în casă: vei fi acasă sau vei lăsa cheia?</li>
        </ul>

        <h2>Bugetul și plata</h2>
        <p>
          Prețurile variază în funcție de orașul, suprafața locuinței și frecvența serviciilor.
          Orientativ, în România:
        </p>
        <ul>
          <li>Curățenie generală (apartament 2 camere): 150-300 RON per vizită</li>
          <li>Curățenie generală (casă): 250-500 RON per vizită</li>
          <li>Curățenie generală lunară cu abonament: 10-20% reducere față de prețul unitar</li>
        </ul>
        <p>
          Caută pe JuniorHub furnizori de curățenie verificați și evaluați de alți părinți din zona
          ta.
        </p>
      </>
    ),
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = guides[params.slug];
  if (!guide) {
    return { title: 'Articol negăsit | JuniorHub' };
  }

  return {
    title: `${guide.title} | Ghid pentru Părinți | JuniorHub`,
    description: guide.excerpt,
    openGraph: {
      title: `${guide.title} | JuniorHub`,
      description: guide.excerpt,
      type: 'article',
      url: `https://juniorhub.ro/ghid-parinti/${guide.slug}`,
      publishedTime: guide.date,
    },
  };
}

export default function GuideArticlePage({ params }: { params: { slug: string } }) {
  const guide = guides[params.slug];

  if (!guide) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-foreground mb-4 text-2xl font-bold">Articol negăsit</h1>
          <p className="text-muted-foreground mb-6">Articolul pe care îl cauți nu există.</p>
          <Link
            href="/ghid-parinti"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Înapoi la ghiduri
          </Link>
        </div>
      </div>
    );
  }

  const relatedGuides = guide.relatedSlugs.map((slug) => guides[slug]).filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.excerpt,
    datePublished: guide.date,
    dateModified: guide.date,
    author: {
      '@type': 'Organization',
      name: 'JuniorHub',
      url: 'https://juniorhub.ro',
    },
    publisher: {
      '@type': 'Organization',
      name: 'JuniorHub',
      url: 'https://juniorhub.ro',
      logo: {
        '@type': 'ImageObject',
        url: 'https://juniorhub.ro/icons/icon-512x512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://juniorhub.ro/ghid-parinti/${guide.slug}`,
    },
    inLanguage: 'ro-RO',
    articleSection: guide.category,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-muted/50 min-h-screen py-12">
        <article className="mx-auto max-w-3xl px-4">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link
              href="/ghid-parinti"
              className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Înapoi la Ghid pentru Părinți
            </Link>
          </nav>

          {/* Article Header */}
          <header className="mb-10">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge variant={guide.categoryColor}>{guide.category}</Badge>
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                <Clock className="h-3.5 w-3.5" />
                <span>{guide.readTime} citire</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={guide.date}>{formatDate(guide.date)}</time>
              </div>
            </div>
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              {guide.title}
            </h1>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{guide.excerpt}</p>
          </header>

          {/* Article Body */}
          <div className="prose prose-gray dark:prose-invert prose-headings:text-foreground prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-2xl prose-h2:font-bold prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-lg prose-h3:font-semibold prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4 prose-ul:text-muted-foreground prose-ul:mb-4 prose-li:mb-1.5 prose-strong:text-foreground max-w-none">
            {guide.content}
          </div>

          {/* Related Articles */}
          {relatedGuides.length > 0 && (
            <section className="mt-16 border-t pt-10">
              <h2 className="text-foreground mb-6 text-2xl font-bold">Articole similare</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {relatedGuides.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/ghid-parinti/${related.slug}`}
                    className="bg-card hover:bg-accent group rounded-lg border p-5 transition-colors"
                  >
                    <Badge variant={related.categoryColor} className="mb-2">
                      {related.category}
                    </Badge>
                    <h3 className="text-foreground group-hover:text-primary mb-2 font-semibold transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 text-sm">{related.excerpt}</p>
                    <div className="text-muted-foreground mt-3 flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{related.readTime} citire</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-primary/5 border-primary/20 mt-12 rounded-lg border p-8 text-center">
            <h2 className="text-foreground mb-2 text-xl font-bold">
              Ai nevoie de servicii pentru familia ta?
            </h2>
            <p className="text-muted-foreground mb-4">
              Găsește bone verificate, servicii de curățenie și multe altele pe JuniorHub.
            </p>
            <Link
              href="/jobs"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-lg px-6 py-2.5 font-medium transition-colors"
            >
              Explorează servicii
            </Link>
          </section>
        </article>
      </div>
    </>
  );
}
