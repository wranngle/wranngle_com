import {createRoot} from 'react-dom/client';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from './lib/queryClient';
import {Toaster} from '@/components/ui/toaster';
import Router from './Router';
import './index.css';

createRoot(document.querySelector('#root')!).render(
  <QueryClientProvider client={queryClient}>
    <Router />
    <Toaster />
  </QueryClientProvider>,
);
