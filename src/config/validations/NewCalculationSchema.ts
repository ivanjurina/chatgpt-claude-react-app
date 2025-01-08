import * as Yup from 'yup';

export default Yup.object({
  name: Yup.string()
    .trim()
    .matches(/^[a-zA-Z0-9 ]*$/, 'Name can only contain letters, numbers, and spaces')
    .required('Name is required')
    .max(255, 'Max 255 characters'),
});
