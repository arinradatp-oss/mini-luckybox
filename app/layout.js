import './globals.css';

export const metadata = {
  title: 'Mini Lucky Box',
  description: 'ระบบสุ่มกล่องเครื่องประดับ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <nav style={{ padding: '16px', borderBottom: '1px solid #ddd', display: 'flex', gap: '16px' }}>
          <a href="/">คลังสินค้า</a>
          <a href="/draw">สุ่มกล่อง</a>
          <a href="/history">ประวัติการสุ่ม</a>
        </nav>
        <main style={{ padding: '16px' }}>{children}</main>
      </body>
    </html>
  );
}
