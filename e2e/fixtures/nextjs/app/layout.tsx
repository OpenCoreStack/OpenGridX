import type { ReactNode } from 'react';
// The grid stylesheet, imported once at the root (docs/features/nextjs.md).
import '@opencorestack/opengridx/styles';

export const metadata = { title: 'OpenGridX on Next.js' };

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
