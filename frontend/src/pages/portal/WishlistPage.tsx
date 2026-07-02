import { useState } from 'react';
import { Box, Typography, Grid2, Card, CardContent, CardActions, Button, Chip, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { EmptyState } from '@/components/common';

interface WishItem { id: number; name: string; price: string; category: string; }
const INITIAL: WishItem[] = [
  { id: 1, name: 'Wireless Headphones', price: '$89.99', category: 'Electronics' },
  { id: 2, name: 'Cotton T-Shirt', price: '$24.99', category: 'Clothing' },
  { id: 3, name: 'Artisan Coffee Blend', price: '$18.99', category: 'Food' },
];

export default function PortalWishlistPage() {
  const [items, setItems] = useState<WishItem[]>(INITIAL);
  const remove = (id: number) => setItems(p => p.filter(x => x.id !== id));

  if (items.length === 0) return <EmptyState title="Your wishlist is empty" description="Browse products and save items here" />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Wishlist</Typography>
      <Grid2 container spacing={3}>
        {items.map(item => (
          <Grid2 key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Box sx={{ height: 120, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }} />
                <Typography variant="subtitle1" fontWeight={600}>{item.name}</Typography>
                <Chip label={item.category} size="small" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="h6" color="primary" fontWeight={700} mt={1}>{item.price}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" variant="contained">Add to Cart</Button>
                <IconButton size="small" color="error" onClick={() => remove(item.id)}><FavoriteIcon /></IconButton>
              </CardActions>
            </Card>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
}
