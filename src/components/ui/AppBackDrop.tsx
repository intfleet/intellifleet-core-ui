import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';


const styles = {
    backdrop: {
        zIndex: 1,
        color: '#fff',
    },
}
/*
need to use based on component
zIndex: {
    appBar: 1100
    drawer: 1200
    mobileStepper: 1000
    modal: 1300             //used for dialog
    snackbar: 1400
    speedDial: 1050
    tooltip: 1500
}
*/
const AppBackDrop = React.forwardRef(({ }, ref) => {

    const [open, setOpen] = React.useState(false);

    React.useImperativeHandle(ref, () => ({
        handleBackDrop: setOpen,
    }));

    const handleClose = () => {
        setOpen(false);
    };
    const handleToggle = () => {
        setOpen(!open);
    };

    return <div>
        <Backdrop style={styles.backdrop} open={open} onClick={handleClose} invisible={false}>
            <CircularProgress color="inherit" />
        </Backdrop>
    </div>
});

export default AppBackDrop;