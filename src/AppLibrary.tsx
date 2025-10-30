import { RouterProvider } from 'react-router';
import { appRouter } from '../app.router';
import { AuthProvider } from './auth/context/AuthContext';
import { ThemeProvider } from './components/theme-provider';

function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <AuthProvider>
                <div className={`min-h-screen`}>
                    <RouterProvider router={appRouter}></RouterProvider>
                </div>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
