import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill';
import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Loading } from './components/Loading/Loading';
import { Toolbar } from './components/Toolbar/Toolbar';
import { AboutPage } from './pages/AboutPage/AboutPage';
import DeleteOldGames from './pages/DeleteOldGames/DeleteOldGames';
import { ExamplesPage } from './pages/ExamplesPage/ExamplesPage';
import { GamePage } from './pages/GamePage/GamePage';
import { GuidePage } from './pages/GuidePage/GuidePage';
import HomePage from './pages/HomePage/HomePage';
import JoinPage from './pages/JoinPage/JoinPage';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './contexts/ThemeContext';

polyfillCountryFlagEmojis();

const router = createBrowserRouter([
  {
    element: (
      <>
        <Toolbar />
        <Outlet />
      </>
    ),
    children: [
      { path: '/game/:id', element: <GamePage /> },
      { path: '/delete-old-games', element: <DeleteOldGames /> },
      { path: '/join/:id', element: <JoinPage /> },
      { path: '/about-planning-poker', element: <AboutPage /> },
      { path: '/examples', element: <ExamplesPage /> },
      { path: '/guide', element: <GuidePage /> },
      { path: '*', element: <HomePage /> },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider>
      <div className='bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen'>
        <Suspense
          fallback={
            <div className='text-center items-center justify-center flex'>
              <Loading />
            </div>
          }
        >
          <RouterProvider router={router} />
          <Toaster richColors position='top-center' />
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;

