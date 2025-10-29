import { RouterProvider } from 'react-router';
import { appRouter } from '../app.router';
import { AuthProvider } from './auth/context/AuthContext';

function App() {
    return (
        <div>
            <AuthProvider>
                <div className={`min-h-screen`}>
                    <RouterProvider router={appRouter}></RouterProvider>
                </div>
            </AuthProvider>
        </div>
    );
}

export default App;
