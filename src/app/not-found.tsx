import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="fr">
      <body
        style={{
          background: "#F5F0E8",
          color: "#1A1A1A",
          fontFamily: "Georgia, serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 48, color: "#8B3A2A", margin: 0 }}>404</h1>
          <p style={{ color: "#7A6A58", marginTop: 8 }}>
            Cette page est introuvable.
          </p>
          <Link
            href="/fr"
            style={{
              display: "inline-block",
              marginTop: 20,
              background: "#8B3A2A",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 999,
              textDecoration: "none",
            }}
          >
            Retour à l'accueil
          </Link>
        </div>
      </body>
    </html>
  );
}
