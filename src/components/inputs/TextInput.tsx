import { TextField } from '@mui/material';
import { Control, useController } from 'react-hook-form';

interface Props {
  control: Control<any>;
  name: string;
  label: string;
}

export default function TextInput({ control, name, label }: Props) {
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ control, name });

  return (
    <TextField
      error={error && true}
      value={value}
      onChange={onChange}
      variant="outlined"
      fullWidth
      label={label}
      helperText={error && error?.message}
    />
  );
}
