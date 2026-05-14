import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import acLeftIcon from '../../assets/icons/ac-le.svg';
import acBookMarkIcon from '../../assets/icons/ac-bm.svg';
import acGetTouchIcon from '../../assets/icons/ac-gt.svg';
import acFollowIcon from '../../assets/icons/ac-fol.svg';
import acSide1Icon from '../../assets/icons/ac-sd1.svg';
import acSide2Icon from '../../assets/icons/ac-sd2.svg';
import acSide3Icon from '../../assets/icons/ac-sd3.svg';
import acSide4Icon from '../../assets/icons/ac-sd4.svg';
import acSide5Icon from '../../assets/icons/ac-sd5.svg';
import acSideEyeIcon from '../../assets/icons/ac-eye.svg';
import acSideHeartIcon from '../../assets/icons/ac-her2.svg';
import acSmsIcon from '../../assets/icons/ac-sms.svg';
import acSendIcon from '../../assets/icons/ac-send.svg';
import profImage from '../../assets/imgs/prof.jpg';
import journalImage from '../../assets/imgs/journal.jpg';
import acHrImage from '../../assets/imgs/ac-hr.jpg';
import acJrImage from '../../assets/imgs/ac-jr.jpg';
import acStrImage from '../../assets/imgs/ac-str.jpg';
import glImage from '../../assets/imgs/gl.jpg';
import cat1Image from '../../assets/imgs/cat1.jpg';
import './read-journal.css';

