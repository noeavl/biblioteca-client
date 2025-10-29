import { CustomHeader } from '../components/CustomHeader';
import { CustomFooter } from '../components/CustomFooter';
import { Outlet } from 'react-router';
import { useWakeUpBackend } from '../hooks/useWakeUpBackend';

export const LibraryLayout = () => {
    useWakeUpBackend();

    return (
        <>
            <div className="min-h-screen flex flex-col">
                {' '}
                <CustomHeader />
                <Outlet />
            </div>
            <CustomFooter />
        </>
    );
};
