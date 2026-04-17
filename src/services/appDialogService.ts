import React from 'react';



const getContent = (props) => {
    let content = null;
    if(props.type === "FORM" || props.type === "MULTIPART-FORM") {
        //content = getForm(props);
    }

    return content;
}

const getForm = (props) => {
    let { object, ...others } = props;

    // return <AppForm key={object} object={object} {...others}/>
}



const AppDialogService = {
    getContent
}

export default AppDialogService;