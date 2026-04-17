
import '../assets/styles/App.css';
import React, { useEffect } from 'react';
import AppRouter from './appRouter';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../assets/theme/theme'
import { SnackbarProvider, useSnackbar } from 'notistack';
import { AppContextProvider } from '../app/context/appContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { CssBaseline } from '@mui/material';
import LocalStorageHandler from '@/utils/localStorageHandler';
// import {useEffectOnce} from './core/custom-hook';

const App = () => {

  useEffect(() => {
    //creating index while app initialized. If not found then creates.
    LocalStorageHandler.createIndex();
  }, []);


  return <ThemeProvider theme={theme}>
    <CssBaseline />
    <div className='root-div'>
      <SnackbarProvider maxSnack={3}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AppContextProvider value={{}}>
            <AppRouter />
          </AppContextProvider>
        </LocalizationProvider>
      </SnackbarProvider>
    </div>
  </ThemeProvider>;
}

export default App;
