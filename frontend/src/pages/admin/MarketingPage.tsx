import { useState } from 'react';
import { Box, Typography, Stack, Chip, Button, Grid2, Card, CardContent, CardActions, TextField } from '@mui/material';
import { FormModal } from '@/components/common';

interface Campaign { id: number; name: string; type: string; status: string; reach: number; }
const MOCK_CAMPAIGNS: Campaign[] = [];

export default function AdminMarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', status: 'Draft' });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4" fontWeight={700}>Marketing</Typography>
        </Stack>
        <Button variant="contained" onClick={() => { setForm({ name:'',type:'Email',status:'Draft' }); setCreateOpen(true); }}>Create Campaign</Button>
      </Stack>
      <Grid2 container spacing={3}>
        {campaigns.map(c => (
          <Grid2 key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">{c.name}</Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Chip label={c.type} size="small" variant="outlined" />
                  <Chip label={c.status} size="small" color={c.status==='Active'?'success':c.status==='Draft'?'default':'info'} />
                </Stack>
                {c.reach > 0 && <Typography variant="body2" color="text.secondary" mt={1}>Reached: {c.reach.toLocaleString()}</Typography>}
              </CardContent>
              <CardActions>
                <Button size="small">Edit</Button>
                <Button size="small" color="error" onClick={() => setCampaigns(p => p.filter(x => x.id !== c.id))}>Delete</Button>
              </CardActions>
            </Card>
          </Grid2>
        ))}
      </Grid2>
      <FormModal open={createOpen} title="Create Campaign" onClose={() => setCreateOpen(false)}>
        <TextField fullWidth label="Campaign Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} sx={{mb:2}} />
        <TextField fullWidth label="Type (Email/Social/Push)" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} sx={{mb:2}} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setCampaigns(p => [...p, { ...form, id: Date.now(), reach: 0 }]); setCreateOpen(false); }}>Create</Button>
        </Stack>
      </FormModal>
    </Box>
  );
}
