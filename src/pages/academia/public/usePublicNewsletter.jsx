import { useState } from 'react';
import './public-page-state.css';

const NEWSLETTER_NOTICE =
  'Newsletter signup is not available yet. Contact support@gonaraza.com for updates.';

export function usePublicNewsletter() {
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setEmail('');
    setNotice(NEWSLETTER_NOTICE);
  };

  return { email, setEmail, notice, handleSubmit };
}

export function PublicNewsletterNotice({ message }) {
  if (!message) return null;

  return (
    <p className="public-newsletter-notice" role="status">
      {message}
    </p>
  );
}
