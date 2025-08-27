'use client';
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    red: {
      300: '#f5b795',
      500: '#f59e6e',
    },
    gray: {
      500: '#978e8b',
    },
  },
  styles: {
    global: {
      body: {
        color: '#635b5b',
        background: '#F2DBC2',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      },
    },
  },
});

export default theme;
