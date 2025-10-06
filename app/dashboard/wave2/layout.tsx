import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wave2 Dashboard - Fairvia',
  description: 'Advanced property management dashboard with comprehensive analytics and tenant engagement tools',
};

export default function Wave2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}