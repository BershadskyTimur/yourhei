// Shown for addresses that are not a language page at all (for example /wp-login.php or /.env, which bots try all day).
// Without this file such addresses ended in a server error (500) instead of a plain "not found" (404).
// It has no words on purpose: the visitor's language is not known here (real pages use [locale]/not-found.tsx).
export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, display: 'grid', minHeight: '100svh', placeItems: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ fontSize: '4rem', margin: 0, color: '#5b6e68' }}>404</p>
      </body>
    </html>
  );
}
