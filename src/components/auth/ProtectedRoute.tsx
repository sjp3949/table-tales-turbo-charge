
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';

// Changed from named export to default export
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/auth');
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
