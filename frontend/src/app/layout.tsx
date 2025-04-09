'use client';

import '@mantine/core/styles.css';
// import { Metadata } from 'next';
import { MantineProvider, AppShell, Title, Text, Container} from '@mantine/core';

// export const metadata: Metadata = {
//   title: 'Fantasy Baseball Stats',
//   description: 'Baseball statistics for fantasy baseball analysis',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MantineProvider defaultColorScheme='dark'>
          <AppShell
            header={{ height: 80 }}
            footer={{ height: 60 }}
          >
            <AppShell.Header p="md">
              <Container size="lg">
                <Title order={1} size="h3" fw={700}>Fantasy Baseball Stats</Title>
                <Text size="sm" c="blue.4">Powered by pybaseball</Text>
              </Container>
            </AppShell.Header>
            
            <AppShell.Main pt="6rem" mb="1rem">
              <Container size="lg">
                {children}
              </Container>
            </AppShell.Main>
            
            <AppShell.Footer p="md">
              <Container size="lg">
                <Text ta="center" size="xs" c="dimmed">
                  &copy; {new Date().getFullYear()} Fantasy Baseball Stats
                </Text>
                <Text ta="center" size="xs" c="dimmed">
                  Data provided by pybaseball. All stats belong to MLB, FanGraphs, and Baseball Savant.
                </Text>
              </Container>
            </AppShell.Footer>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}