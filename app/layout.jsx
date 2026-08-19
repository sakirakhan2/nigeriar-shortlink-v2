import './globals.css';

export const metadata = {
  title: 'Shortlink V2',
  description: 'Branded transparent URL shortener'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
