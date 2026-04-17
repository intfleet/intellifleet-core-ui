import { createTheme } from '@mui/material/styles';
import style from '../styles/style';

const theme = createTheme({
    ...style,
    //we can override color here 
});

export default theme;