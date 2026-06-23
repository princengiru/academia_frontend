import { useState } from 'react';
import hoatopicon1 from '../../../assets/icons/hoatopicon1.svg';
import hoatopicon2 from '../../../assets/icons/hoatopicon2.svg';
import hoausflag from '../../../assets/icons/hoausflag.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';

const languageOptions = [
  { label: 'RW', flag: '/assets/icons/rwanda.svg' },
  { label: 'EN', flag: hoausflag },
  { label: 'FR', flag: '/assets/icons/france.svg' },
];

const HOATopbar = ({ breadcrumb = { section: 'Dashboard', page: 'Overview' } }) => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(languageOptions[0]);

  const handleLanguageSelect = (option) => {
    setActiveLanguage(option);
    setIsLanguageOpen(false);
  };

  return (
    <header className="hoa-topbar">
      <div className="hoa-topbar-left">
        <h2>{breadcrumb.section} <span>/ {breadcrumb.page}</span></h2>
      </div>

      <div className="hoa-topbar-center">
        <div className="hoa-topbar-search">
          <img src="/assets/icons/magnifier.svg" alt="Search icon" />
          <input type="search" placeholder="Search" />
        </div>
      </div>

      <div className="hoa-topbar-right">
        <button className="hoa-icon-btn">
          <img src={hoatopicon1} alt="Notifications" />
        </button>
        <button className="hoa-icon-btn">
          <img src={hoatopicon2} alt="Apps" />
        </button>
        
        <div className="hoa-lang-selector">
          <button
            type="button"
            className="hoa-lang-trigger"
            onClick={() => setIsLanguageOpen((currentOpen) => !currentOpen)}
            aria-haspopup="listbox"
            aria-expanded={isLanguageOpen}
          >
            <img src={activeLanguage.flag} alt={activeLanguage.label} />
            <span>{activeLanguage.label}</span>
            <img src={hoadowncaret} alt="Dropdown" className="hoa-caret" />
          </button>
          {isLanguageOpen && (
            <div className="hoa-lang-dropdown" role="listbox">
              {languageOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className="hoa-lang-option"
                  onClick={() => handleLanguageSelect(option)}
                >
                  <img src={option.flag} alt={option.label} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hoa-user-profile">
          <div className="hoa-user-avatar">
            <img src="/assets/imgs/default-profile.png" alt="John Doe" />
          </div>
          <div className="hoa-user-info">
            <h6>Hi, John Doe</h6>
            <p>HOA</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HOATopbar;