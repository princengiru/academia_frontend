import React, { useState } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-settings.css';

// Reusing standard project icons
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import rwanda from '../../../assets/icons/rwanda.svg';

// Custom Inline SVGs
const IconUpload = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#450468" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

const IconInstagram = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const IconLinkedIn = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
    </svg>
);

const IconVisa = () => (
    <svg width="24" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B84FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 10 8 10 12 20 18 4 22 4"></polygon>
    </svg>
);

const HOASettings = () => {
    const [activeTab, setActiveTab] = useState('general');

    const sidebarNav = [
        { id: 'general', label: 'General Settings' },
        { id: 'theme', label: 'Theme' },
        { id: 'account', label: 'Account & Security' },
        { id: 'team', label: 'Team Crews' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'translations', label: 'Translations' },
        { id: 'api', label: 'API Integrations' },
        { id: 'logs', label: 'System Logs' },
    ];

    return (
        <HOALayout currentPage="settings">
            <div className="hoas-page-wrapper">
                
                {/* Page Header */}
                <div className="hoas-page-header">
                    <h1>Settings</h1>
                    <div className="hoas-header-actions">
                        <span className="hoas-update-status">
                            <img src={hoarefresh} alt="Refresh" className="hoas-sync-icon" />
                            Data updated every 5min
                            <span className="hoas-dot"></span>
                        </span>
                        <button className="hoas-btn-primary">
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                <div className="hoas-layout-container">
                    
                    {/* Inner Sidebar Navigation */}
                    <div className="hoas-sidebar">
                        <ul className="hoas-nav-list">
                            {sidebarNav.map((nav) => (
                                <li key={nav.id}>
                                    <button 
                                        className={`hoas-nav-btn ${activeTab === nav.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(nav.id)}
                                    >
                                        {nav.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Main Content Area */}
                    <div className="hoas-content-area">
                        
                        {/* Section 1: General Settings */}
                        <div className="hoas-section-card">
                            <div className="hoas-section-header">
                                <h2>General Settings</h2>
                            </div>
                            <div className="hoas-section-body">
                                <div className="hoas-form-row">
                                    <div className="hoas-form-group">
                                        <label>Name</label>
                                        <input type="text" defaultValue="Gonaraza Platform" />
                                    </div>
                                    <div className="hoas-form-group">
                                        <label>Phone Number</label>
                                        <div className="hoas-input-with-avatar">
                                            <input type="text" defaultValue="+250 788 123 456" />
                                            <img src="/assets/imgs/default-profile.png" alt="Avatar" className="hoas-field-avatar" />
                                        </div>
                                    </div>
                                </div>

                                <div className="hoas-form-row">
                                    <div className="hoas-form-group">
                                        <label>Email</label>
                                        <input type="email" defaultValue="hello@gonaraza.com" />
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
                                </div>

                                <div className="hoas-form-row">
                                    <div className="hoas-form-group">
                                        <label>Currency</label>
                                        <select defaultValue="rwf">
                                            <option value="rwf">RWF - Rwandan Franc</option>
                                            <option value="usd">USD - US Dollar</option>
                                        </select>
                                    </div>
                                    <div className="hoas-form-group">
                                        <label>Visibility</label>
                                        <div className="hoas-toggle-wrapper">
                                            <span className="hoas-toggle-label">Public Profile</span>
                                            <label className="hoas-switch">
                                                <input type="checkbox" defaultChecked />
                                                <span className="hoas-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="hoas-section-footer">
                                    <button className="hoas-btn-save">Save Changes</button>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Layout */}
                        <div className="hoas-section-card">
                            <div className="hoas-section-header">
                                <h2>Layout</h2>
                            </div>
                            <div className="hoas-section-body">
                                <div className="hoas-form-group">
                                    <label>Logo</label>
                                    <p className="hoas-sub-label">Supported formats: JPG, PNG. Max size: 2MB.</p>
                                    
                                    <div className="hoas-upload-grid">
                                        <div className="hoas-upload-box">
                                            <div className="hoas-upload-icon-wrapper">
                                                <IconUpload />
                                            </div>
                                            <div className="hoas-upload-text">
                                                <strong>Light Logo</strong>
                                                <span>Click to replace</span>
                                            </div>
                                        </div>
                                        <div className="hoas-upload-box">
                                            <div className="hoas-upload-icon-wrapper">
                                                <IconUpload />
                                            </div>
                                            <div className="hoas-upload-text">
                                                <strong>Dark Logo</strong>
                                                <span>Click to replace</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="hoas-section-footer">
                                    <button className="hoas-btn-save">Save Changes</button>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Social Media Links */}
                        <div className="hoas-section-card">
                            <div className="hoas-section-header">
                                <h2>Social Media Links</h2>
                            </div>
                            <div className="hoas-section-body">
                                <div className="hoas-social-row">
                                    <div className="hoas-social-icon hoas-bg-pink"><IconInstagram /></div>
                                    <div className="hoas-social-input">
                                        <label>Instagram</label>
                                        <input type="text" defaultValue="instagram.com/gonaraza" />
                                    </div>
                                    <label className="hoas-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="hoas-slider"></span>
                                    </label>
                                </div>
                                <div className="hoas-social-row">
                                    <div className="hoas-social-icon hoas-bg-blue"><IconLinkedIn /></div>
                                    <div className="hoas-social-input">
                                        <label>LinkedIn</label>
                                        <input type="text" defaultValue="linkedin.com/company/gonaraza" />
                                    </div>
                                    <label className="hoas-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="hoas-slider"></span>
                                    </label>
                                </div>
                                <div className="hoas-section-footer">
                                    <button className="hoas-btn-save">Save Changes</button>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: SEO and Metadata */}
                        <div className="hoas-section-card">
                            <div className="hoas-section-header">
                                <h2>SEO and Metadata (SEO)</h2>
                            </div>
                            <div className="hoas-section-body">
                                <div className="hoas-form-group">
                                    <div className="hoas-toggle-wrapper" style={{ marginBottom: 16 }}>
                                        <span className="hoas-toggle-label"><b>Enable Search Engine Indexing</b><br/><small style={{ color: '#78829D', fontWeight: 400 }}>Allow search engines to index your site.</small></span>
                                        <label className="hoas-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="hoas-slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="hoas-form-group">
                                    <label>Meta Title</label>
                                    <input type="text" defaultValue="Gonaraza - All in one digital marketing" />
                                </div>
                                <div className="hoas-form-group">
                                    <label>Meta Description</label>
                                    <textarea rows="3" defaultValue="Gonaraza provides the best tools to manage your digital marketing campaigns efficiently and effectively."></textarea>
                                </div>
                                <div className="hoas-section-footer">
                                    <button className="hoas-btn-save">Save Changes</button>
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Payment Methods */}
                        <div className="hoas-section-card">
                            <div className="hoas-section-header">
                                <h2>Payment Methods</h2>
                            </div>
                            <div className="hoas-section-body">
                                <div className="hoas-form-group">
                                    <label>Gateway Type</label>
                                    <div className="hoas-gateway-options">
                                        <div className="hoas-gateway-box">
                                            <div className="hoas-gateway-circle hoas-bg-yellow"></div>
                                            <span>Mobile Money</span>
                                        </div>
                                        <div className="hoas-gateway-box">
                                            <div className="hoas-gateway-circle hoas-bg-red"></div>
                                            <span>Airtel Money</span>
                                        </div>
                                        <div className="hoas-gateway-box active">
                                            <div className="hoas-gateway-circle hoas-bg-blue"></div>
                                            <span>Credit Card</span>
                                        </div>
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
                                            <input type="password" defaultValue="************************" />
                                            <div className="hoas-card-icons">
                                                <IconVisa />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="hoas-form-group">
                                    <div className="hoas-toggle-wrapper">
                                        <span className="hoas-toggle-label">Activate Payment Method</span>
                                        <label className="hoas-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="hoas-slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="hoas-section-footer">
                                    <button className="hoas-btn-save">Save Changes</button>
                                </div>
                            </div>
                        </div>

                        {/* Section 6: App Theme */}
                        <div className="hoas-section-card" id="theme">
                            <div className="hoas-section-header">
                                <h2>App Theme</h2>
                            </div>
                            <div className="hoas-section-body">
                                <p className="hoas-sub-label">Choose the look and feel of your dashboard.</p>
                                
                                <div className="hoas-theme-grid">
                                    <div className="hoas-theme-box active">
                                        {/* Replace src with your dark theme image */}
                                        <img src="/assets/imgs/theme-dark.jpg" alt="Dark Theme" />
                                        <div className="hoas-theme-label">
                                            <input type="radio" name="theme" defaultChecked /> Dark
                                        </div>
                                    </div>
                                    <div className="hoas-theme-box">
                                        {/* Replace src with your light theme image */}
                                        <img src="/assets/imgs/theme-light.jpg" alt="Light Theme" />
                                        <div className="hoas-theme-label">
                                            <input type="radio" name="theme" /> Light
                                        </div>
                                    </div>
                                    <div className="hoas-theme-box">
                                        {/* Replace src with your custom theme image */}
                                        <img src="/assets/imgs/theme-custom.jpg" alt="Custom Theme" />
                                        <div className="hoas-theme-label">
                                            <input type="radio" name="theme" /> Custom
                                        </div>
                                    </div>
                                </div>

                                <div className="hoas-form-group hoas-mt-24">
                                    <div className="hoas-toggle-wrapper">
                                        <span className="hoas-toggle-label">Sync with system preferences</span>
                                        <label className="hoas-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="hoas-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="hoas-section-footer">
                                    <button className="hoas-btn-save">Save Changes</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </HOALayout>
    );
};

export default HOASettings;