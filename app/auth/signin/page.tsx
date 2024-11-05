import LoginModal from '@/app/components/LoginModal';

export default function SignIn() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <LoginModal isStandalone={true} />
        </div>
    );
}
