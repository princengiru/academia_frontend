function AuthPlaceholder({ title, description }) {
  return (
    <div className="auth-placeholder-page">
      <div className="auth-placeholder-card">
        <p className="auth-placeholder-kicker">Academia Auth</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default AuthPlaceholder;
