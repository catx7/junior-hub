import { Resend } from 'resend';
import { logger } from './logger';

// Lazy-init to avoid throwing at module load when key is missing
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'JuniorHub <noreply@juniorhub.ro>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://juniorhub.ro';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const resend = getResend();
  if (!resend) {
    logger.warn('RESEND_API_KEY not set, skipping email', { to, subject });
    return null;
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    logger.info('Email sent', { to, subject, id: result.data?.id });
    return result;
  } catch (error) {
    logger.error('Failed to send email', { to, subject, error });
    return null;
  }
}

// ─── Email Templates ─────────────────────────────────────────

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JuniorHub</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#7c3aed;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">JuniorHub</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                &copy; ${new Date().getFullYear()} JuniorHub. Toate drepturile rezervate.
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                <a href="${APP_URL}/settings" style="color:#7c3aed;text-decoration:none;">Setari notificari</a>
                &nbsp;&middot;&nbsp;
                <a href="${APP_URL}/privacy" style="color:#7c3aed;text-decoration:none;">Confidentialitate</a>
                &nbsp;&middot;&nbsp;
                <a href="${APP_URL}/terms" style="color:#7c3aed;text-decoration:none;">Termeni</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background-color:#7c3aed;border-radius:8px;padding:12px 24px;">
        <a href="${href}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">${text}</a>
      </td>
    </tr>
  </table>`;
}

// ─── Welcome Email ───────────────────────────────────────────

export function sendWelcomeEmail(to: string, name: string) {
  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Bine ai venit, ${name}!</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      Contul tau JuniorHub a fost creat cu succes. Esti gata sa descoperi servicii de incredere pentru familia ta.
    </p>
    <p style="margin:0 0 8px;color:#374151;font-size:15px;line-height:1.6;">
      <strong>Ce poti face acum:</strong>
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;color:#374151;font-size:15px;line-height:1.8;">
      <li>Completeaza-ti profilul</li>
      <li>Cauta furnizori in zona ta</li>
      <li>Publica primul tau anunt</li>
    </ul>
    ${button('Completeaza profilul', `${APP_URL}/onboarding`)}
    <p style="margin:0;color:#6b7280;font-size:13px;">
      Daca ai intrebari, echipa noastra iti sta la dispozitie la <a href="mailto:contact@juniorhub.ro" style="color:#7c3aed;">contact@juniorhub.ro</a>.
    </p>
  `);

  return sendEmail({
    to,
    subject: 'Bine ai venit pe JuniorHub!',
    html,
    text: `Bine ai venit, ${name}! Contul tau JuniorHub a fost creat cu succes. Viziteaza ${APP_URL}/onboarding pentru a-ti completa profilul.`,
  });
}

// ─── Offer Accepted Email ────────────────────────────────────

export function sendOfferAcceptedEmail(
  to: string,
  providerName: string,
  jobTitle: string,
  jobId: string
) {
  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Oferta ta a fost acceptata!</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      Felicitari, <strong>${providerName}</strong>! Oferta ta pentru <strong>&ldquo;${jobTitle}&rdquo;</strong> a fost acceptata.
    </p>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      Contacteaza clientul prin chat pentru a stabili detaliile.
    </p>
    ${button('Vezi detaliile', `${APP_URL}/jobs/${jobId}`)}
  `);

  return sendEmail({
    to,
    subject: `Oferta acceptata: ${jobTitle}`,
    html,
    text: `Felicitari, ${providerName}! Oferta ta pentru "${jobTitle}" a fost acceptata. Vezi detaliile: ${APP_URL}/jobs/${jobId}`,
  });
}

// ─── Offer Rejected Email ────────────────────────────────────

export function sendOfferRejectedEmail(to: string, providerName: string, jobTitle: string) {
  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Oferta ta nu a fost acceptata</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      ${providerName}, din pacate oferta ta pentru <strong>&ldquo;${jobTitle}&rdquo;</strong> nu a fost acceptata de aceasta data.
    </p>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      Nu te descuraja! Continua sa aplici la alte anunturi din zona ta.
    </p>
    ${button('Cauta anunturi', `${APP_URL}/jobs`)}
  `);

  return sendEmail({
    to,
    subject: `Oferta nereusita: ${jobTitle}`,
    html,
    text: `${providerName}, oferta ta pentru "${jobTitle}" nu a fost acceptata. Cauta alte anunturi: ${APP_URL}/jobs`,
  });
}

// ─── New Message Notification ────────────────────────────────

export function sendNewMessageEmail(
  to: string,
  recipientName: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
) {
  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Mesaj nou de la ${senderName}</h2>
    <div style="margin:0 0 16px;padding:16px;background-color:#f9fafb;border-radius:8px;border-left:4px solid #7c3aed;">
      <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;font-style:italic;">
        &ldquo;${messagePreview.length > 200 ? messagePreview.slice(0, 200) + '...' : messagePreview}&rdquo;
      </p>
    </div>
    ${button('Raspunde', `${APP_URL}/messages/${conversationId}`)}
    <p style="margin:0;color:#6b7280;font-size:13px;">
      Raspunde direct din aplicatie pentru a continua conversatia.
    </p>
  `);

  return sendEmail({
    to,
    subject: `Mesaj nou de la ${senderName}`,
    html,
    text: `${recipientName}, ai primit un mesaj de la ${senderName}: "${messagePreview.slice(0, 100)}". Raspunde: ${APP_URL}/messages/${conversationId}`,
  });
}

// ─── New Offer Received Email ────────────────────────────────

export function sendNewOfferEmail(
  to: string,
  posterName: string,
  providerName: string,
  jobTitle: string,
  price: number,
  currency: string,
  jobId: string
) {
  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Oferta noua pentru anuntul tau</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      ${posterName}, <strong>${providerName}</strong> a trimis o oferta pentru <strong>&ldquo;${jobTitle}&rdquo;</strong>.
    </p>
    <div style="margin:0 0 16px;padding:16px;background-color:#f0fdf4;border-radius:8px;text-align:center;">
      <p style="margin:0;color:#166534;font-size:24px;font-weight:700;">${price} ${currency}</p>
    </div>
    ${button('Vezi oferta', `${APP_URL}/jobs/${jobId}`)}
  `);

  return sendEmail({
    to,
    subject: `Oferta noua: ${jobTitle} - ${price} ${currency}`,
    html,
    text: `${posterName}, ${providerName} a trimis o oferta de ${price} ${currency} pentru "${jobTitle}". Vezi: ${APP_URL}/jobs/${jobId}`,
  });
}

