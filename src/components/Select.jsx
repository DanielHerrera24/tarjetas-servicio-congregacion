import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function BasicSelect() {
  const [congre, setCongre] = React.useState('');

  const handleChange = (event) => {
    setCongre(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Congregación</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={congre}
          label="Congregación"
          onChange={handleChange}
        >
          <MenuItem value={1}>Sur</MenuItem>
          <MenuItem value={2}>Primavera</MenuItem>
          <MenuItem value={3}>Del Valle</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
