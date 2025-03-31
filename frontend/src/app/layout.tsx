// app/layout.tsx
import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fantasy Baseball Stats',
  description: 'Baseball statistics for fantasy baseball analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="bg-blue-600 text-white">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">Fantasy Baseball Stats</h1>
            <p className="mt-2">Powered by pybaseball</p>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Fantasy Baseball Stats</p>
            <p className="text-sm mt-2">
              Data provided by pybaseball. All stats belong to MLB, FanGraphs, and Baseball Savant.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}