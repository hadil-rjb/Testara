import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Testara — AI-Powered QA Automation',
  description:
    'Testara explores your website, generates tailored test scenarios, automatically executes them, and provides precise reports.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
