export default function SuccessPage() {
  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h1 style={{ textAlign: "center" }}>Success!</h1>
      <p style={{ textAlign: "center" }}>Your operation was successful. Thank you for using our service!</p>
      <p style={{ textAlign: "center" }}>
        <a href="/" style={{ color: "#0070f3", textDecoration: "none" }}>Go back to home</a>
      </p>
    </div>
  );
}