import type { Metadata } from 'next';
import AtlasView from '@/components/AtlasView';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';

export const metadata: Metadata = {
  title: 'Design Space Atlas',
  description:
    'The full nine-dimension design space of technology-mediated representations of deceased companion animals.',
};

export default function SpacePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader current="/space" />
      <main className="w-full flex-1">
        <AtlasView />
      </main>
      <SiteFooter />
    </div>
  );
}
