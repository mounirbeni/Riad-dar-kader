import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr
      ? "Mentions légales & Politique de confidentialité — Riad Dar Kader"
      : "Legal & Privacy Policy — Riad Dar Kader",
    robots: { index: false },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const fr = locale === "fr";

  return (
    <main className="container-page max-w-3xl py-16 lg:py-24">
      <h1 className="font-serif text-3xl text-ink sm:text-4xl">
        {fr ? "Mentions légales & Politique de confidentialité" : "Legal Notice & Privacy Policy"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {fr ? "Dernière mise à jour : juin 2025" : "Last updated: June 2025"}
      </p>

      {/* MENTIONS LÉGALES */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl text-ink">
          {fr ? "Mentions légales" : "Legal Notice"}
        </h2>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          <div>
            <p className="font-medium text-ink">{fr ? "Éditeur du site" : "Site operator"}</p>
            <p>Riad Dar Kader</p>
            <p>{fr ? "Médina, près du Musée Mouassine, Marrakech, Maroc" : "Medina, near Musée Mouassine, Marrakech, Morocco"}</p>
            <p>
              {fr ? "Email : " : "Email: "}
              <a href="mailto:contact@riaddarkader.com" className="text-terracotta hover:underline">
                contact@riaddarkader.com
              </a>
            </p>
          </div>
          <div>
            <p className="font-medium text-ink">{fr ? "Hébergement" : "Hosting"}</p>
            <p>Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA</p>
            <p>
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-terracotta hover:underline">
                vercel.com
              </a>
            </p>
          </div>
          <div>
            <p className="font-medium text-ink">{fr ? "Directeur de publication" : "Publication director"}</p>
            <p>Riad Dar Kader</p>
          </div>
        </div>
      </section>

      <hr className="my-10 border-sand-200" />

      {/* POLITIQUE DE CONFIDENTIALITÉ */}
      <section id="privacy">
        <h2 className="font-serif text-2xl text-ink">
          {fr ? "Politique de confidentialité" : "Privacy Policy"}
        </h2>

        <div className="mt-6 space-y-8 text-sm leading-relaxed text-muted">
          <div>
            <h3 className="font-medium text-ink">
              {fr ? "Données collectées" : "Data we collect"}
            </h3>
            <p className="mt-2">
              {fr
                ? "Lorsque vous effectuez une demande de réservation ou créez un compte, nous collectons les informations suivantes : nom, adresse e-mail, numéro de téléphone, pays de résidence et détails de votre séjour (dates, nombre de voyageurs, demandes particulières)."
                : "When you submit a booking request or create an account, we collect the following information: name, email address, phone number, country of residence, and stay details (dates, number of guests, special requests)."}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-ink">
              {fr ? "Utilisation des données" : "How we use your data"}
            </h3>
            <p className="mt-2">
              {fr
                ? "Vos données sont utilisées exclusivement pour : traiter votre demande de réservation, vous envoyer une confirmation et des informations relatives à votre séjour, améliorer nos services. Nous ne vendons ni ne transmettons vos données à des tiers à des fins commerciales."
                : "Your data is used exclusively to: process your booking request, send you confirmation and stay-related information, and improve our services. We do not sell or share your data with third parties for commercial purposes."}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-ink">
              {fr ? "Durée de conservation" : "Data retention"}
            </h3>
            <p className="mt-2">
              {fr
                ? "Vos données sont conservées pendant une durée maximale de 3 ans à compter de votre dernier séjour ou de votre dernière interaction avec le riad, sauf obligation légale contraire."
                : "Your data is retained for a maximum of 3 years from your last stay or last interaction with the riad, unless required otherwise by law."}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-ink">
              {fr ? "Cookies" : "Cookies"}
            </h3>
            <p className="mt-2">
              {fr
                ? "Ce site utilise uniquement des cookies techniques essentiels au fonctionnement de l'application (session utilisateur, préférences de langue). Aucun cookie publicitaire ni de tracking tiers n'est utilisé."
                : "This site uses only essential technical cookies required for the application to function (user session, language preferences). No advertising or third-party tracking cookies are used."}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-ink">
              {fr ? "Vos droits (RGPD)" : "Your rights (GDPR)"}
            </h3>
            <p className="mt-2">
              {fr
                ? "Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants : accès, rectification, effacement, portabilité et opposition. Pour exercer ces droits, contactez-nous à "
                : "In accordance with the General Data Protection Regulation (GDPR), you have the following rights: access, rectification, erasure, portability and objection. To exercise these rights, contact us at "}
              <a href="mailto:contact@riaddarkader.com" className="text-terracotta hover:underline">
                contact@riaddarkader.com
              </a>
              {fr ? "." : "."}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-ink">
              {fr ? "Sécurité" : "Security"}
            </h3>
            <p className="mt-2">
              {fr
                ? "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation."
                : "We implement appropriate technical and organisational measures to protect your data against unauthorised access, loss or disclosure."}
            </p>
          </div>
        </div>
      </section>

      <hr className="my-10 border-sand-200" />

      {/* CONDITIONS GÉNÉRALES */}
      <section id="terms">
        <h2 className="font-serif text-2xl text-ink">
          {fr ? "Conditions générales" : "Terms & Conditions"}
        </h2>

        <div className="mt-6 space-y-8 text-sm leading-relaxed text-muted">
          <div>
            <h3 className="font-medium text-ink">
              {fr ? "Demandes de réservation" : "Booking requests"}
            </h3>
            <p className="mt-2">
              {fr
                ? "Toute demande de réservation effectuée via ce site constitue une demande et non une réservation ferme. Le riad vous contactera pour confirmer la disponibilité et les modalités. La réservation est effective à la réception de la confirmation écrite du riad."
                : "Any booking request made through this site is a request, not a confirmed reservation. The riad will contact you to confirm availability and terms. The booking is confirmed upon receipt of written confirmation from the riad."}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-ink">
              {fr ? "Tarifs" : "Pricing"}
            </h3>
            <p className="mt-2">
              {fr
                ? "Les tarifs affichés sont indiqués en euros (€) et sont susceptibles d'évoluer. Le prix définitif est celui communiqué dans la confirmation de réservation. Les tarifs incluent la taxe de séjour applicable."
                : "Prices displayed are in euros (€) and are subject to change. The final price is the one communicated in the booking confirmation. Prices include applicable tourist tax."}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-ink">
              {fr ? "Annulation" : "Cancellation"}
            </h3>
            <p className="mt-2">
              {fr
                ? "Les conditions d'annulation sont précisées dans la confirmation de réservation. En cas de non-présentation sans annulation préalable, un montant correspondant à la première nuit pourra être facturé."
                : "Cancellation terms are specified in the booking confirmation. In the event of a no-show without prior cancellation, an amount equal to the first night may be charged."}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-ink">
              {fr ? "Arrivée & départ" : "Check-in & check-out"}
            </h3>
            <p className="mt-2">
              {fr
                ? "L'heure d'arrivée habituelle est à partir de 14h00. L'heure de départ est avant 12h00. Des horaires flexibles peuvent être arrangés selon disponibilité et sur demande."
                : "Standard check-in time is from 2:00 PM. Check-out is before 12:00 PM. Flexible timings can be arranged subject to availability and on request."}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-ink">
              {fr ? "Responsabilité" : "Liability"}
            </h3>
            <p className="mt-2">
              {fr
                ? "Riad Dar Kader ne pourra être tenu responsable de tout dommage indirect, perte ou préjudice résultant de l'utilisation de ce site ou d'un séjour au riad, sauf en cas de faute grave ou de fraude."
                : "Riad Dar Kader cannot be held liable for any indirect damage, loss or prejudice resulting from the use of this site or a stay at the riad, except in cases of gross negligence or fraud."}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-ink">
              {fr ? "Droit applicable" : "Governing law"}
            </h3>
            <p className="mt-2">
              {fr
                ? "Les présentes conditions sont régies par le droit marocain. Tout litige sera soumis à la juridiction compétente de Marrakech."
                : "These terms are governed by Moroccan law. Any dispute shall be subject to the competent jurisdiction of Marrakech."}
            </p>
          </div>
        </div>
      </section>

      <hr className="my-10 border-sand-200" />

      <p className="text-xs text-muted">
        {fr
          ? "Pour toute question relative à la présente politique ou à vos données personnelles, contactez-nous à "
          : "For any questions regarding this policy or your personal data, contact us at "}
        <a href="mailto:contact@riaddarkader.com" className="text-terracotta hover:underline">
          contact@riaddarkader.com
        </a>
        .
      </p>
    </main>
  );
}
