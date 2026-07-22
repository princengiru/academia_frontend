import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import cert from '../../assets/icons/cert.svg';
import cert1 from '../../assets/imgs/cert1.png';
import cert2 from '../../assets/imgs/cert2.png';
import cert3 from '../../assets/imgs/cert3.png';
import part1 from '../../assets/imgs/ICT.png';
import part2 from '../../assets/imgs/ICTc.png';
import part3 from '../../assets/imgs/Nar.png';
import ribbonLogo from '../../assets/imgs/lg.png';
import ribbonQr from '../../assets/imgs/qr.png';
import linesBg from '../../assets/imgs/lines.png';
import linesCorner from '../../assets/imgs/lines1.png';
import { fetchCertificatePreviewData } from './certificateUtils';
import './certificate-print-preview.css';

const DEMO = {
  studentName: 'JEAN MARIE VIANNEY NDAHIMANA',
  courseTitle: 'Course Name',
  tutorName: 'Uwineza Marie Angeliques',
  issuedOn: '23 - AUGUST - 2026',
  downloadedBy: 'J. Ndahimana',
  validSince: '2026',
  certificateNumber: '',
};

const CERT_ASSETS = [
  cert,
  cert1,
  cert2,
  cert3,
  part1,
  part2,
  part3,
  ribbonLogo,
  ribbonQr,
  linesBg,
  linesCorner,
];

const CERT_PREVIEW_W = 1100;
const CERT_PREVIEW_H = (CERT_PREVIEW_W * 2480) / 3509;

function usePreviewScale(viewMode) {
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    if (viewMode === 'actual') {
      setScale(1);
      return;
    }

    const padX = 40;
    const padY = 140;
    const scaleW = (window.innerWidth - padX) / CERT_PREVIEW_W;
    const scaleH = (window.innerHeight - padY) / CERT_PREVIEW_H;
    setScale(Math.min(1, scaleW, scaleH));
  }, [viewMode]);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  return scale;
}

