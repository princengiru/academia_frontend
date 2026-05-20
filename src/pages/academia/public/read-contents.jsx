import { useNavigate } from 'react-router-dom';
import acFilterIcon from '../../../assets/icons/ac-ff.svg';
import acFiltersIcon from '../../../assets/icons/ac-fi.svg';
import acLeIcon from '../../../assets/icons/ac-le.svg';
import acBookIcon from '../../../assets/icons/ac-book.svg';
import acDlIcon from '../../../assets/icons/ac-dl.svg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import profImage from '../../../assets/imgs/prof.jpg';
import './read-contents.css';

function AcademiaReadContents() {
  const navigate = useNavigate();

  const courseTypes = ['All Courses', 'Certificates', 'Diplomas', 'Degrees', 'Workshops'];
  const sortOptions = ['Newest', 'Top papers', 'Past Papers', 'Most Downloaded'];

  const relatedPapers = Array.from({ length: 3 }, (_, index) => ({
    id: index,
    title: 'An Operadic Approach to Internal Structures',
    author: 'Dr. Xavier KABARANGA',
    summary:
      'Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings... Read more',
  }));

  const handleBack = () => navigate('/academia/course-part');

  return (
    <div className="academia-read-contents-page">
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
              {courseTypes.map((item, index) => (
                <li key={item} className={`dropdown-item${index === 0 ? ' active' : ''}`}>
                  <a href={`/academia/courses?type=${item.toLowerCase().replace(/\s+/g, '-')}`}>{item}</a>
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
                      {sortOptions.map((item, index) => (
                        <li key={item} className={`dropdown-item${index === 0 ? ' active' : ''}`}>
                          <a href={`/academia/courses?sort=${item.toLowerCase().replace(/\s+/g, '-')}`}>{item}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="filters-grid-b-h">
          <button type="button" onClick={handleBack}>
            <img src={acLeIcon} alt="Left" />
          </button>
          <div>
            <p>Mathematics & Science</p>
            <span>/</span>
            <span>Algebra</span>
            <span>/</span>
          </div>
        </div>

        <div className="course-part">
          <div className="course-part-h">
            <div>
              <h5>An Operadic Approach to Internal Structures</h5>
              <div className="course-part-h-p">
                <div className="course-part-h-img">
                  <img src={profImage} alt="Author" />
                </div>
                <p>By Dr. Xavier KABARANGA</p>
              </div>
            </div>
            <div>
              <button type="button">
                <img src={acBookIcon} alt="Save" />
                <span>Save to library</span>
              </button>
              <button type="button">
                <img src={acDlIcon} alt="Download" />
                <span>Download</span>
              </button>
            </div>
          </div>
          <div className="course-part-b">
            <h5>Abstract</h5>
            <p>
              Statistics is the branch of mathematics that deals with the collection, analysis, interpretation,
              presentation, and organization of data. It provides methodologies for making inferences about
              populations based on sample data, enabling researchers to quantify uncertainty and variability in
              empirical findings... Read more
            </p>
          </div>
        </div>
      </section>

      <section className="main-content">
        <div className="main-content-grid">
          <div className="main-content-grid-l">
            <div className="mcgl-h">
              <h2>Outline</h2>
            </div>
            <div className="cont-page"></div>
          </div>
          <div className="main-content-grid-r">
            <div className="mcgr-h">
              <h2>Related Papers</h2>
            </div>
            <div className="related-list">
              {relatedPapers.map((paper) => (
                <div key={paper.id} className="course-part">
                  <div className="course-part-h related-h">
                    <div>
                      <h5>{paper.title}</h5>
                      <p>By {paper.author}</p>
                    </div>
                    <div>
                      <button type="button" onClick={handleBack}>
                        <img src={acBookIcon} alt="View" />
                        <span>View Paper</span>
                      </button>
                      <button type="button">
                        <img src={acDlIcon} alt="Download" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  <div className="course-part-b">
                    <p>{paper.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

export default AcademiaReadContents;