function AcademiaReadJournal() {
  const navigate = useNavigate();

  const comments = Array.from({ length: 10 }, (_, index) => ({
    id: index,
    author: 'Mr. Anderson',
    time: '1 Day ago',
    text:
      'Long before you sit dow to put digital pen to paper you need to make sure you have to sit down and write. I’ll show you how to write a great blog post in five simple steps that people will actually want to read. Ready?',
  }));

  const relatedProjects = [
    {
      id: 0,
      author: 'Jose Carine',
      likes: '11',
      views: '1.1K',
      title: 'Build your software & engineering dream career',
      image: journalImage,
    },
    {
      id: 1,
      author: 'Noah Karemera',
      likes: '13',
      views: '1.4K',
      title: 'Data storytelling for engineering teams',
      image: acHrImage,
    },
    {
      id: 2,
      author: 'Aline Uwase',
      likes: '9',
      views: '980',
      title: 'How to structure your first research project',
      image: acJrImage,
    },
    {
      id: 3,
      author: 'Ishimwe Pierre',
      likes: '17',
      views: '2.2K',
      title: 'Practical design systems for product teams',
      image: acStrImage,
    },
    {
      id: 4,
      author: 'Diane M.',
      likes: '15',
      views: '1.9K',
      title: 'Writing clear docs that developers actually use',
      image: glImage,
    },
    {
      id: 5,
      author: 'Eric N.',
      likes: '12',
      views: '1.3K',
      title: 'Career roadmap for software engineers in 2026',
      image: cat1Image,
    },
  ];

  useEffect(() => {
    const moreFromSwiper = new Swiper('.more-from-grid', {
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

    const resizeGridItem = (item) => {
      const grid = document.querySelector('.main-content-grid-r');
      const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
      const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('gap'));

      const img = item.querySelector('img');
      const height = img.getBoundingClientRect().height;

      const rowSpan = Math.ceil((height + rowGap) / (rowHeight + rowGap));
      item.style.gridRowEnd = `span ${rowSpan}`;
    };

    const resizeAll = () => {
      document.querySelectorAll('.mcgr-item').forEach((item) => resizeGridItem(item));
    };

    window.addEventListener('load', resizeAll);
    window.addEventListener('resize', resizeAll);
    document.querySelectorAll('.main-content-grid-r img').forEach((img) => {
      img.addEventListener('load', () => resizeGridItem(img.parentElement));
    });

    resizeAll();

    return () => {
      window.removeEventListener('load', resizeAll);
      window.removeEventListener('resize', resizeAll);
      moreFromSwiper.destroy();
    };
  }, []);

  const handleBack = () => navigate('/academia/journals');
  const handleAuthor = () => navigate('/academia/author');

  return (
    <div className="academia-read-journal-page">
      <section className="main-content">
        <div className="filters-grid-b-h">
          <button type="button" onClick={handleBack}>
            <img src={acLeftIcon} alt="Left" />
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
                <div className="course-part-h-text">
                  <div>
                    <h6>By Dr. Xavier KABARANGA</h6>
                    <p>|</p>
                    <p>UI/UX Designer</p>
                  </div>
                  <div>
                    <a href="/academia/author">Team owners</a>
                    <p>|</p>
                    <button className="cp-btn" type="button" onClick={handleAuthor}>
                      Follow All
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <button type="button">
                <img src={acBookMarkIcon} alt="Save" />
                <span>Save to library</span>
              </button>
              <button type="button" onClick={handleAuthor}>
                <img src={acGetTouchIcon} alt="Contact" />
                <span>Get In Touch</span>
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
            <div className="mcgl-comp">
              <div className="mcgl-comp-t fir-st">
                <div>
                  <img src={profImage} alt="Author" />
                </div>
                <button type="button" onClick={handleAuthor}>
                  <img src={acFollowIcon} alt="Follow" />
                </button>
              </div>
              <div>
                <label>Follow</label>
              </div>
            </div>
            <div className="mcgl-comp">
              <div className="mcgl-comp-t">
                <div>
                  <img src={acSide1Icon} alt="Tools" />
                </div>
              </div>
              <div>
                <label>Tools</label>
              </div>
            </div>
            <div className="mcgl-comp">
              <div className="mcgl-comp-t">
                <div>
                  <img src={acSide2Icon} alt="Save" />
                </div>
              </div>
              <div>
                <label>Save</label>
              </div>
            </div>
            <div className="mcgl-comp">
              <div className="mcgl-comp-t">
                <div>
                  <img src={acSide3Icon} alt="Like" />
                </div>
              </div>
              <div>
                <label>Like</label>
              </div>
            </div>
            <div className="mcgl-comp">
              <div className="mcgl-comp-t">
                <div>
                  <img src={acSide4Icon} alt="Feedbacks" />
                </div>
                <p>123</p>
              </div>
              <div>
                <label>Feedbacks</label>
              </div>
            </div>
            <div className="mcgl-comp">
              <div className="mcgl-comp-t">
                <div>
                  <img src={acSide5Icon} alt="Share" />
                </div>
              </div>
              <div>
                <label>Share</label>
              </div>
            </div>
          </div>

          <div className="main-content-grid-r">
            <div className="course-part-h">
              <div>
                <div className="course-part-h-p">
                  <div className="course-part-h-img">
                    <img src={profImage} alt="Author" />
                  </div>
                  <div className="course-part-h-text">
                    <div>
                      <h6>By Dr. Xavier KABARANGA</h6>
                      <p>|</p>
                      <p>UI/UX Designer</p>
                    </div>
                    <div>
                      <a href="/academia/author">Team owners</a>
                      <p>|</p>
                      <button type="button" onClick={handleAuthor}>Follow All</button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <button type="button">
                  <img src={acBookMarkIcon} alt="Save" />
                  <span>Save to library</span>
                </button>
                <button type="button" onClick={handleAuthor}>
                  <img src={acGetTouchIcon} alt="Contact" />
                  <span>Get In Touch</span>
                </button>
              </div>
            </div>

            {relatedProjects.map((item) => (
              <div key={item.id} className="mcgr-item">
                <img src={item.image} alt={item.title} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="author">
        <div className="author-inner">
          <div className="author-img">
            <img src={profImage} alt="Author" />
          </div>
          <div className="author-name">
            <h6>Xavera KABARANGA</h6>
            <p>|</p>
            <p>UI/UX Designer</p>
          </div>
          <div className="author-stats">
            <div>
              <img src={acSide3Icon} alt="Likes" />
              <span>11.1K</span>
            </div>
            <div>
              <img src={acSideEyeIcon} alt="Views" />
              <span>11</span>
            </div>
            <div>
              <img src={acSide4Icon} alt="Feedbacks" />
              <span>11</span>
            </div>
          </div>
          <div className="author-text">
            <p>Published on</p>
            <p>|</p>
            <p>12 Jan 2029</p>
          </div>
        </div>
      </section>

      <section className="main-content">
        <div className="more-from">
          <div>
            <h3>More from</h3>
            <div className="more-from-p">
              <div className="more-from-img">
                <img src={profImage} alt="Author" />
              </div>
              <div className="more-from-text">
                <h6>Team Owners</h6>
                <button type="button" onClick={handleAuthor}>Follow All</button>
              </div>
            </div>
          </div>
          <div>
            <button type="button" onClick={handleAuthor}>
              <span>Hire us</span>
              <img src={acGetTouchIcon} alt="Hire us" />
            </button>
          </div>
        </div>

        <div className="swiper more-from-grid">
          <div className="swiper-wrapper">
            {relatedProjects.map((item) => (
              <div key={item.id} className="swiper-slide">
                <div className="journal" onClick={() => navigate('/academia/read-journal')} style={{ cursor: 'pointer' }}>
                  <div className="journal-img">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="journal-info">
                    <div className="journal-info-h">
                      <div>
                        <span>By</span>
                        <p>{item.author}</p>
                      </div>
                      <div>
                        <div>
                          <button type="button">
                            <img src={acSideHeartIcon} alt="Likes" />
                            <span>{item.likes}</span>
                          </button>
                          <button type="button">
                            <img src={acSideEyeIcon} alt="Views" />
                            <span>{item.views}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="journal-info-b">
                      <p>{item.title}</p>
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

      <section className="main-content">
        <div className="main-content-new-grid">
          <div className="mcnd-l">
            <div className="mcnd-l-h">
              <div>
                <h3>Sign in to leave a feedback</h3>
              </div>
              <div>
                <button type="button">Sign In</button>
                <button type="button">Sign Up</button>
              </div>
            </div>
            <div className="mcnd-l-b">
              <div className="mcnd-l-b-h">
                <button type="button">
                  <img src={acSide1Icon} alt="Comments" />
                  <span>8 Comments</span>
                </button>
                <button type="button">
                  <img src={acSide3Icon} alt="Likes" />
                  <span>47k Likes</span>
                </button>
                <button type="button">
                  <img src={acSide2Icon} alt="Saves" />
                  <span>900 Saves</span>
                </button>
              </div>
              <div className="mcnd-l-b-b">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <div className="comment-img">
                      <img src={profImage} alt="Comment author" />
                    </div>
                    <div className="comment-text">
                      <div>
                        <h6>{comment.author}</h6>
                        <span>{comment.time}</span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mcnd-r">
            <div className="mcnd-r-h">
              <h3>Related Projects</h3>
            </div>
            <div className="mcnd-r-b">
              {relatedProjects.map((item) => (
                <div key={item.id} className="related-item">
                  <div className="related-item-img">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="related-item-l">
                    <div className="related-item-l-t">
                      <div>
                        <label>By</label>
                        <h6>{item.author}</h6>
                      </div>
                      <div>
                        <p>
                          <img src={acSide3Icon} alt="Likes" />
                          <span>{item.likes}</span>
                        </p>
                        <p>
                          <img src={acSideEyeIcon} alt="Views" />
                          <span>{item.views}</span>
                        </p>
                      </div>
                    </div>
                    <div className="related-item-l-b">
                      <p>{item.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mcnd-r-CTA">
              <button type="button">See more</button>
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

export default AcademiaReadJournal;