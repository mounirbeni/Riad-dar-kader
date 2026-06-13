import { prisma } from "@/lib/prisma";
import { SETTING_KEYS } from "@/lib/constants";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  const settings = await prisma.siteSetting.findMany();
  const map = new Map(settings.map((s) => [s.key, s.value]));
  const holdPending = map.get(SETTING_KEYS.HOLD_PENDING_AVAILABILITY) === "true";
  const minNights = Number(map.get(SETTING_KEYS.MIN_NIGHTS) || "1");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-ink">Paramètres</h1>
        <p className="mt-1 text-sm text-muted">
          Réglages de disponibilité et de réservation.
        </p>
      </div>
      <SettingsForm holdPending={holdPending} minNights={minNights} />

      <div className="card max-w-xl p-6 text-sm text-muted">
        <h2 className="font-serif text-lg text-ink">Contenu & images</h2>
        <p className="mt-2">
          Les photos réelles pourront être ajoutées plus tard depuis la gestion des
          chambres (champ photos), en remplacement des visuels provisoires.
        </p>
      </div>
    </div>
  );
}
