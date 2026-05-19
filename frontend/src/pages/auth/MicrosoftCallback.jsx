import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { setSession } from '../../services/authStorage';
import api from '../../api/client';

export default function MicrosoftCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const error = params.get('error');
    if (error) {
      toast.error(decodeURIComponent(error));
      navigate('/login', { replace: true });
      return;
    }

    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      api
        .get('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(({ data }) => {
          setSession({ accessToken, refreshToken, user: data.data });
          toast.success('Signed in with Microsoft');
          window.location.href = '/dashboard';
        })
        .catch(() => {
          toast.error('Failed to complete Microsoft sign-in');
          navigate('/login', { replace: true });
        });
      return;
    }

    navigate('/login', { replace: true });
  }, [params, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-500">Completing Microsoft sign-in…</p>
    </div>
  );
}

