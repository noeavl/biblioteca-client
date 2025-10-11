export const Icon = ({ icon }: { icon: string | undefined }) => {
    return (
        <span className="material-symbols-outlined">{icon ?? 'favorite'}</span>
    );
};
