import { RouterProvider } from 'react-router';
import { appRouter } from '../app.router';
import { AuthProvider } from './auth/context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <RouterProvider router={appRouter}></RouterProvider>
        </AuthProvider>
    );
}

export default App;
