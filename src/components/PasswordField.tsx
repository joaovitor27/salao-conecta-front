import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import React from 'react';
import LockIcon from '@mui/icons-material/Lock';
import theme from '@/theme.tsx';

interface PasswordFieldProps {
  password: string;
  setPassword: (password: string) => void;
  label?: string;
  placeholder?: string;
}

export function PasswordField({ password, setPassword, label = 'Senha', placeholder='Sua Senha' }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  return (
    <FormControl variant="outlined">
      <InputLabel htmlFor="outlined-adornment-password">{label}</InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? 'text' : 'password'}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              onMouseUp={handleMouseUpPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        fullWidth
        startAdornment={
          <InputAdornment position={'start'}>
            <LockIcon sx={{ color: theme.palette.custom.muted.foreground }} />
          </InputAdornment>
        }
        value={password}
        label={label}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={placeholder}
      />
    </FormControl>
  );
}
