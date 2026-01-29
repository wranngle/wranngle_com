import {createRoot} from 'react-dom/client';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from './lib/queryClient.ts';
import Router from './Router.tsx';
import './index.css';
import {Toaster} from '@/components/ui/toaster.tsx';

createRoot(document.querySelector('#root')!).render(
  <QueryClientProvider client={queryClient}>
    <Router />
    <Toaster />
  </QueryClientProvider>,
);
