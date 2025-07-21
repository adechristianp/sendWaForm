import { Outlet, createRootRoute } from '@tanstack/react-router'
import Header from '@/components/Header';
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-black">
        <Outlet />
      </main>

      <footer className="bg-gray-100 dark:bg-gray-900 text-center text-sm p-4 text-gray-600 dark:text-gray-300">
        🌐 Lihat repo-nya di{' '}
        <a
          href="https://github.com/adechristianp/sendWaForm"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600 dark:hover:text-blue-400"
        >
          github.com/adechristianp/sendWaForm
        </a>
      </footer>
    </div>
  ),
});
