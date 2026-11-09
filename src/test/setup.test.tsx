import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/Button';
import theme from '@/theme';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Test Environment & Button Component', () => {
  it('renders the button text and responds to click events', () => {
    const handleClick = vi.fn();

    renderWithTheme(<Button onClick={handleClick}>Agendar Agora</Button>);

    const buttonElement = screen.getByRole('button', { name: /agendar agora/i });
    expect(buttonElement).toBeInTheDocument();

    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('prevents interaction when the button is disabled', () => {
    const handleClick = vi.fn();

    renderWithTheme(
      <Button disabled onClick={handleClick}>
        Indisponível
      </Button>,
    );

    const buttonElement = screen.getByRole('button', { name: /indisponível/i });
    expect(buttonElement).toBeDisabled();
  });
});
