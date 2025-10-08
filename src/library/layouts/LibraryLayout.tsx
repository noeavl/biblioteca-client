import { CustomHeader } from '../components/CustomHeader';
import { CustomFooter } from '../components/CustomFooter';
import { Outlet } from 'react-router';

export const LibraryLayout = () => {
    return (
        <>
            <div className="min-h-screen bg-white flex flex-col">
                <CustomHeader />
                <Outlet />
            </div>
            <CustomFooter />
        </>
    );
};
