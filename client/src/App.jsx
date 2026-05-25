import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider }   from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { LocaleProvider } from './context/LocaleContext';
import AppShell  from './components/layout/AppShell';
import Home      from './pages/Home';
import Library   from './pages/Library';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Profile   from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlayerProvider>
          <LocaleProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<AppShell />}>
                  <Route index            element={<Home />}     />
                  <Route path="library"   element={<Library />}  />
                  <Route path="profile"   element={<Profile />}  />
                  <Route path="login"     element={<Login />}    />
                  <Route path="register"  element={<Register />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </LocaleProvider>
        </PlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
