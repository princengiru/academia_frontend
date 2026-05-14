import acFilterIcon from '../../assets/icons/ac-ff.svg';
import acFiltersIcon from '../../assets/icons/ac-fi.svg';
import ddwIcon from '../../assets/icons/ddw.svg';
import journalImage from '../../assets/imgs/journal.jpg';
import acHer2Icon from '../../assets/icons/ac-her2.svg';
import acEyeIcon from '../../assets/icons/ac-eye.svg';
import acSmsIcon from '../../assets/icons/ac-sms.svg';
import acSendIcon from '../../assets/icons/ac-send.svg';
import './journals.css';



function AcademiaJournals() {
  const categoryFilters = ['All Courses', 'Certificates', 'Diplomas', 'Degrees', 'Workshops'];
  const sortFilters = ['Newest', 'Top papers', 'Past Papers', 'Most Downloaded'];
  const tags = [
    'All',
    'Showbiz',
    'Technology',
    'Business',
    'Science',
    'Health',
    'Sports',
    'Entertainment',
    'Education',
    'Travel',
  ];

  const journals = Array.from({ length: 5 }, (_, index) => ({
    id: index,
    author: 'Fabrice',
    title: 'Build your software & engineering dream career',
    likes: '10.6K',
    views: '10.6K',
  }));

  return (
    <div className="academia-journals-page">
      <section className="hero-sec">
        <div className="hero-sec-inner">
          <div className="hsi-contents">
            <div className="hsi-contents-h">
              <h1>Journals & Projects</h1>
            </div>
            <div className="hsi-contents-b">
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis eaque sit aperiam? Hic eaque unde nobis nisi aut minus quas quod aliquid et minima.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="main-content">
        <div className="div-h">
          <div className="dropdown filter-drop">
            <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <div>
                <img src={acFilterIcon} alt="" />
                <span>All Courses</span>
              </div>
            </button>
            <ul className="dropdown-menu">
              {categoryFilters.map((item, index) => (
                <li key={item} className={`dropdown-item${index === 0 ? ' active' : ''}`}>
                  <a href={`/academia/journals?type=${item.toLowerCase().replace(/\s+/g, '-')}`}>{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="div-h-r">
            <div className="div-h-r-s">
              <input type="search" placeholder="Search any projects..." />
              <div className="div-h-r-s-f">
                <button className="active" type="button">All</button>
                <button type="button">Free</button>
                <button type="button">Paid</button>
                <div className="div-h-r-s-f-f">
                  <div className="dropdown">
                    <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <div>
                        <img src={acFiltersIcon} alt="" />
                        <span>Filters</span>
                      </div>
                    </button>
                    <ul className="dropdown-menu">
                      {sortFilters.map((item, index) => (
                        <li key={item} className={`dropdown-item${index === 0 ? ' active' : ''}`}>
                          <a href={`/academia/journals?sort=${item.toLowerCase().replace(/\s+/g, '-')}`}>{item}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="best-links">
          <div className="best-links-body">
            {tags.concat(tags).map((tag, index) => (
              <button key={`${tag}-${index}`} type="button" className={index === 1 ? 'active' : ''}>
                {tag}
              </button>
            ))}
          </div>
          <div className="best-links-end">
            <button type="button">
              <img src={ddwIcon} alt="" />
            </button>
          </div>
        </div>
      </section>

      <section className="main-content-new">
        <div className="main-content-grid">
          {journals.map((journal) => (
            <div
              key={journal.id}
              className="journal"
              role="button"
              tabIndex={0}
              onClick={() => window.location.href = '/academia/read-journal'}
              onKeyDown={(event) => event.key === 'Enter' && (window.location.href = '/academia/read-journal')}
            >
              <div className="journal-img">
                <img src={journalImage} alt="Journal" />
              </div>
              <div className="journal-info">
                <div className="journal-info-h">
                  <div>
                    <span>By</span>
                    <p>{journal.author}</p>
                  </div>
                  <div>
                    <div>
                      <button type="button">
                        <img src={acHer2Icon} alt="" />
                        <span>{journal.likes}</span>
                      </button>
                      <button type="button">
                        <img src={acEyeIcon} alt="" />
                        <span>{journal.views}</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="journal-info-b">
                  <p>{journal.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="main-content-grid skeletons" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="journal skeleton-journal">
              <div className="journal-img skeleton-img" />
              <div className="journal-info">
                <div className="journal-info-h">
                  <div>
                    <span className="skeleton-text skeleton-text-sm" />
                    <span className="skeleton-text skeleton-text-sm" />
                  </div>
                  <div>
                    <div>
                      <button type="button" className="skeleton-btn" />
                    </div>
                  </div>
                </div>
                <div className="journal-info-b">
                  <p className="skeleton-text skeleton-text-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="newsletter-sec">
        <div className="newsletter-sec-l">
          <h3>Newsletter - Stay tune and get the latest update</h3>
          <p>Far far away, behind the word mountains</p>
        </div>
        <div className="newsletter-sec-r">
          <form>
            <img src={acSmsIcon} alt="Message" className="ac-sms" />
            <input type="email" placeholder="Enter email address" />
            <button type="submit">
              <img src={acSendIcon} alt="Next" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AcademiaJournals;
