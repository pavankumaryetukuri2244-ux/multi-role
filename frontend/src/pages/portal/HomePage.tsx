import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid2, Card, CardContent, List, ListItem,
  ListItemText, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Snackbar, Alert, CircularProgress,
  Stack, Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { formatRelativeTime, formatCurrency } from '@/utils/formatters';
import { getUserProducts, placeUserOrder } from '@/services/product.service';
import type { Product } from '@/services/types/product.types';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ActivityItem {
  id: string | number;
  action: string;
  time: string;
}

const DEFAULT_GRADIENTS = [
  'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
  'linear-gradient(135deg, #4E65FF 0%, #92EFFD 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'linear-gradient(135deg, #F40076 0%, #DF98FA 100%)',
];

export default function PortalHomePage() {
  const { firstName } = useSelector((state: RootState) => state.auth);
  const { companyName, bannerUrl } = useSelector((state: RootState) => state.tenant);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Purchase Dialog state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  // Notification state
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Recent activity logs
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: 'act-1', action: 'Joined ' + (companyName ?? 'tenant portal'), time: new Date(Date.now() - 3600000 * 24).toISOString() },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getUserProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load products', err);
      setError('Could not load products. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenBuy = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleCloseBuy = () => {
    if (!purchasing) {
      setSelectedProduct(null);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct) return;
    if (quantity <= 0 || quantity > selectedProduct.stock) {
      setToast({
        open: true,
        message: `Please enter a quantity between 1 and ${selectedProduct.stock}`,
        severity: 'error',
      });
      return;
    }

    try {
      setPurchasing(true);
      const order = await placeUserOrder({
        productId: selectedProduct.id,
        quantity: quantity,
      });

      setToast({
        open: true,
        message: `Successfully purchased ${quantity} x ${selectedProduct.name}!`,
        severity: 'success',
      });

      // Add to activities
      setActivities(prev => [
        {
          id: order.id,
          action: `Purchased ${quantity} x ${selectedProduct.name} for ${formatCurrency(order.totalPrice)}`,
          time: new Date().toISOString(),
        },
        ...prev,
      ]);

      // Refresh product list (updated stock levels)
      await loadData();
      setSelectedProduct(null);
    } catch (err: any) {
      console.error('Purchase failed', err);
      setToast({
        open: true,
        message: err.response?.data?.message || 'Purchase failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Box>
      {/* Hero banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{
          height: 200, borderRadius: 3, mb: 4,
          background: bannerUrl ? `url(${bannerUrl}) center/cover` : 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
          display: 'flex', alignItems: 'center', px: 4,
          boxShadow: '0 8px 32px rgba(99,102,241,0.15)',
        }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#fff' }}>
              Welcome back, {firstName ?? 'User'}!
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5, fontWeight: 500 }}>
              Storefront: {companyName ?? 'Your Portal'}
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>
      )}

      <Grid2 container spacing={4}>
        {/* Products section */}
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight={700}>Available Products</Typography>
            <Button size="small" variant="outlined" onClick={loadData} disabled={loading}>Refresh</Button>
          </Stack>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6, px: 2, border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
              <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} mb={1}>No Products Found</Typography>
              <Typography variant="body2" color="text.secondary">This business hasn't added any products to buy yet.</Typography>
            </Card>
          ) : (
            <Grid2 container spacing={3}>
              {products.map((p, idx) => (
                <Grid2 key={p.id} size={{ xs: 12, sm: 6 }}>
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                    }
                  }}>
                    {/* Color block header as product image placeholder */}
                    <Box sx={{
                      height: 120,
                      background: DEFAULT_GRADIENTS[idx % DEFAULT_GRADIENTS.length],
                      borderTopLeftRadius: 'inherit',
                      borderTopRightRadius: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <ShoppingCartIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 40 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>{p.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        minHeight: 40,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2
                      }}>
                        {p.description || 'No description provided.'}
                      </Typography>
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mt="auto">
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Price</Typography>
                          <Typography variant="h6" color="primary" fontWeight={700}>
                            {formatCurrency(p.price)}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="text.secondary" display="block">In Stock</Typography>
                          <Chip 
                            label={p.stock > 0 ? `${p.stock} units` : 'Out of stock'} 
                            color={p.stock === 0 ? 'error' : p.stock < 10 ? 'warning' : 'success'} 
                            size="small" 
                          />
                        </Box>
                      </Stack>

                      <Button
                        variant="contained"
                        fullWidth
                        disabled={p.stock === 0}
                        onClick={() => handleOpenBuy(p)}
                        sx={{ mt: 2, fontWeight: 600 }}
                        startIcon={<ShoppingCartIcon />}
                      >
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>
                </Grid2>
              ))}
            </Grid2>
          )}
        </Grid2>

        {/* Activity feed */}
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Typography variant="h5" fontWeight={700} mb={2}>Recent Activities</Typography>
          <Card sx={{ borderRadius: 3 }}>
            <List sx={{ p: 0 }}>
              {activities.map((a, index) => (
                <div key={a.id}>
                  {index > 0 && <Divider />}
                  <ListItem sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          {a.action}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {formatRelativeTime(a.time)}
                        </Typography>
                      }
                    />
                  </ListItem>
                </div>
              ))}
            </List>
          </Card>
        </Grid2>
      </Grid2>

      {/* Buy dialog */}
      <Dialog open={!!selectedProduct} onClose={handleCloseBuy} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Confirm Purchase</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>{selectedProduct.name}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedProduct.description}</Typography>
              
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Unit Price:</Typography>
                <Typography variant="body2" fontWeight={700}>{formatCurrency(selectedProduct.price)}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Available Stock:</Typography>
                <Typography variant="body2" fontWeight={700}>{selectedProduct.stock} units</Typography>
              </Stack>

              <TextField
                label="Quantity"
                type="number"
                fullWidth
                slotProps={{
                  htmlInput: { min: 1, max: selectedProduct.stock }
                }}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Math.min(selectedProduct.stock, Number(e.target.value) || 1)))}
                helperText={`Total price: ${formatCurrency(selectedProduct.price * quantity)}`}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCloseBuy} disabled={purchasing}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleConfirmPurchase} 
            disabled={purchasing}
            startIcon={purchasing ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            Confirm & Pay
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast(p => ({ ...p, open: false }))} severity={toast.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
