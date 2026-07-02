import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, TextField, InputAdornment, List, ListItem, ListItemText, ListItemIcon, Typography, Divider, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { EmptyState } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface SearchResult { label: string; path: string; category: string; icon: React.ReactNode; }

const SUPER_ADMIN_RESULTS: SearchResult[] = [
  { label: 'Dashboard', path: ROUTES.SUPER_ADMIN_DASHBOARD, category: 'Pages', icon: <DashboardIcon /> },
  { label: 'Admin Management', path: ROUTES.SUPER_ADMIN_ADMINS, category: 'Pages', icon: <PeopleIcon /> },
  { label: 'Tenant Management', path: ROUTES.SUPER_ADMIN_TENANTS, category: 'Pages', icon: <BusinessIcon /> },
  { label: 'Analytics', path: ROUTES.SUPER_ADMIN_ANALYTICS, category: 'Pages', icon: <DashboardIcon /> },
];
const ADMIN_RESULTS: SearchResult[] = [
  { label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, category: 'Pages', icon: <DashboardIcon /> },
  { label: 'Users', path: ROUTES.ADMIN_USERS, category: 'Pages', icon: <PeopleIcon /> },
  { label: 'Orders', path: ROUTES.ADMIN_ORDERS, category: 'Pages', icon: <DashboardIcon /> },
];

interface SmartSearchProps { open: boolean; onClose: () => void; }

export default function SmartSearch({ open, onClose }: SmartSearchProps) {
  const navigate = useNavigate();
  const role = useSelector((state: RootState) => state.auth.role);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const allResults = role === 'SUPER_ADMIN' ? SUPER_ADMIN_RESULTS : ADMIN_RESULTS;
  const filtered = debouncedQuery ? allResults.filter(r => r.label.toLowerCase().includes(debouncedQuery.toLowerCase())) : allResults;

  const grouped = filtered.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  useEffect(() => { if (!open) setQuery(''); }, [open]);

  const handleSelect = useCallback((path: string) => { navigate(path); onClose(); }, [navigate, onClose]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, mt: '10vh' }, elevation: 8 }}>
      <DialogContent sx={{ p: 0 }}>
        <TextField fullWidth placeholder="Search pages, actions..." value={query} onChange={e => setQuery(e.target.value)} autoFocus
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>, sx: { borderRadius: 0, '& fieldset': { border: 'none' }, fontSize: '1.1rem' } }}
          sx={{ p: 0 }} />
        <Divider />
        {filtered.length === 0
          ? <Box sx={{ p: 3 }}><EmptyState title={`No results found for "${debouncedQuery}"`} compact /></Box>
          : Object.entries(grouped).map(([cat, results]) => (
              <Box key={cat}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{cat}</Typography>
                <List dense disablePadding>
                  {results.map(r => (
                    <ListItem key={r.path} button onClick={() => handleSelect(r.path)} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>{r.icon}</ListItemIcon>
                      <ListItemText primary={r.label} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
      </DialogContent>
    </Dialog>
  );
}
