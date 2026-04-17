export default {
    palette: {},
    typography: {
        fontSize: 14, // Base font size in px (default is 14) // sets base 1rem = 14px
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",

        // Optional: Customize specific heading or text elements
        h1: { fontSize: 40, fontWeight: 700 },
        h2: { fontSize: '1.5rem', fontWeight: 600 },
        h3: { fontSize: '1.25rem', fontWeight: 500 },
        body1: { fontSize: 14 },
        body2: { fontSize: '0.875rem' },
        body3: { fontSize: '0.775rem' },
        button: { fontSize: '0.875rem', textTransform: 'none' },
    },
    components: {
        // Name of the component
        defaultProps: {},
        MuiButton: {  },
        MuiTextField: { },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    // background: "red",
                    height: 42,
                    padding: "0px 10px",
                },
            }
        },
        // add more MUI components here
    },
}