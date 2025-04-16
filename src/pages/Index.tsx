
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';

const Index = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to RestaurantPro</h1>
          <p className="text-xl text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
