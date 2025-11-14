import { RouterProvider } from 'react-router';
import { appRouter } from '../app.router';
import { AuthProvider } from './auth/context/AuthContext';
import { ThemeProvider } from './components/theme-provider';
import { CollectionsProvider } from './library/context/CollectionsContext';

function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <AuthProvider>
                <CollectionsProvider>
                    <div className={`min-h-screen`}>
                        <RouterProvider router={appRouter}></RouterProvider>
                    </div>
                </CollectionsProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
