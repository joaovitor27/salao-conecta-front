import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from 'next-themes';
import { ChakraProvider } from '@chakra-ui/react';
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <ThemeProvider attribute={'class'} disableTransitionOnChange>
        <App />
      </ThemeProvider>
    </ChakraProvider>
  </StrictMode>
);
