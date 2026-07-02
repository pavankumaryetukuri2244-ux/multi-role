import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface FormModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({
  open,
  title,
  onClose,
  children,
  maxWidth = 'sm',
  loading = false,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      {loading && (
        <LinearProgress
          sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}
        />
      )}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pr: 1,
        }}
      >
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          disabled={loading}
          sx={{ ml: 1 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 3, px: 3 }}>{children}</DialogContent>
    </Dialog>
  );
};

export default FormModal;
