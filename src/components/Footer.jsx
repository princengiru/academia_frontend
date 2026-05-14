import logoIcon from '../assets/icons/logo.svg';
import follow1Icon from '../assets/icons/follow1.svg';
import follow2Icon from '../assets/icons/follow2.svg';
import follow3Icon from '../assets/icons/follow3.svg';
import follow4Icon from '../assets/icons/follow4.svg';
import follow5Icon from '../assets/icons/follow5.svg';
import follow6Icon from '../assets/icons/follow6.svg';
import follow7Icon from '../assets/icons/follow7.svg';
import mtnPayIcon from '../assets/icons/MTN-pay.svg';
import airPayIcon from '../assets/icons/AIR-pay.svg';
import visaPayIcon from '../assets/icons/VISA-pay.svg';
import masterPayIcon from '../assets/icons/MASTER-pay.svg';
import eeIcon from '../assets/icons/ee.svg';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Get Support',
      links: ['Help center', 'Submit a ticket', 'Report Abuse', 'Report Problem', 'Sales Tax and VAT'],
    },
    {
      title: 'Services',
      links: ['Become an agent', 'Business Partners', 'Global Services', 'Post your business', 'Post job profile'],
    },
    {
      title: 'Policies',
      links: ['Payment Protection', 'Money refund policy', 'Service monitoring', 'Renew & Refund Policy', 'EBM & Invoice'],
    },
    {
      title: 'Advert on Gonaraza.com',
      links: ['Individual business', 'Corporate business', 'Authors request', 'Job tenders', 'Global Investors'],
    },
    {
      title: 'Get to know us',
      links: ['About Gonaraza.com', 'Corporate responsibility', 'Gonaraza News articles', 'Gonaraza Magazine', 'Job portal'],
    },
  ];

  const paymentMethods = [
    { icon: mtnPayIcon, alt: 'MTN Pay' },
    { icon: airPayIcon, alt: 'Airtel Pay' },
    { icon: visaPayIcon, alt: 'Visa' },
    { icon: masterPayIcon, alt: 'Mastercard' },
  ];

  const socialLinks = [
    { href: '#', icon: follow1Icon, alt: 'Follow link 1' },
    { href: 'https://wa.me/250782761021', icon: follow2Icon, alt: 'WhatsApp', target: true },
    { href: 'https://x.com/GonarazaCom', icon: follow3Icon, alt: 'X/Twitter', target: true },
    { href: 'https://www.instagram.com/gonaraza.com_', icon: follow4Icon, alt: 'Instagram' },
    { href: 'https://www.tiktok.com/@gonaraza.com_official', icon: follow5Icon, alt: 'TikTok', target: true },
    { href: 'https://youtube.com/@onewebsellerbuyerconnect', icon: follow6Icon, alt: 'YouTube', target: true },
    { href: 'https://www.facebook.com/Gonaraza.comOfficial', icon: follow7Icon, alt: 'Facebook' },
  ];

  return (
    <footer className="footer">
      <div className="footer-p1">
        <div className="footer-p1-r">
          <img src={logoIcon} alt="Gonaraza Logo" />
        </div>
        <div className="footer-p1-l">
          <p>Stay tuned on our social medias</p>
          <div className="social-links">
            {socialLinks.map((link) => (
              <a
                key={link.alt}
                href={link.href}
                target={link.target ? '_blank' : undefined}
                rel={link.target ? 'noreferrer' : undefined}
                aria-label={link.alt}
              >
                <img src={link.icon} alt="" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-p2">
        {footerSections.map((section) => (
          <div className="footer-p2-item" key={section.title}>
            <h4>{section.title}</h4>
            <div className="footer-links">
              {section.links.map((linkText) => (
                <a key={linkText} href="#">
                  {linkText}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="footer-p3">
        <div className="footer-p3-l">
          <p>Supported payments methods</p>
          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <img key={method.alt} src={method.icon} alt={method.alt} />
            ))}
          </div>
        </div>
        <div className="footer-p3-divider" />
        <div className="footer-p3-r">
          <img src={eeIcon} alt="" />
          <label>Contact Us</label>
          <div className="divider">|</div>
          <a href="#">support@gonaraza.com</a>
          <div className="divider">|</div>
          <a href="#">info@gonaraza.com</a>
        </div>
      </div>

      <div className="footer-p4">
        <div className="footer-p4-l">
          <a href="#">Terms and Conditions of use </a>
          <div className="divider">|</div>
          <a href="#">Privacy policy</a>
          <div className="divider">|</div>
          <a href="#">Ad policy</a>
        </div>
        <div className="footer-p4-divider" />
        <div className="footer-p4-r">
          <a href="#">Sitemap</a>
          <div className="divider">|</div>
          <p>
            {currentYear} &copy; Gonaraza.com All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
