import './globals.css';

export const metadata = {
  title: 'Mini Lucky Box',
  description: 'ระบบสุ่มกล่องเครื่องประดับ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <nav
          style={{
            padding: '16px 24px',
            background: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '1.1rem', marginRight: '8px' }}>
            🎁 Mini Lucky Box
          </span>
          <a href="/" style={navLinkStyle}>คลังสินค้า</a>
          <a href="/draw" style={navLinkStyle}>สุ่มกล่อง</a>
          <a href="/history" style={navLinkStyle}>ประวัติการสุ่ม</a>
        </nav>
        <main style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
          {children}
        </main>
      </body>
    </html>
  );
}

const navLinkStyle = {
  color: '#6b7280',
  textDecoration: 'none',
  fontWeight: 500,
  fontSize: '0.9375rem',
};
