import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi } from 'vitest';
import theme from '@/theme';
import { PasswordField } from '@/components/PasswordField';

function ControlledPasswordField({ onChangeSpy }: { onChangeSpy: (val: string) => void }) {
  const [password, setPassword] = useState('');
  return (
    <ThemeProvider theme={theme}>
      <PasswordField
        password={password}
        setPassword={(val) => {
          setPassword(val);
          onChangeSpy(val);
        }}
        label="Senha de Acesso"
        placeholder="Digite sua senha"
      />
    </ThemeProvider>
  );
}

describe('PasswordField Component', () => {
  it('renders password input hidden by default and updates value on typing', async () => {
    const user = userEvent.setup();
    const handlePasswordChange = vi.fn<(val: string) => void>();

    render(<ControlledPasswordField onChangeSpy={handlePasswordChange} />);

    const input = screen.getByPlaceholderText('Digite sua senha');
    expect(input).toHaveAttribute('type', 'password');

    await user.type(input, 'Segredo123');
    expect(handlePasswordChange).toHaveBeenLastCalledWith('Segredo123');
    expect(input).toHaveValue('Segredo123');
  });

  it('toggles password visibility when clicking the adornment icon button', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider theme={theme}>
        <PasswordField password="MyPassword" setPassword={vi.fn()} />
      </ThemeProvider>,
    );

    const input = screen.getByPlaceholderText('Sua Senha');
    expect(input).toHaveAttribute('type', 'password');

    const toggleShowButton = screen.getByRole('button', { name: /exibir senha/i });
    await user.click(toggleShowButton);
    expect(input).toHaveAttribute('type', 'text');

    const toggleHideButton = screen.getByRole('button', { name: /ocultar senha/i });
    await user.click(toggleHideButton);
    expect(input).toHaveAttribute('type', 'password');
  });
});