// ─── Weekly Digest Email ─────────────────────────────────────

interface DigestJob {
  id: string;
  title: string;
  location: string;
  category: string;
}

export function sendWeeklyDigestEmail(to: string, name: string, jobs: DigestJob[], city: string) {
  const jobRows = jobs
    .slice(0, 10)
    .map(
      (job) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <a href="${APP_URL}/jobs/${job.id}" style="color:#111827;text-decoration:none;font-weight:600;font-size:15px;">${job.title}</a>
        <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">${job.location} &middot; ${job.category}</p>
      </td>
    </tr>`
    )
    .join('');

  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Anunturi noi in ${city}</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      Salut ${name}, iata cele mai recente anunturi din zona ta:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      ${jobRows}
    </table>
    ${button('Vezi toate anunturile', `${APP_URL}/jobs`)}
    <p style="margin:0;color:#6b7280;font-size:13px;">
      Primesti acest email saptamanal. <a href="${APP_URL}/settings" style="color:#7c3aed;">Dezaboneaza-te</a>
    </p>
  `);

  return sendEmail({
    to,
    subject: `${jobs.length} anunturi noi in ${city} - JuniorHub`,
    html,
    text: `${name}, ai ${jobs.length} anunturi noi in ${city}. Vezi: ${APP_URL}/jobs`,
  });
}

// ─── Email Verification ─────────────────────────────────────

export function sendVerificationEmail(to: string, name: string, token: string) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;

  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Confirma adresa de email</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      Salut ${name}, te rugam sa confirmi adresa de email apasand butonul de mai jos.
    </p>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      Linkul expira in <strong>24 de ore</strong>.
    </p>
    ${button('Confirma emailul', verifyUrl)}
    <p style="margin:0;color:#6b7280;font-size:13px;">
      Daca nu ai creat un cont pe JuniorHub, poti ignora acest email.
    </p>
    <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;word-break:break-all;">
      Sau copiaza acest link: ${verifyUrl}
    </p>
  `);

  return sendEmail({
    to,
    subject: 'Confirma adresa de email - JuniorHub',
    html,
    text: `Salut ${name}, confirma adresa de email accesand: ${verifyUrl}. Linkul expira in 24 de ore.`,
  });
}

// ─── Booking Confirmation Email ─────────────────────────────

interface BookingEmailData {
  recipientName: string;
  otherPartyName: string;
  jobTitle: string;
  startDateTime: string;
  endDateTime: string;
  totalPrice: number;
  currency: string;
  bookingId: string;
}

export function sendBookingConfirmationEmail(
  to: string,
  data: BookingEmailData,
  role: 'client' | 'provider'
) {
  const isClient = role === 'client';
  const heading = isClient ? 'Rezervarea ta a fost confirmata!' : 'Ai o noua rezervare confirmata!';
  const intro = isClient
    ? `${data.recipientName}, rezervarea ta cu <strong>${data.otherPartyName}</strong> pentru <strong>&ldquo;${data.jobTitle}&rdquo;</strong> a fost confirmata.`
    : `${data.recipientName}, <strong>${data.otherPartyName}</strong> a confirmat rezervarea pentru <strong>&ldquo;${data.jobTitle}&rdquo;</strong>.`;

  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">${heading}</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      ${intro}
    </p>
    <div style="margin:0 0 24px;padding:16px;background-color:#f9fafb;border-radius:8px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">
        <tr>
          <td style="padding:6px 0;font-weight:600;">Data inceput:</td>
          <td style="padding:6px 0;">${data.startDateTime}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:600;">Data sfarsit:</td>
          <td style="padding:6px 0;">${data.endDateTime}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:600;">Pret total:</td>
          <td style="padding:6px 0;color:#166534;font-weight:600;">${data.totalPrice} ${data.currency}</td>
        </tr>
      </table>
    </div>
    ${button('Vezi detaliile rezervarii', `${APP_URL}/jobs/${data.bookingId}`)}
    <p style="margin:0;color:#6b7280;font-size:13px;">
      Contacteaza ${isClient ? 'furnizorul' : 'clientul'} prin chat pentru a stabili detaliile.
    </p>
  `);

  return sendEmail({
    to,
    subject: `Rezervare confirmata: ${data.jobTitle}`,
    html,
    text: `${data.recipientName}, rezervarea pentru "${data.jobTitle}" a fost confirmata. Data: ${data.startDateTime}. Pret: ${data.totalPrice} ${data.currency}. Detalii: ${APP_URL}/jobs/${data.bookingId}`,
  });
}
