import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import acStat1Icon from '../../../assets/icons/ac-stat1.svg';
import acMailIcon from '../../../assets/icons/ac-mail.png';
import acUsIcon from '../../../assets/icons/ac-us.svg';
import acShareIcon from '../../../assets/icons/ac-share.svg';
import acNonIcon from '../../../assets/icons/ac-non.svg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import certificateImage from '../../../assets/imgs/certificateimage.jpeg';

import './certificates.css';
import { PublicEmptyState, PublicLoadError, PublicLoading } from './PublicPageState';
import { PublicNewsletterNotice, usePublicNewsletter } from './usePublicNewsletter.jsx';
import { usePublicPageTitle } from './usePublicPageTitle.jsx';
import { sharePublicPage } from './publicShare';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const extractCourseList = (body) => {
  if (Array.isArray(body?.data?.data)) return body.data.data;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body)) return body;
  return [];
};

function AcademiaCertificates() {
  usePublicPageTitle('Certificates');
  const navigate = useNavigate();

  const [certificateCourses, setCertificateCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const [verifyInput, setVerifyInput] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  const { email: newsletterEmail, setEmail: setNewsletterEmail, notice: newsletterNotice, handleSubmit: handleNewsletterSubmit } = usePublicNewsletter();

  useEffect(() => {
    let mounted = true;

    const fetchCertificateCourses = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/public/popular?limit=12`);
        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(body?.message || 'Failed to load certificate courses.');
        }

        if (!mounted) return;

        setCertificateCourses(
          extractCourseList(body).map((item, idx) => ({
            id: item.id || idx,
            title: item.title || item.name || 'Course',
            instructor: item.instructor_name || 'Academia instructor',
            thumbnail: item.thumbnail_url || item.thumbnail || certificateImage,
          })),
        );
      } catch (error) {
        if (mounted) {
          setCertificateCourses([]);
          setFetchError(error.message || 'Failed to load certificate courses.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCertificateCourses();

    return () => {
      mounted = false;
    };
  }, [retryKey]);

  const resolveImage = (imgSrc) => {
    if (!imgSrc) return certificateImage;
    if (imgSrc.startsWith('http')) return imgSrc;
    return `${API_BASE_URL}${imgSrc}`;
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    const certificateNumber = verifyInput.trim();
    if (!certificateNumber) {
      setVerifyError('Enter a certificate number to verify.');
      setVerifyResult(null);
      return;
    }

    setVerifyLoading(true);
    setVerifyError('');
    setVerifyResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/certificates/verify/${encodeURIComponent(certificateNumber)}`);
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body?.message || body?.error?.message || 'Verification failed.');
      }

      const payload = body?.data ?? body;
      setVerifyResult(payload);
    } catch (error) {
      setVerifyError(error.message || 'Could not verify this certificate.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleShareCourse = async (event, course) => {
    event.stopPropagation();
    await sharePublicPage({
      title: course.title,
      url: `${window.location.origin}/academia/course-details?id=${course.id}`,
    });
  };

  return (
    <div className="academia-certificates-page">

      <section className="hero-sec">
        <div className="hero-sec-inner">
          <div className="hsi-contents">
            <div className="hsi-contents-h">
              <h1>Certificates</h1>
            </div>
            <div className="hsi-contents-b">
              <p>
                Complete summative assessments to earn verifiable certificates. Sign in to track yours,
                or verify a certificate number below.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="certificates-verify-sec">
        <div className="certificates-verify-card">
          <h2>Verify a certificate</h2>
          <p>Enter the certificate number from a learner&apos;s credential to check whether it is valid.</p>
          <form className="certificates-verify-form" onSubmit={handleVerify}>
            <input
              type="text"
              value={verifyInput}
              onChange={(event) => setVerifyInput(event.target.value)}
              placeholder="Certificate number"
              aria-label="Certificate number"
            />
            <button type="submit" disabled={verifyLoading}>
              {verifyLoading ? 'Verifying…' : 'Verify'}
            </button>
          </form>
          {verifyError ? <p className="certificates-verify-message is-error">{verifyError}</p> : null}
          {verifyResult ? (
            <div className={`certificates-verify-message ${verifyResult.valid ? 'is-success' : 'is-warning'}`}>
              {verifyResult.valid ? (
                <>
                  <strong>Valid certificate</strong>
                  <span>
                    {verifyResult.course_title || verifyResult.courseTitle || 'Course certificate'}
                    {verifyResult.student_name || verifyResult.studentName
                      ? ` — ${verifyResult.student_name || verifyResult.studentName}`
                      : ''}
                  </span>
                </>
              ) : (
                <>
                  <strong>Not found</strong>
                  <span>{verifyResult.reason || 'This certificate number could not be verified.'}</span>
                </>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {!loading && !fetchError && certificateCourses.length > 0 ? (
        <section className="stats-sec">
          <div className="stats-sec-item">
            <div>
              <img src={acStat1Icon} alt="" />
            </div>
            <div>
              <h5>{certificateCourses.length}</h5>
              <p>Courses with certificates</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="new-content">
        <h2>Certificate pathways</h2>
        <div className="new-content-l">
          <img src={acMailIcon} alt="" />
          <div>
            <h6>Your certificates</h6>
            <p>Sign in to view and download earned certificates</p>
          </div>
        </div>
      </section>

      <section className="main-content">
        <div className="main-content-inner">
          {loading ? (
            <PublicLoading message="Loading certificate courses…" />
          ) : fetchError ? (
            <div className="public-page-state--inline" style={{ width: '100%' }}>
              <PublicLoadError
                title="Could not load certificates"
                message={fetchError}
                onRetry={() => setRetryKey((key) => key + 1)}
                backTo="/academia/index"
                backLabel="Back to home"
              />
            </div>
          ) : certificateCourses.length === 0 ? (
            <div className="public-page-state--inline" style={{ width: '100%' }}>
              <PublicEmptyState
                title="No certificate courses yet"
                message="Published courses with summative assessments will appear here once they are available."
                actionLabel="Browse courses"
                actionTo="/academia/courses"
              />
            </div>
          ) : (
            certificateCourses.map((course) => (
              <div
                key={course.id}
                className="reward certificate-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/academia/course-details?id=${course.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    navigate(`/academia/course-details?id=${course.id}`);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="reward-img">
                  <img
                    src={resolveImage(course.thumbnail)}
                    alt={course.title}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </div>
                <div className="reward-text">
                  <h4>{course.title}</h4>
                  <div className="reward-footer">
                    <p>
                      <img src={acUsIcon} alt="" />
                      <span>{course.instructor}</span>
                    </p>
                    <button type="button" onClick={(event) => handleShareCourse(event, course)} aria-label="Share course">
                      <img src={acShareIcon} alt="" />
                    </button>
                  </div>
                  <p className="certificate-card-badge">Earn certificate</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="vid-sec">
        <div className="main-content-grid">
          <div className="story-thumbnail">
            <img
              src={certificateImage}
              alt="Gonaraza Academia certificate"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
            />
          </div>

          <div className="main-content-grid-l">
            <div className="watch-content">
              <h2>Earn and manage certificates</h2>
              <p>
                Pass the summative assessment in a course to claim your certificate. Learners can download
                approved certificates from their dashboard after HOA review.
              </p>
            </div>

            <div className="watch-cta">
              <div className="watch-cta-l">
                <div className="watch-cta-stack">
                  <div className="watch-cta-thumb main-thumb">
                    <img src={certificateImage} alt="Certificate" />
                  </div>
                </div>
              </div>
              <div className="watch-cta-r">
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem('redirectAfterLogin', '/academia/learner/certificates');
                    navigate('/academia/auth/signin');
                  }}
                >
                  <img src={acNonIcon} alt="" />
                  <span>My certificates</span>
                </button>
                <button type="button" onClick={() => navigate('/academia/courses')}>
                  <img src={acNonIcon} alt="" />
                  <span>Browse courses</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter-sec">
        <div className="newsletter-sec-l">
          <h3>Newsletter</h3>
          <p>Product updates will be announced here when newsletter subscriptions open.</p>
        </div>
        <div className="newsletter-sec-r">
          <form onSubmit={handleNewsletterSubmit}>
            <img src={acSmsIcon} alt="" className="ac-sms" />
            <input
              type="email"
              placeholder="Enter email address"
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              required
            />
            <button type="submit">
              <img src={acSendIcon} alt="Submit" />
            </button>
          </form>
          <PublicNewsletterNotice message={newsletterNotice} />
        </div>
      </section>
    </div>
  );
}

export default AcademiaCertificates;
