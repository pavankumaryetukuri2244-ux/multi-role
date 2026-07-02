import { Box, Typography, Card, CardContent, Grid2, Chip, Stack, Button, Divider, TextField, InputAdornment } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from 'react';
import { motion } from 'framer-motion';

const TIERS = [
  { name: 'Bronze', minPoints: 0, color: '#CD7F32' },
  { name: 'Silver', minPoints: 500, color: '#C0C0C0' },
  { name: 'Gold', minPoints: 1000, color: '#FFD700' },
  { name: 'Platinum', minPoints: 2500, color: '#E5E4E2' },
];

export default function PortalRewardsPage() {
  const points = 750;
  const referralCode = 'REF-USR42X';
  const [copied, setCopied] = useState(false);
  const tier = TIERS.filter(t => points >= t.minPoints).pop()!;
  const nextTier = TIERS.find(t => t.minPoints > points);

  const copy = () => { navigator.clipboard.writeText(referralCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Rewards</Typography>
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)', color: '#fff' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <StarIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h3" fontWeight={700}>{points.toLocaleString()}</Typography>
                <Typography variant="body1">Loyalty Points</Typography>
                <Chip label={tier.name} sx={{ mt: 2, bgcolor: tier.color, color: '#000', fontWeight: 700 }} />
                {nextTier && <Typography variant="caption" display="block" mt={1} sx={{ opacity: 0.85 }}>{nextTier.minPoints - points} points to {nextTier.name}</Typography>}
              </CardContent>
            </Card>
          </motion.div>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Membership Tiers</Typography>
              <Stack spacing={1}>
                {TIERS.map(t => (
                  <Stack key={t.name} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: t.color }} />
                      <Typography variant="body2">{t.name}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{t.minPoints}+ pts</Typography>
                    {points >= t.minPoints && <Chip label="Current" size="small" color="primary" />}
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Referral Program</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>Share your code and earn 100 points per referral</Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField fullWidth label="Your Referral Code" value={referralCode} InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end"><Button size="small" onClick={copy} startIcon={<ContentCopyIcon />}>{copied ? 'Copied!' : 'Copy'}</Button></InputAdornment> }} />
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}
