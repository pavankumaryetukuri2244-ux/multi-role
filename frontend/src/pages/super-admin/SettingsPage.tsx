import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Alert, Stack, TextField,
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, IconButton, Skeleton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getSettings, updateSetting } from '@/services/superAdmin.service';
import type { PlatformSetting } from '@/services/types';
import { pushToast } from '@/store/slices/uiSlice';
import type { AppDispatch } from '@/store';

export default function SuperAdminSettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: settings = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.platformSettings,
    queryFn: getSettings,
  });

  const maintenanceMode = settings.find(
    (s: PlatformSetting) => s.settingKey === 'maintenance_mode'
  )?.settingValue === 'true';

  const updateMutation = useMutation({
    mutationFn: updateSetting,
    onSuccess: () => {
      dispatch(pushToast({ severity: 'success', message: 'Setting updated successfully' }));
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.platformSettings });
      setEditingKey(null);
    },
    onError: () => dispatch(pushToast({ severity: 'error', message: 'Failed to update setting' })),
  });

  const handleSave = (setting: PlatformSetting) => {
    updateMutation.mutate({
      settingKey: setting.settingKey,
      settingValue: editValue,
      description: setting.description,
    });
  };

  return (
    <Box>
      {maintenanceMode && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Platform is in maintenance mode — users may experience limited access.
        </Alert>
      )}

      <Typography variant="h4" fontWeight={700} mb={3}>Platform Settings</Typography>

      {isLoading ? (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={52} variant="rectangular" sx={{ borderRadius: 1 }} />)}
        </Stack>
      ) : settings.length === 0 ? (
        <Typography color="text.secondary">
          No settings configured. Settings are auto-created by the backend on first run.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Key</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {settings.map((setting: PlatformSetting) => (
                <TableRow key={setting.settingKey} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" color="primary.main">
                      {setting.settingKey}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {editingKey === setting.settingKey ? (
                      <TextField
                        size="small"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        sx={{ width: 240 }}
                        autoFocus
                      />
                    ) : (
                      <Typography variant="body2">{setting.settingValue}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{setting.description}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    {editingKey === setting.settingKey ? (
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleSave(setting)}
                          disabled={updateMutation.isPending}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setEditingKey(null)}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => { setEditingKey(setting.settingKey); setEditValue(setting.settingValue); }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