function readParam(params, key, fallback) {
  const value = params.get(key);
  return value && value.trim() ? value.trim() : fallback;
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function CertSeal({ year }) {
  return (
    <div className="cert-sheet__seal" aria-hidden="true">
      <img src={cert3} alt="" className="cert-sheet__seal-img" />
      {year ? <span className="sr-only">Valid since {year}</span> : null}
    </div>
  );
}

function SignatureBlock({ name, title }) {
  return (
    <div className="cert-sheet__signature">
      <div className="cert-sheet__signature-mark" aria-hidden="true">
        <svg viewBox="0 0 80 36" className="cert-sheet__signature-icon">
          <path d="M8 28 C18 8, 34 8, 44 20 C52 30, 62 12, 72 24" fill="none" stroke="#450468" strokeWidth="1.5" />
          <circle cx="40" cy="12" r="8" fill="none" stroke="#450468" strokeWidth="1.2" />
        </svg>
      </div>
      <div className="cert-sheet__signature-line" />
      <p className="cert-sheet__signature-name">{name}</p>
      <p className="cert-sheet__signature-title">{title}</p>
    </div>
  );
}

export default function CertificatePrintPreview() {
  const [searchParams] = useSearchParams();
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [viewMode, setViewMode] = useState('fit');
  const scale = usePreviewScale(viewMode);

  const certificateNumber = readParam(searchParams, 'number', '');

  const [data, setData] = useState({
    studentName: readParam(searchParams, 'name', DEMO.studentName),
    courseTitle: readParam(searchParams, 'course', DEMO.courseTitle),
    tutorName: readParam(searchParams, 'tutor', DEMO.tutorName),
    issuedOn: readParam(searchParams, 'issued', DEMO.issuedOn),
    downloadedBy: readParam(searchParams, 'downloaded', DEMO.downloadedBy),
    validSince: readParam(searchParams, 'valid', DEMO.validSince),
    certificateNumber: certificateNumber || DEMO.certificateNumber,
  });

  const scaledSize = useMemo(() => ({
    width: CERT_PREVIEW_W * scale,
    height: CERT_PREVIEW_H * scale,
  }), [scale]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setReady(false);
      setLoadError('');

      try {
        let previewData = {
          studentName: readParam(searchParams, 'name', DEMO.studentName),
          courseTitle: readParam(searchParams, 'course', DEMO.courseTitle),
          tutorName: readParam(searchParams, 'tutor', DEMO.tutorName),
          issuedOn: readParam(searchParams, 'issued', DEMO.issuedOn),
          downloadedBy: readParam(searchParams, 'downloaded', DEMO.downloadedBy),
          validSince: readParam(searchParams, 'valid', DEMO.validSince),
          certificateNumber: certificateNumber || DEMO.certificateNumber,
        };
        let verified = true;

        if (certificateNumber) {
          const result = await fetchCertificatePreviewData(certificateNumber);
          previewData = result.data;
          verified = result.isVerified;
        }

        const fontsReady = document.fonts?.ready
          ? document.fonts.ready.catch(() => undefined)
          : Promise.resolve();

        await Promise.all([
          fontsReady,
          ...CERT_ASSETS.map((src) => preloadImage(src)),
        ]);

        if (cancelled) return;

        setData(previewData);
        setIsVerified(verified);
        setReady(true);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error?.message || 'Could not load certificate.');
          setReady(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [certificateNumber, searchParams]);

  const handlePrint = () => {
    if (!isVerified) return;
    document.body.classList.add('cert-is-printing');
    const cleanup = () => {
      document.body.classList.remove('cert-is-printing');
    };
    window.addEventListener('afterprint', cleanup, { once: true });
    window.print();
  };

  const canPrint = ready && isVerified;

  return (
    <div className={`cert-preview-page${ready ? ' is-ready' : ''}`}>
      <header className="cert-preview-toolbar no-print">
        <div className="cert-preview-toolbar__copy">
          <strong>Certificate print preview</strong>
          <span>
            {certificateNumber ? `Certificate #${certificateNumber}` : '3509 × 2480 · design preview'}
          </span>
        </div>
        <div className="cert-preview-toolbar__actions">
          <div className="cert-preview-zoom no-print" role="group" aria-label="Preview zoom">
            <button
              type="button"
              className={`cert-preview-zoom__btn${viewMode === 'fit' ? ' is-active' : ''}`}
              onClick={() => setViewMode('fit')}
              aria-pressed={viewMode === 'fit'}
            >
              Fit
            </button>
            <button
              type="button"
              className={`cert-preview-zoom__btn${viewMode === 'actual' ? ' is-active' : ''}`}
              onClick={() => setViewMode('actual')}
              aria-pressed={viewMode === 'actual'}
            >
              100%
            </button>
          </div>
          <button type="button" className="cert-preview-btn cert-preview-btn--ghost" onClick={() => window.history.back()}>
            Back
          </button>
          <button
            type="button"
            className="cert-preview-btn cert-preview-btn--primary"
            onClick={handlePrint}
            disabled={!canPrint}
            title={!isVerified ? 'Available after HOA approval' : undefined}
          >
            Print / Save PDF
          </button>
        </div>
      </header>

      {loadError && (
        <div className="cert-preview-loading no-print" role="alert">
          <strong>Could not load certificate</strong>
          <span>{loadError}</span>
        </div>
      )}

      {!ready && !loadError && (
        <div className="cert-preview-loading no-print" role="status" aria-live="polite" aria-busy="true">
          <span className="cert-preview-loading__spinner" aria-hidden="true" />
          <strong>Preparing certificate…</strong>
          <span>Loading certificate data, images, and fonts</span>
        </div>
      )}

      {ready && !isVerified && (
        <p className="cert-preview-hint no-print cert-preview-hint--warning">
          This certificate is pending HOA approval. You can preview it here, but printing is disabled until it is approved.
        </p>
      )}

      <main
        className={`cert-preview-stage cert-preview-stage--${viewMode}${ready ? '' : ' is-hidden'}`}
        aria-hidden={!ready}
      >
        <div
          className="cert-preview-viewport"
          style={{ width: scaledSize.width, height: scaledSize.height }}
        >
          <div
            className="cert-preview-scale"
            style={{
              '--cert-view-scale': scale,
              '--cert-preview-h': `${CERT_PREVIEW_H}px`,
            }}
          >
            <article className="cert-sheet" aria-label="Certificate of completion">
              <div
                className="cert-sheet__frame"
                style={{ '--cert-curve-mask': `url(${cert2})` }}
              >
                <img
                  src={cert2}
                  alt=""
                  className="cert-sheet__curve"
                  aria-hidden="true"
                />
                <div className="cert-sheet__hero-bg" aria-hidden="true">
                  <img
                    src={linesBg}
                    alt=""
                    className="cert-sheet__waves"
                    aria-hidden="true"
                  />
                </div>
                <div className="cert-sheet__inner">
                  <div className="cert-sheet__edge">
                    <div className="cert-sheet__canvas">
                      <section className="cert-sheet__hero" aria-label="Certificate details">
                        <div className="cert-sheet__text">
                          <div className="cert-sheet__heading">
                            <img src={cert} alt="Certificate" />
                          </div>

                          <p className="cert-sheet__line cert-sheet__line--lead">This Certificate is proudly awarded to</p>
                          <div className="cert-sheet__name-container">
                            <p className="cert-sheet__line cert-sheet__line--name">{data.studentName}</p>
                          </div>

                          <p className="cert-sheet__line cert-sheet__line--body">
                            Awarded for the successful completion of the <strong>« {data.courseTitle} »</strong> through Gonaraza Academia. demonstrating dedication to continuous learning and skills development.
                          </p>
                        </div>
                      </section>

                      <footer className="cert-sheet__footer">
                        <div className="cert-sheet__footer-partners">
                          <p className="cert-sheet__partners-title">Verified &amp; Authorized By Partners</p>
                          <div className="cert-sheet__partners-logos">
                            <img src={part1} alt="Republic of Rwanda Ministry of ICT and Innovation" className="cert-sheet__partner-logo cert-sheet__partner-logo--wide" />
                            <img src={part2} alt="ICT Chamber" className="cert-sheet__partner-logo cert-sheet__partner-logo--chamber" />
                            <img src={part3} alt="Go Naraza Group Ltd" className="cert-sheet__partner-logo cert-sheet__partner-logo--wide" />
                          </div>

                          <div className="cert-sheet__dates">
                            <p>
                              <span>Certificate generated on </span><strong>{data.issuedOn}</strong>
                            </p>
                            <p>
                              <span>Downloaded By </span><strong>{data.downloadedBy}</strong>
                            </p>
                          </div>
                        </div>
                      </footer>
                    </div>
                  </div>
                </div>
                <div className="cert-sheet__footer-signatures">
                  <SignatureBlock
                    name="Phd. Eric NSAMUKIZA"
                    title="Head Of Academia Learning Portal"
                  />
                  <CertSeal year={data.validSince} />
                  <SignatureBlock
                    name="Emmanuel NSHIMIYIMANA"
                    title="Head Of NARAZA GROUP Ltd"
                  />
                </div>
                <img
                  src={linesCorner}
                  alt=""
                  className="cert-sheet__waves-corner"
                  aria-hidden="true"
                />
                <aside className="cert-sheet__ribbon" aria-label="Verification ribbon">
                  <img
                    src={cert1}
                    alt=""
                    className="cert-sheet__ribbon-bg"
                    aria-hidden="true"
                  />
                  <div className="cert-sheet__ribbon-inner">
                    <img
                      src={ribbonLogo}
                      alt="Gonaraza.com"
                      className="cert-sheet__brand-logo"
                    />

                    <img
                      src={ribbonQr}
                      alt="Certificate verification QR"
                      className="cert-sheet__qr"
                    />

                    <div className="cert-sheet__tutor">
                      <p className="cert-sheet__tutor-label">Course Tutor By</p>
                      <p className="cert-sheet__tutor-name">{data.tutorName}</p>
                    </div>
                  </div>
                </aside>
              </div>
            </article>
          </div>
        </div>
      </main>

      {ready && !certificateNumber && (
        <p className="cert-preview-hint no-print">
          Pass <code>?number=...</code> to load a real certificate, or use query overrides:
          <code>?name=...&amp;course=...&amp;tutor=...&amp;issued=...&amp;downloaded=...&amp;valid=...</code>
        </p>
      )}
    </div>
  );
}
