import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="auth-shell">
      <Outlet />
    </div>
  )
}

export default AuthLayout
