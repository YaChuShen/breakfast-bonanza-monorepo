import ChakraUiProvider from './chakraUiProvider';
import { Globals } from './GlobalProviders';
import MixpanelProvider from './mixpanel-provider';
import { ReduxProviders } from './reduxProviders';
import { SessionProviders } from './sessionProviders';
import { SocketIoProvider } from './socketIoProvider';

export const metadata = {
  title: {
    default: 'Breakfast Bonanza',
    template: '%s | Breakfast Bonanza',
  },
  description: 'Make Maximum Breakfasts in Limited Time - A fun cooking game!',
  keywords: ['cooking game', 'breakfast game', 'time management game'],
  openGraph: {
    title: 'Breakfast Bonanza',
    description: 'Make Maximum Breakfasts in Limited Time',
    url: 'https://cook-breakfast-game.vercel.app/',
    siteName: 'Breakfast Bonanza',
    images: [
      {
        url: '/breakfast_bonanza_logo.svg',
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/egg.svg',
    shortcut: '/egg.svg',
    apple: '/egg.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>
          <SessionProviders>
            <ReduxProviders>
              <ChakraUiProvider>
                <MixpanelProvider>
                  <SocketIoProvider>
                    {children}
                    <Globals />
                  </SocketIoProvider>
                </MixpanelProvider>
              </ChakraUiProvider>
            </ReduxProviders>
          </SessionProviders>
        </main>
      </body>
    </html>
  );
}
