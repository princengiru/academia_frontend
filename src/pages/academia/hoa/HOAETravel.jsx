import React from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { HOAEmptyState } from './HOAPageState';
import './hoa-e-travel.css';

import hoagoto from '../../../assets/icons/hoagoto.svg';

const IconPlus = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const IconSort = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, marginLeft: 4 }}>
        <polyline points="7 15 12 20 17 15"></polyline>
        <polyline points="7 9 12 4 17 9"></polyline>
    </svg>
);

const HOAETravel = () => {
    return (
        <HOALayout currentPage="e-travel">
            <div className="hoat-page-wrapper">
                
                {/* Page Header */}
                <div className="hoat-page-header">
                    <h1>e-Travel Records</h1>
                    <div className="hoat-header-actions">
                        <button type="button" className="hoat-btn-outline hoat-btn--coming-soon" disabled title="Coming soon">
                            <IconPlus /> Add an e-Travel <span className="hoat-coming-soon-label">Coming soon</span>
                        </button>
                        <button type="button" className="hoat-btn-primary hoat-btn--coming-soon" disabled title="Coming soon">
                            Go to website <img src={hoagoto} alt="" /> <span className="hoat-coming-soon-label">Coming soon</span>
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="hoat-table-container">
                    <table className="hoat-table">
                        <thead>
                            <tr>
                                <th className="hoat-w-40">
                                    <input type="checkbox" className="hoat-checkbox" disabled />
                                </th>
                                <th>Mission Name <IconSort /></th>
                                <th>Period Time <IconSort /></th>
                                <th>Estimated Budget <IconSort /></th>
                                <th>Progress <IconSort /></th>
                                <th>Status <IconSort /></th>
                                <th className="hoat-action-col">Action <IconSort /></th>
                            </tr>
                        </thead>
                    </table>

                    <div className="hoat-empty-state">
                        <HOAEmptyState
                            inline
                            title="No e-Travel records yet"
                            message="Mission travel requests will appear here once the e-Travel module is enabled."
                            actionLabel="Back to dashboard"
                            actionTo="/academia/hoa"
                        />
                        <button type="button" className="hoat-btn-outline-light hoat-btn--coming-soon" disabled title="Coming soon">
                            <IconPlus /> Request an e-Travel <span className="hoat-coming-soon-label">Coming soon</span>
                        </button>
                    </div>
                </div>

            </div>
        </HOALayout>
    );
};

export default HOAETravel;
