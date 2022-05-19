import { Box } from '@mui/material';
import React from 'react';

const Pagenumbers = ({onClick,index}:any) => {
    return (
        <Box
        onClick={onClick}
      sx={{backgroundColor:"var(--indigo)" 
      ,height:"50px",width:"50px",borderRadius:"50%",
      display:"flex",alignItems:"center",justifyContent:"center"}}>{index}</Box>
    );
};

export default Pagenumbers;