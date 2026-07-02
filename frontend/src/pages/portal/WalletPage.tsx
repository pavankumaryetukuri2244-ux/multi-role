import { Box, Typography, Card, CardContent, Grid2, Button, List, ListItem, ListItemText, Chip, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { formatDate, formatCurrency } from '@/utils/formatters';

const TRANSACTIONS = [
  { id: 1, desc: 'Order payment #ORD-101', amount: -89.99, date: new Date(Date.now()-86400000*2).toISOString() },
  { id: 2, desc: 'Wallet top-up', amount: 200.00, date: new Date(Date.now()-86400000*3).toISOString() },
  { id: 3, desc: 'Refund #ORD-098', amount: 45.00, date: new Date(Date.now()-86400000*5).toISOString() },
  { id: 4, desc: 'Order payment #ORD-095', amount: -124.50, date: new Date(Date.now()-86400000*7).toISOString() },
];
const BALANCE = 235.50;

export default function PortalWalletPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Wallet</Typography>
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#fff' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" mb={1}>Available Balance</Typography>
              <Typography variant="h2" fontWeight={700}>{formatCurrency(BALANCE)}</Typography>
              <Button variant="outlined" startIcon={<AddIcon />} sx={{ mt: 3, color: '#fff', borderColor: 'rgba(255,255,255,0.6)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                Top Up
              </Button>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Transaction History</Typography>
              <List dense>
                {TRANSACTIONS.map(t => (
                  <ListItem key={t.id} divider secondaryAction={
                    <Chip label={t.amount > 0 ? `+${formatCurrency(t.amount)}` : formatCurrency(t.amount)} color={t.amount > 0 ? 'success' : 'default'} size="small" />
                  }>
                    <ListItemText primary={t.desc} secondary={formatDate(t.date)} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}
