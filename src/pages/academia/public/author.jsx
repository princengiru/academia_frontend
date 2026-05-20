import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import acGtIcon from '../../../assets/icons/ac-gt.svg';
import acUedIcon from '../../../assets/icons/ac-ued.svg';
import acBriIcon from '../../../assets/icons/ac-bri.svg';
import acGeoIcon from '../../../assets/icons/ac-geo.svg';
import acPpIcon from '../../../assets/icons/ac-pp.svg';
import acLkIcon from '../../../assets/icons/ac-lk.svg';
import acHer1Icon from '../../../assets/icons/ac-her1.svg';
import acHer2Icon from '../../../assets/icons/ac-her2.svg';
import acEyeIcon from '../../../assets/icons/ac-eye.svg';
import profImage from '../../../assets/imgs/prof.jpg';
import journalImage from '../../../assets/imgs/journal.jpg';
import acHrImage from '../../../assets/imgs/ac-hr.jpg';
import acJrImage from '../../../assets/imgs/ac-jr.jpg';
import acStrImage from '../../../assets/imgs/ac-str.jpg';
import glImage from '../../../assets/imgs/gl.jpg';
import itemImage from '../../../assets/imgs/item.jpg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import './author.css';

function AcademiaAuthor() {
  const navigate = useNavigate();

  const cards = [
    {
      id: 0,
      author: 'Fabrice',
      likes: '10.6K',
      views: '10.6K',
      title: 'Build your software & engineering dream career',
      image: journalImage,
    },
    {
      id: 1,
      author: 'Fabrice',
      likes: '9.8K',
      views: '9.3K',
      title: 'Data storytelling for product teams',
      image: acHrImage,
    },
    {
      id: 2,
      author: 'Fabrice',
      likes: '8.2K',
      views: '8.1K',
      title: 'How to structure your first research project',
      image: acJrImage,
    },
    {
      id: 3,
      author: 'Fabrice',
      likes: '7.4K',
      views: '6.9K',
      title: 'Practical design systems for product teams',
      image: acStrImage,
    },
    {
      id: 4,
      author: 'Fabrice',
      likes: '6.1K',
      views: '5.8K',
      title: 'Writing clear docs that developers actually use',
      image: glImage,
    },
    {
      id: 5,
      author: 'Fabrice',
      likes: '5.9K',
      views: '5.6K',
      title: 'Career roadmap for software engineers in 2026',
      image: itemImage,
    },
  ];

  useEffect(() => {
    const swiper = new Swiper('.more-from-grid', {
      modules: [Navigation],
      slidesPerView: 'auto',
      spaceBetween: 20,
      navigation: {
        nextEl: '.more-from-grid .swiper-button-next',
        prevEl: '.more-from-grid .swiper-button-prev',
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 15,
        },
        769: {
          slidesPerView: 5,
          spaceBetween: 20,
        },
      },
    });

    return () => {
      swiper.destroy();
    };
  }, []);

  return (
    <div className="academia-author-page">
      <section className="hero-sec">
        <div
          className="hero-sec-inner"
          style={{
            backgroundImage: `linear-gradient(270deg, rgba(69, 4, 104, 0.6) 0%, rgba(0, 0, 0, 0.6) 100%), url(${acHrImage})`,
          }}
        >
          <div className="hsi-img">
            <img src={profImage} alt="Xavera KABARANGA" />
          </div>
          <div className="hsi-text">
            <div>
              <h6>Xavera KABARANGA</h6>
              <p>|</p>
              <p>UI/UX Designer</p>
            </div>
            <div>
              <p>Member Since: January 24, 2021</p>
            </div>
          </div>
        </div>
      </section>

      <section className="main-content">
        <div className="main-content-grid">
          <div className="main-content-grid-l">
            <div className="mcgl-t">
              <div className="mcgl-t-1">
                <div></div>
                <p>Available Now</p>
              </div>
              <div className="mcgl-t-items">
                <div className="mcgl-t-item">
                  <img src={acUedIcon} alt="UI UX Design" />
                  <span>UI / UX Design</span>
                </div>
                <div className="mcgl-t-item">
                  <img src={acBriIcon} alt="Experience" />
                  <span>6 yrs experience</span>
                </div>
                <div className="mcgl-t-item">
                  <img src={acGeoIcon} alt="Location" />
                  <span>Kigali, Rwanda</span>
                </div>
              </div>
            </div>

            <div className="mcgl-actions">
              <button type="button">
                <img src={acPpIcon} alt="Follow" />
                <span>Follow</span>
              </button>
              <button type="button" onClick={() => navigate('/academia/read-journal')}>
                <span>Get In Touch</span>
                <img src={acLkIcon} alt="Get in touch" />
              </button>
            </div>

            <div className="mcgl-about">
              <h4>About</h4>
              <p>
                Statistics is the branch of mathematics that deals with the collection, analysis, interpretation,
                presentation, and organization of data. It provides methodologies for making inferences about
                populations based on sample data, enabling researchers to quantify uncertainty and variability in
                empirical findings...
                <a href="/academia/read-journal">Read more</a>
              </p>
            </div>

            <div className="mcgl-project-stats">
              <h4>Projects Stats</h4>
              <div className="mcgl-project-stats-list">
                <div>
                  <span>Project Views</span>
                  <span>1,345,780</span>
                </div>
                <div>
                  <span>Project Likes</span>
                  <span>236,890</span>
                </div>
                <div>
                  <span>Project Feedbacks</span>
                  <span>103,006</span>
                </div>
              </div>
            </div>

            <div className="mcgl-tools-skills">
              <h4>Tools &amp; Skills</h4>
              <ul>
                <li>Adobe Illustrator</li>
                <li>Adobe Photoshop</li>
                <li>Coding Skills (CSS, HTML &amp; React)</li>
                <li>Adobe InDesign</li>
              </ul>
            </div>
          </div>

          <div className="main-content-grid-r">
            {cards.map((card) => (
              <div key={card.id} className="journal" onClick={() => navigate('/academia/read-journal')} style={{ cursor: 'pointer' }}>
                <div className="journal-img">
                  <img src={card.image} alt={card.title} />
                </div>
                <div className="journal-info">
                  <div className="journal-info-h">
                    <div>
                      <span>By</span>
                      <p>{card.author}</p>
                    </div>
                    <div>
                      <div>
                        <button type="button">
                          <img src={card.id % 2 === 0 ? acHer2Icon : acHer1Icon} alt="Likes" />
                          <span>{card.likes}</span>
                        </button>
                        <button type="button">
                          <img src={acEyeIcon} alt="Views" />
                          <span>{card.views}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="journal-info-b">
                    <p>{card.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="main-content">
        <div className="more-from">
          <div>
            <h3>More from</h3>
            <div className="more-from-p">
              <div className="more-from-img">
                <img src={profImage} alt="Team Owners" />
              </div>
              <div className="more-from-text">
                <h6>Team Owners</h6>
                <button type="button" onClick={() => navigate('/academia/read-journal')}>Follow All</button>
              </div>
            </div>
          </div>
          <div>
            <button type="button" onClick={() => navigate('/academia/read-journal')}>
              <span>Hire us</span>
              <img src={acGtIcon} alt="Hire us" />
            </button>
          </div>
        </div>

        <div className="swiper more-from-grid">
          <div className="swiper-wrapper">
            {cards.map((card) => (
              <div key={card.id} className="swiper-slide">
                <div className="journal" onClick={() => navigate('/academia/read-journal')} style={{ cursor: 'pointer' }}>
                  <div className="journal-img">
                    <img src={card.image} alt={card.title} />
                  </div>
                  <div className="journal-info">
                    <div className="journal-info-h">
                      <div>
                        <span>By</span>
                        <p>{card.author}</p>
                      </div>
                      <div>
                        <div>
                          <button type="button">
                            <img src={acHer2Icon} alt="Likes" />
                            <span>{card.likes}</span>
                          </button>
                          <button type="button">
                            <img src={acEyeIcon} alt="Views" />
                            <span>{card.views}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="journal-info-b">
                      <p>{card.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="swiper-button-prev js-btn"></div>
          <div className="swiper-button-next js-btn"></div>
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

export default AcademiaAuthor;

