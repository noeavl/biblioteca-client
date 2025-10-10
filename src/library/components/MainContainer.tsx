import React from 'react';

export const MainContainer = ({ children }: { children: React.ReactNode }) => {
    return <div className="p-10">{children}</div>;
};
