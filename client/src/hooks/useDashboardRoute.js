import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const slugify = (name) => {
  if (name === 'Dashboard') return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const useDashboardRoute = (basePath, tabs = []) => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(() => {
    const rest = location.pathname.replace(basePath, '').replace(/^\/+/, '');
    const slug = (rest.split('/')[0] || '').toLowerCase();
    if (!slug) return 'Dashboard';
    return tabs.find((t) => slugify(t) === slug) || 'Dashboard';
  }, [location.pathname, basePath, tabs]);

  const setActiveTab = useCallback((name) => {
    const slug = slugify(name);
    navigate(slug ? `${basePath}/${slug}` : basePath);
  }, [basePath, navigate]);

  return { activeTab, setActiveTab };
};

export default useDashboardRoute;
