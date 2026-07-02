import { useRef, useState, useCallback, type ClipboardEvent, type KeyboardEvent, type ChangeEvent } from 'react';
import { Box, Card, CardContent, Button, Typography, Link as MuiLink, TextField } from '@mui/material';
import { motion } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────

const OTP_LENGTH = 6;

// ─── Component ────────────────────────────────────────────────────────────────

export default function OtpPage() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(OTP_LENGTH).fill(null));

  const focusAt = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(OTP_LENGTH - 1, index));
    inputRefs.current[clamped]?.focus();
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Accept only the last typed digit
      const char = raw.replace(/\D/g, '').slice(-1);
      if (!char) return;

      setDigits((prev) => {
        const next = [...prev];
        next[index] = char;
        return next;
      });

      // Advance focus to next input
      if (index < OTP_LENGTH - 1) {
        focusAt(index + 1);
      }
    },
    [focusAt]
  );

  const handleKeyDown = useCallback(
    (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (digits[index] !== '') {
          // Clear current field
          setDigits((prev) => {
            const next = [...prev];
            next[index] = '';
            return next;
          });
        } else if (index > 0) {
          // Move back to previous field
          focusAt(index - 1);
          setDigits((prev) => {
            const next = [...prev];
            next[index - 1] = '';
            return next;
          });
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        focusAt(index - 1);
      } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
        focusAt(index + 1);
      }
    },
    [digits, focusAt]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, OTP_LENGTH);
      if (!pasted) return;

      setDigits((prev) => {
        const next = [...prev];
        for (let i = 0; i < pasted.length; i++) {
          next[i] = pasted[i];
        }
        return next;
      });

      // Focus the next empty slot, or the last slot if all filled
      const nextEmpty = pasted.length < OTP_LENGTH ? pasted.length : OTP_LENGTH - 1;
      focusAt(nextEmpty);
    },
    [focusAt]
  );

  const handleVerify = () => {
    const code = digits.join('');
    // TODO: wire up to actual OTP verification service
    console.log('Verifying OTP:', code);
  };

  const handleResend = () => {
    // TODO: wire up to resend OTP service
    setDigits(Array(OTP_LENGTH).fill(''));
    focusAt(0);
  };

  const isComplete = digits.every((d) => d !== '');

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <Card>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              textAlign="center"
            >
              Verify your email
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              mb={4}
            >
              Enter the 6-digit code we sent to your email address.
            </Typography>

            {/* OTP inputs */}
            <Box
              display="flex"
              gap={1.5}
              justifyContent="center"
              mb={4}
              onPaste={handlePaste}
            >
              {digits.map((digit, index) => (
                <TextField
                  key={index}
                  value={digit}
                  onChange={handleChange(index)}
                  onKeyDown={handleKeyDown(index)}
                  inputRef={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  inputProps={{
                    maxLength: 1,
                    style: {
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      padding: '12px 0',
                    },
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    'aria-label': `OTP digit ${index + 1}`,
                  }}
                  sx={{
                    width: 52,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                    },
                  }}
                  autoFocus={index === 0}
                />
              ))}
            </Box>

            {/* Verify button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={!isComplete}
              onClick={handleVerify}
              sx={{ py: 1.5, mb: 2 }}
            >
              Verify Code
            </Button>

            {/* Resend */}
            <Typography variant="body2" textAlign="center" color="text.secondary">
              Didn&apos;t receive it?{' '}
              <MuiLink
                component="button"
                underline="hover"
                onClick={handleResend}
                sx={{ cursor: 'pointer', background: 'none', border: 'none', p: 0, font: 'inherit', color: 'primary.main' }}
              >
                Resend code
              </MuiLink>
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
