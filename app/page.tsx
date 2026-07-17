import { Suspense } from 'react';
import Builder from '@/components/Builder';

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Builder />
    </Suspense>
  );
}
