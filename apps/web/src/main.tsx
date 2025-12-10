import 'reflect-metadata';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importa a árvore de rotas gerada automaticamente
import { routeTree } from './routeTree.gen';

import { AuthProvider, useAuth } from './context/auth-context';
import { ThemeProvider } from './components/theme-provider';
import './index.css';

// Error Boundary, para capturar erros no app de forma global
import { RootErrorBoundary } from './components/root-error-boundary';

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    auth: undefined!,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ auth }} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <RootErrorBoundary>
            <InnerApp />
          </RootErrorBoundary>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);