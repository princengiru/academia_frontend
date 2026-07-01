import React, { useState, useRef, useEffect, useCallback } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-settings.css';

import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import rwanda from '../../../assets/icons/rwanda.svg';

// ─── Inline SVGs ──────────────────────────────────────────────────────────────
const IconChecked = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="8" fill="#450468" />
        <path d="M4.5 8L7 10.5L11.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconUnchecked = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="8" fill="#E4E6EF" />
        <path d="M4.5 8L7 10.5L11.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconUpload = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#450468" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const IconInstagram = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const IconLinkedIn = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const IconFacebook = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const IconTwitter = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);

const IconTiktok = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

// ─── Nav sections definition ───────────────────────────────────────────────────
const NAV_CATEGORIES = [
    {
        title: 'Basic Setup',
        items: [
            { id: 'general', label: 'General Settings' },
            { id: 'layout', label: 'Layout' },
            { id: 'social', label: 'Social Media Links' },
            { id: 'seo', label: 'SEO and Metadata' },
        ]
    },
    {
        title: 'Payments',
        items: [
            { id: 'payment', label: 'Payment Methods' },
        ]
    },
    {
        title: 'Advanced Settings',
        items: [
            { id: 'theme', label: 'App Theme' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'address', label: 'Address' },
            { id: 'appearance', label: 'Appearance' },
        ]
    }
];

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
    <label className="hoas-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="hoas-slider" />
    </label>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const HOASettings = () => {
    const [saved, setSaved] = useState({});
    const [activeSection, setActiveSection] = useState('general');
    const sectionRefs = useRef({});

    // Theme selection
    const [selectedTheme, setSelectedTheme] = useState('light');
    const [syncSystem, setSyncSystem] = useState(true);

    // Payment gateway
    const [selectedGateway, setSelectedGateway] = useState('card');
    const [paymentActive, setPaymentActive] = useState(true);

    // Toggles
    const [publicProfile, setPublicProfile] = useState(true);
    const [searchIndexing, setSearchIndexing] = useState(true);

    // Notification toggles
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifSMS, setNotifSMS] = useState(false);
    const [notifPush, setNotifPush] = useState(true);
    const [notifNewLearner, setNotifNewLearner] = useState(true);
    const [notifNewAssignment, setNotifNewAssignment] = useState(true);
    const [notifGrades, setNotifGrades] = useState(false);

    // Social toggles
    const [socialIG, setSocialIG] = useState(true);
    const [socialLI, setSocialLI] = useState(true);
    const [socialFB, setSocialFB] = useState(false);
    const [socialTW, setSocialTW] = useState(true);
    const [socialTK, setSocialTK] = useState(false);

    const handleSave = useCallback((sectionId) => {
        setSaved(prev => ({ ...prev, [sectionId]: true }));
    }, []);

    const scrollToSection = (id) => {
        sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(id);
    };

    // Scroll spy
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.dataset.section);
                    }
                });
            },
            { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
        );

        Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const SectionCard = ({ id, title, children }) => (
        <div
            className="hoas-section-card"
            id={id}
            data-section={id}
            ref={el => sectionRefs.current[id] = el}
        >
            <div className="hoas-section-header">
                <div className="hoas-section-title-row">
                    <h2>{title}</h2>
                    {saved[id] && (
                        <span className="hoas-saved-badge">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6.5L4.8 9.5L10 3" stroke="#17C653" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Saved
                        </span>
                    )}
                </div>
            </div>
            <div className="hoas-section-body">
                {children}
                <div className="hoas-section-footer">
                    <button className="hoas-btn-discard">Discard</button>
                    <button className="hoas-btn-save" onClick={() => handleSave(id)}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <HOALayout currentPage="settings">
            <div className="hoas-page-wrapper">

                {/* Page Header */}
                <div className="hoas-page-header">
                    <div>
                        <h1>Platform Settings</h1>
                        <p className="hoas-page-subtitle">Manage your platform configuration and preferences</p>
                    </div>
                    <div className="hoas-header-actions">
                        <span className="hoas-update-status">
                            <img src={hoarefresh} alt="Refresh" className="hoas-sync-icon" />
                            Data updated every 5min
                            <span className="hoas-dot" />
                        </span>
                        <button className="hoas-btn-primary">
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                <div className="hoas-layout-container">

                    {/* ── Left sticky nav ── */}
                    <div className="hoas-settings-nav">
                        <h2 className="hoas-settings-title">Settings</h2>
                        {NAV_CATEGORIES.map(category => (
                            <div key={category.title} className="hoas-nav-category">
                                <h3 className="hoas-nav-category-title">{category.title}</h3>
                                <ul className="hoas-nav-list">
                                    {category.items.map((nav) => (
                                        <li key={nav.id}>
                                            <button
                                                className={`hoas-nav-btn ${activeSection === nav.id ? 'active' : ''}`}
                                                onClick={() => scrollToSection(nav.id)}
                                            >
                                                <span className="hoas-step-icon">
                                                    {saved[nav.id] ? <IconChecked /> : <IconUnchecked />}
                                                </span>
                                                <span className="hoas-nav-label">{nav.label}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* ── Main Content ── */}
                    <div className="hoas-content-area">

                        {/* ── 1. Basic Settings ── */}
                        <SectionCard id="general" title="Basic Settings">
                            <div className="hoas-form-horizontal-row">
                                <label className="hoas-form-horizontal-label">Client ID</label>
                                <div className="hoas-form-horizontal-control">
                                    <input type="text" defaultValue="Head Of Academia" />
                                </div>
                            </div>

                            <div className="hoas-form-horizontal-row">
                                <label className="hoas-form-horizontal-label">Photo</label>
                                <div className="hoas-form-horizontal-control">
                                    <div className="hoas-photo-upload-area">
                                        <span className="hoas-photo-info">150×150px JPEG, PNG Image</span>
                                        <div className="hoas-photo-preview">
                                            <img src="/assets/imgs/default-profile.png" alt="Profile" />
                                            <div className="hoas-photo-remove">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="hoas-form-horizontal-row">
                                <label className="hoas-form-horizontal-label">Name</label>
                                <div className="hoas-form-horizontal-control">
                                    <input type="text" defaultValue="Jason Tatum" />
                                </div>
                            </div>

                            <div className="hoas-form-horizontal-row">
                                <label className="hoas-form-horizontal-label">Role</label>
                                <div className="hoas-form-horizontal-control">
                                    <input type="text" defaultValue="UI/UX Designer" />
                                </div>
                            </div>

                            <div className="hoas-form-horizontal-row">
                                <label className="hoas-form-horizontal-label">Phone number</label>
                                <div className="hoas-form-horizontal-control">
                                    <div className="hoas-input-with-flag" style={{width: '100%'}}>
                                        <img src={rwanda} alt="Rwanda" style={{left: '12px'}} />
                                        <input type="text" defaultValue="+250 700 000 000" style={{paddingLeft: '40px'}} />
                                    </div>
                                </div>
                            </div>

                            <div className="hoas-form-horizontal-row">
                                <label className="hoas-form-horizontal-label">Visibility</label>
                                <div className="hoas-form-horizontal-control">
                                    <select defaultValue="public">
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>
                            </div>

                            <div className="hoas-form-horizontal-row">
                                <label className="hoas-form-horizontal-label">Availability</label>
                                <div className="hoas-form-horizontal-control">
                                    <div className="hoas-availability-area">
                                        <span className="hoas-availability-text">Available to hire</span>
                                        <Toggle checked={publicProfile} onChange={e => setPublicProfile(e.target.checked)} />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── 2. Layout ── */}
                        <SectionCard id="layout" title="Layout">
                            <div className="hoas-form-group">
                                <label>Logo</label>
                                <p className="hoas-sub-label">Supported formats: JPG, PNG, SVG. Max size: 2MB.</p>
                                <div className="hoas-upload-grid">
                                    <div className="hoas-upload-box">
                                        <div className="hoas-upload-icon-wrapper">
                                            <IconUpload />
                                        </div>
                                        <div className="hoas-upload-text">
                                            <strong>Light Logo</strong>
                                            <span>Click to upload or drag & drop</span>
                                        </div>
                                    </div>
                                    <div className="hoas-upload-box">
                                        <div className="hoas-upload-icon-wrapper">
                                            <IconUpload />
                                        </div>
                                        <div className="hoas-upload-text">
                                            <strong>Dark Logo</strong>
                                            <span>Click to upload or drag & drop</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="hoas-form-group hoas-mt-16">
                                <label>Favicon</label>
                                <p className="hoas-sub-label">ICO or PNG, 32×32px recommended.</p>
                                <div className="hoas-upload-box hoas-upload-box--single">
                                    <div className="hoas-upload-icon-wrapper">
                                        <IconUpload />
                                    </div>
                                    <div className="hoas-upload-text">
                                        <strong>Favicon</strong>
                                        <span>Click to upload</span>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── 3. Social Media Links ── */}
                        <SectionCard id="social" title="Social Media Links">
                            {[
                                { id: 'ig', icon: <IconInstagram />, label: 'Instagram', placeholder: 'instagram.com/gonaraza', bg: '#FFEEF3', color: '#F8285A', checked: socialIG, onChange: e => setSocialIG(e.target.checked) },
                                { id: 'li', icon: <IconLinkedIn />, label: 'LinkedIn', placeholder: 'linkedin.com/company/gonaraza', bg: '#F0F5FF', color: '#1B84FF', checked: socialLI, onChange: e => setSocialLI(e.target.checked) },
                                { id: 'fb', icon: <IconFacebook />, label: 'Facebook', placeholder: 'facebook.com/gonaraza', bg: '#EFF4FF', color: '#1877F2', checked: socialFB, onChange: e => setSocialFB(e.target.checked) },
                                { id: 'tw', icon: <IconTwitter />, label: 'Twitter / X', placeholder: 'twitter.com/gonaraza', bg: '#F5F5F5', color: '#000000', checked: socialTW, onChange: e => setSocialTW(e.target.checked) },
                                { id: 'tk', icon: <IconTiktok />, label: 'TikTok', placeholder: 'tiktok.com/@gonaraza', bg: '#F5F0FF', color: '#69C9D0', checked: socialTK, onChange: e => setSocialTK(e.target.checked) },
                            ].map(({ id, icon, label, placeholder, bg, color, checked, onChange }) => (
                                <div key={id} className="hoas-social-row">
                                    <div className="hoas-social-icon" style={{ background: bg, color }}>
                                        {icon}
                                    </div>
                                    <div className="hoas-social-input">
                                        <label>{label}</label>
                                        <input type="text" defaultValue={placeholder} />
                                    </div>
                                    <Toggle checked={checked} onChange={onChange} />
                                </div>
                            ))}
                        </SectionCard>

                        {/* ── 4. SEO & Metadata ── */}
                        <SectionCard id="seo" title="SEO and Metadata">
                            <div className="hoas-toggle-wrapper hoas-mb-20">
                                <div>
                                    <span className="hoas-toggle-label"><b>Enable Search Engine Indexing</b></span>
                                    <p className="hoas-toggle-desc">Allow search engines to index your site.</p>
                                </div>
                                <Toggle checked={searchIndexing} onChange={e => setSearchIndexing(e.target.checked)} />
                            </div>
                            <div className="hoas-form-group">
                                <label>Meta Title</label>
                                <input type="text" defaultValue="Gonaraza — All-in-one digital marketing" />
                            </div>
                            <div className="hoas-form-group">
                                <label>Meta Description</label>
                                <textarea rows="3" defaultValue="Gonaraza provides the best tools to manage your digital marketing campaigns efficiently and effectively." />
                            </div>
                            <div className="hoas-form-group">
                                <label>Meta Keywords</label>
                                <input type="text" defaultValue="digital marketing, Rwanda, online learning, courses" />
                            </div>
                        </SectionCard>

                        {/* ── 5. Payment Methods ── */}
                        <SectionCard id="payment" title="Payment Methods">
                            <div className="hoas-form-group">
                                <label>Gateway Type</label>
                                <div className="hoas-gateway-options">
                                    {[
                                        { id: 'mtn', label: 'Mobile Money', icon: '/assets/icons/MTN-pay.svg', bg: '#FFF8DD', color: '#F6C000' },
                                        { id: 'airtel', label: 'Airtel Money', icon: '/assets/icons/AIR-pay.svg', bg: '#FFEEF3', color: '#E40000' },
                                        { id: 'card', label: 'Credit Card', icon: '/assets/icons/CARD-pay.svg', bg: '#F0F5FF', color: '#1B84FF' },
                                    ].map(({ id, label, icon, bg, color }) => (
                                        <div
                                            key={id}
                                            className={`hoas-gateway-box ${selectedGateway === id ? 'active' : ''}`}
                                            onClick={() => setSelectedGateway(id)}
                                        >
                                            <div className="hoas-gateway-logo" style={{ background: bg }}>
                                                <img src={icon} alt={label} />
                                            </div>
                                            <span>{label}</span>
                                            {selectedGateway === id && (
                                                <span className="hoas-gateway-radio-dot" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Account Name</label>
                                    <input type="text" defaultValue="Gonaraza Ltd" />
                                </div>
                                <div className="hoas-form-group">
                                    <label>API Gateway Key</label>
                                    <div className="hoas-input-with-icon-right">
                                        <input type="password" defaultValue="sk_live_••••••••••••••••••••" />
                                        <div className="hoas-card-icons">
                                            <img src="/assets/icons/VISA-pay.svg" alt="Visa" height="18" />
                                            <img src="/assets/icons/MASTER-PAY.svg" alt="Mastercard" height="18" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Transaction Fee (%)</label>
                                    <input type="number" defaultValue="1.5" min="0" max="10" step="0.1" />
                                </div>
                                <div className="hoas-form-group">
                                    <label>Minimum Payout (RWF)</label>
                                    <input type="number" defaultValue="5000" />
                                </div>
                            </div>

                            <div className="hoas-toggle-wrapper">
                                <div>
                                    <span className="hoas-toggle-label">Activate Payment Method</span>
                                    <p className="hoas-toggle-desc">Enable live payment processing for this gateway</p>
                                </div>
                                <Toggle checked={paymentActive} onChange={e => setPaymentActive(e.target.checked)} />
                            </div>
                        </SectionCard>

                        {/* ── 6. App Theme ── */}
                        <SectionCard id="theme" title="App Theme">
                            <p className="hoas-sub-label">Choose the look and feel of your dashboard.</p>
                            <div className="hoas-theme-grid">
                                {[
                                    { id: 'light', label: 'Light', colors: ['#FFFFFF', '#F6F6F9', '#450468'] },
                                    { id: 'dark', label: 'Dark', colors: ['#1E1E2D', '#151521', '#7239EA'] },
                                    { id: 'custom', label: 'Custom', colors: ['#E8F4FD', '#D0E8FA', '#0D6EFD'] },
                                ].map(({ id, label, colors }) => (
                                    <div
                                        key={id}
                                        className={`hoas-theme-box ${selectedTheme === id ? 'active' : ''}`}
                                        onClick={() => setSelectedTheme(id)}
                                    >
                                        <div className="hoas-theme-preview" style={{ background: colors[0] }}>
                                            <div className="hoas-theme-preview-sidebar" style={{ background: colors[1] }} />
                                            <div className="hoas-theme-preview-content">
                                                <div className="hoas-theme-preview-bar" style={{ background: colors[2] }} />
                                                <div className="hoas-theme-preview-lines">
                                                    <div style={{ background: colors[1] }} />
                                                    <div style={{ background: colors[1] }} />
                                                    <div style={{ background: colors[1] }} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hoas-theme-label">
                                            <div className={`hoas-theme-radio ${selectedTheme === id ? 'checked' : ''}`}>
                                                {selectedTheme === id && <div />}
                                            </div>
                                            {label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="hoas-toggle-wrapper hoas-mt-20">
                                <div>
                                    <span className="hoas-toggle-label">Sync with system preferences</span>
                                    <p className="hoas-toggle-desc">Automatically switch theme based on your OS setting</p>
                                </div>
                                <Toggle checked={syncSystem} onChange={e => setSyncSystem(e.target.checked)} />
                            </div>
                        </SectionCard>

                        {/* ── 7. Notifications ── */}
                        <SectionCard id="notifications" title="Notifications">
                            <p className="hoas-sub-label">Configure how and when you receive notifications.</p>

                            <div className="hoas-notif-group">
                                <h3 className="hoas-notif-group-title">Delivery Channels</h3>
                                {[
                                    { label: 'Email Notifications', desc: 'Receive alerts via email', checked: notifEmail, onChange: e => setNotifEmail(e.target.checked) },
                                    { label: 'SMS Notifications', desc: 'Receive alerts via SMS', checked: notifSMS, onChange: e => setNotifSMS(e.target.checked) },
                                    { label: 'Push Notifications', desc: 'In-app push alerts', checked: notifPush, onChange: e => setNotifPush(e.target.checked) },
                                ].map(({ label, desc, checked, onChange }) => (
                                    <div key={label} className="hoas-toggle-wrapper hoas-toggle-sm">
                                        <div>
                                            <span className="hoas-toggle-label">{label}</span>
                                            <p className="hoas-toggle-desc">{desc}</p>
                                        </div>
                                        <Toggle checked={checked} onChange={onChange} />
                                    </div>
                                ))}
                            </div>

                            <div className="hoas-notif-group hoas-mt-20">
                                <h3 className="hoas-notif-group-title">Event Triggers</h3>
                                {[
                                    { label: 'New Learner Enrolled', desc: 'Notify when a new learner joins', checked: notifNewLearner, onChange: e => setNotifNewLearner(e.target.checked) },
                                    { label: 'New Assignment Submitted', desc: 'Alert when learners submit work', checked: notifNewAssignment, onChange: e => setNotifNewAssignment(e.target.checked) },
                                    { label: 'Grade Published', desc: 'Alert when results are released', checked: notifGrades, onChange: e => setNotifGrades(e.target.checked) },
                                ].map(({ label, desc, checked, onChange }) => (
                                    <div key={label} className="hoas-toggle-wrapper hoas-toggle-sm">
                                        <div>
                                            <span className="hoas-toggle-label">{label}</span>
                                            <p className="hoas-toggle-desc">{desc}</p>
                                        </div>
                                        <Toggle checked={checked} onChange={onChange} />
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        {/* ── 8. Address ── */}
                        <SectionCard id="address" title="Address">
                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Name / Organisation</label>
                                    <input type="text" defaultValue="Gonaraza Ltd" />
                                </div>
                                <div className="hoas-form-group">
                                    <label>Phone</label>
                                    <input type="text" defaultValue="+250 788 123 456" />
                                </div>
                            </div>
                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Street Address</label>
                                    <input type="text" defaultValue="KG 541 St" />
                                </div>
                                <div className="hoas-form-group">
                                    <label>City</label>
                                    <input type="text" defaultValue="Kigali" />
                                </div>
                            </div>
                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Province / State</label>
                                    <input type="text" defaultValue="Kigali City" />
                                </div>
                                <div className="hoas-form-group">
                                    <label>Postal Code</label>
                                    <input type="text" defaultValue="00100" />
                                </div>
                            </div>
                            <div className="hoas-form-group">
                                <label>Country</label>
                                <div className="hoas-input-with-flag">
                                    <img src={rwanda} alt="Rwanda" />
                                    <select defaultValue="rwanda">
                                        <option value="rwanda">Rwanda</option>
                                        <option value="kenya">Kenya</option>
                                        <option value="uganda">Uganda</option>
                                    </select>
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── 9. Appearance ── */}
                        <SectionCard id="appearance" title="Appearance">
                            <p className="hoas-sub-label">Customise fonts, colours and branding elements.</p>

                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Primary Color</label>
                                    <div className="hoas-color-picker-row">
                                        <input type="color" defaultValue="#450468" className="hoas-color-swatch" />
                                        <input type="text" defaultValue="#450468" className="hoas-color-hex" />
                                    </div>
                                </div>
                                <div className="hoas-form-group">
                                    <label>Accent Color</label>
                                    <div className="hoas-color-picker-row">
                                        <input type="color" defaultValue="#1B84FF" className="hoas-color-swatch" />
                                        <input type="text" defaultValue="#1B84FF" className="hoas-color-hex" />
                                    </div>
                                </div>
                            </div>

                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Font Family</label>
                                    <select defaultValue="inter">
                                        <option value="inter">Inter</option>
                                        <option value="poppins">Poppins</option>
                                        <option value="roboto">Roboto</option>
                                        <option value="outfit">Outfit</option>
                                    </select>
                                </div>
                                <div className="hoas-form-group">
                                    <label>Border Radius</label>
                                    <select defaultValue="8">
                                        <option value="4">4px – Sharp</option>
                                        <option value="8">8px – Rounded (Default)</option>
                                        <option value="12">12px – Soft</option>
                                        <option value="20">20px – Pill</option>
                                    </select>
                                </div>
                            </div>

                            <div className="hoas-appearance-preview">
                                <div className="hoas-appearance-preview-label">Live Preview</div>
                                <div className="hoas-appearance-card">
                                    <div className="hoas-appearance-sidebar" />
                                    <div className="hoas-appearance-main">
                                        <div className="hoas-appearance-topbar" />
                                        <div className="hoas-appearance-widgets">
                                            <div className="hoas-appearance-widget hoas-appearance-widget--dark" />
                                            <div className="hoas-appearance-widget" />
                                            <div className="hoas-appearance-widget" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                    </div>{/* end content-area */}
                </div>{/* end layout-container */}
            </div>{/* end page-wrapper */}
        </HOALayout>
    );
};

export default HOASettings;