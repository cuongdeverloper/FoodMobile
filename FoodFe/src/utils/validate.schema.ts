import * as Yup from 'yup';

export const LoginSchema = Yup.object().shape({
  userLogin: Yup.string()
    .matches(/^[a-zA-Z0-9_]{3,30}$/, 'Định dạng UserLogin không hợp lệ')
    .required('UserLogin không được để trống'),

  password: Yup.string()
    .min(6, 'Password phải > 6 ký tự')
    .max(30, 'Password phải < 30 ký tự')
    .required('Password không được để trống'),
});

export const SignUpSchema = Yup.object().shape({
  username: Yup.string()
    .matches(/^[a-zA-Z0-9_]{3,30}$/, 'Định dạng username không hợp lệ')
    .required('Username không được để trống'),

  userLogin: Yup.string()
    .matches(/^[a-zA-Z0-9_]{3,30}$/, 'Định dạng UserLogin không hợp lệ')
    .required('UserLogin không được để trống'),

  password: Yup.string()
    .min(6, 'Password phải > 6 ký tự')
    .max(30, 'Password phải < 30 ký tự')
    .required('Password không được để trống'),
});
