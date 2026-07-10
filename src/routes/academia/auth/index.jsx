import { Route } from 'react-router-dom';
import AcademiaSignIn from '../../../pages/academia/auth/signin';
import AcademiaSignUp from '../../../pages/academia/auth/signup';
import AcademiaForgotPassword from '../../../pages/academia/auth/forgot-password';
import AcademiaResetPassword from '../../../pages/academia/auth/reset-password';
import AcademiaCheckEmail from '../../../pages/academia/auth/check-email';
import AcademiaCheckEmailSingle from '../../../pages/academia/auth/check-email-single';
import AcademiaPasswordChanged from '../../../pages/academia/auth/password-changed';
import AcademiaVerify from '../../../pages/academia/auth/verify';
import AcademiaGoogleSuccess from '../../../pages/academia/auth/google-success';

export default function AcademiaAuthRoutes() {
  return (
    <>
      <Route index element={<AcademiaSignIn />} />
      <Route path="signin" element={<AcademiaSignIn />} />
      <Route path="signup" element={<AcademiaSignUp />} />
      <Route path="forgot-password" element={<AcademiaForgotPassword />} />
      <Route path="reset-password" element={<AcademiaResetPassword />} />
      <Route path="check-email" element={<AcademiaCheckEmail />} />
      <Route path="check-email-single" element={<AcademiaCheckEmailSingle />} />
      <Route path="password-changed" element={<AcademiaPasswordChanged />} />
      <Route path="verify" element={<AcademiaVerify />} />
      <Route path="google/success" element={<AcademiaGoogleSuccess />} />
    </>
  );
}
