import { ProfileForm } from '@/library/components/ProfileForm';
import { MainContainer } from '@/library/components/MainContainer';

const ProfilePage = () => {
    return (
        <MainContainer>
            <div className="max-w-3xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                        Mi Perfil
                    </h1>
                    <p className="text-muted-foreground">
                        Administra tu información personal y configuración de cuenta
                    </p>
                </div>
                <ProfileForm />
            </div>
        </MainContainer>
    );
};

export default ProfilePage;
