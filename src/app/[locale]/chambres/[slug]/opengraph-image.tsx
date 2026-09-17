import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/constants";

export const alt = "Riad room preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

const ROOM_IMAGES: Record<string, string> = {
  mouassine: "/images/riad/mouassine.webp",
  saadienne: "/images/riad/saadienne.webp",
  bahia: "/images/riad/bahia.webp",
  koutoubia: "/images/riad/koutoubia.webp",
  medina: "/images/riad/medina-suite.webp",
  patio: "/images/riad/patio-suite.webp",
  terrasse: "/images/riad/terrasse-suite.webp",
};

export default async function RoomOpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const room = await prisma.room.findFirst({
    where: { slug, isActive: true },
  });

  const roomName = room?.name || (locale === "en" ? "Room & Suite" : "Chambre & Suite");
  const description = room
    ? locale === "en"
      ? room.descriptionEn || room.description
      : room.description
    : locale === "en"
      ? "A refined stay in the heart of Marrakech Medina."
      : "Un séjour raffiné au cœur de la Médina de Marrakech.";

  const baseUrl = siteUrl().replace(/\/+$/, "");
  const imagePath = room?.photos?.[0] || ROOM_IMAGES[slug] || "/images/riad/patio.webp";
  const imageUrl = new URL(imagePath, `${baseUrl}/`).toString();

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#18130f",
          color: "#fffaf2",
        }}
      >
        <img
          src={imageUrl}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(24,19,15,0.08) 15%, rgba(24,19,15,0.32) 48%, rgba(24,19,15,0.94) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            top: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 23,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: "#f2d49b" }}>MBN DEMO RIAD</span>
          <span style={{ color: "rgba(255,250,242,0.82)" }}>Marrakech · Médina</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 58,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 70,
              height: 3,
              marginBottom: 22,
              background: "#c79a5b",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 66,
              lineHeight: 1,
              fontWeight: 600,
              letterSpacing: "-0.025em",
            }}
          >
            {roomName}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 930,
              marginTop: 20,
              fontSize: 25,
              lineHeight: 1.35,
              color: "rgba(255,250,242,0.88)",
            }}
          >
            {description.slice(0, 145)}
          </div>
        </div>
      </div>
    ),
    size
  );
}
