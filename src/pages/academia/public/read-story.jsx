import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import acLeftIcon from '../../../assets/icons/ac-le.svg';
import acComIcon from '../../../assets/icons/ac-com.svg';
import acSide3Icon from '../../../assets/icons/ac-sd3.svg';
import acSavIcon from '../../../assets/icons/ac-sav.svg';
import acEyeIcon from '../../../assets/icons/ac-eye.svg';
import acUsIcon from '../../../assets/icons/ac-us.svg';
import acMessIcon from '../../../assets/icons/ac-mess.svg';
import acCalIcon from '../../../assets/icons/ac-cal.svg';
import acShareIcon from '../../../assets/icons/ac-share.svg';
import acNextIcon from '../../../assets/icons/ac-next.svg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import con3Icon from '../../../assets/icons/con3.svg';
import con4Icon from '../../../assets/icons/con4.svg';
import con5Icon from '../../../assets/icons/con5.svg';
import con6Icon from '../../../assets/icons/con6.svg';
import sha2Icon from '../../../assets/icons/sha2.svg';
import pictureIcon from '../../../assets/icons/picture.svg';
import profImage from '../../../assets/imgs/prof.jpg';
import acStrImage from '../../../assets/imgs/ac-str.jpg';
import itemImage from '../../../assets/imgs/item.jpg';
import trustedImage from '../../../assets/imgs/trusted.jpg';
import acHrImage from '../../../assets/imgs/ac-hr.jpg';
import acJrImage from '../../../assets/imgs/ac-jr.jpg';
import glImage from '../../../assets/imgs/gl.jpg';
import journalImage from '../../../assets/imgs/journal.jpg';
import './read-story.css';

function AcademiaReadStory() {
  const navigate = useNavigate();

  const comments = Array.from({ length: 10 }, (_, index) => ({
    id: index,
    author: 'Mr. Anderson',
    time: '1 Day ago',
    text:
      'Long before you sit dow to put digital pen to paper you need to make sure you have to sit down and write. I\'ll show you how to write a great blog post in five simple steps that people will actually want to read. Ready?',
  }));

  const relatedProjects = [
    {
      id: 0,
      author: 'Jose Carine',
      likes: '11',
      views: '1.1K',
      title: 'Build your software & engineering dream career',
      image: acStrImage,
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
      image: glImage,
    },
    {
      id: 4,
      author: 'Diane M.',
      likes: '15',
      views: '1.9K',
      title: 'Writing clear docs that developers actually use',
      image: journalImage,
    },
    {
      id: 5,
      author: 'Eric N.',
      likes: '12',
      views: '1.3K',
      title: 'Career roadmap for software engineers in 2026',
      image: itemImage,
    },
  ];

  useEffect(() => {
    const textarea = document.querySelector('.academia-read-story-page .new-comment-text textarea');
    const autoResize = () => {
      if (!textarea) return;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    const storySwiper = new Swiper('.ss-swiper', {
      modules: [Navigation],
      spaceBetween: 20,
      loop: false,
      grabCursor: true,
      navigation: {
        nextEl: '.ss-swiper .swiper-button-next',
        prevEl: '.ss-swiper .swiper-button-prev',
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        769: {
          slidesPerView: 4,
        },
      },
    });

    if (textarea) {
      textarea.addEventListener('input', autoResize);
      autoResize();
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('input', autoResize);
      }
      storySwiper.destroy();
    };
  }, []);

  return (
    <div className="academia-read-story-page">
      <section className="main-content">
        <div className="filters-grid-b-h">
          <button type="button" onClick={() => navigate('/academia/watch')}>
            <img src={acLeftIcon} alt="Back" />
          </button>
          <div>
            <p>Mathematics & Science</p>
            <span>/</span>
            <span>Algebra</span>
            <span>/</span>
          </div>
        </div>

        <div className="main-content-inner">
          <div className="main-content-inner-h">
            <h3>Build your dream software & engineering career</h3>
            <div>
              <p>5 mins read</p>
              <p>|</p>
              <p>Oct 21, 2025 07:51 AM</p>
            </div>
          </div>

          <div className="main-content-inner-b">
            <img src={acStrImage} alt="Story" />
          </div>

          <div className="story-footer">
            <div className="story-author">
              <div className="story-author-img">
                <img src={profImage} alt="Esther Howard" />
              </div>
              <div
                className="story-author-name"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/academia/author')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/academia/author');
                  }
                }}
              >
                <h6>Esther Howard</h6>
                <label>Journalist</label>
              </div>
            </div>

            <div className="story-footer-r">
              <a href="#" aria-label="Social 1"><img src={con5Icon} alt="Social" /></a>
              <a href="#" aria-label="Social 2"><img src={con6Icon} alt="Social" /></a>
              <a href="#" aria-label="Social 3"><img src={con4Icon} alt="Social" /></a>
              <a href="#" aria-label="Social 4"><img src={con3Icon} alt="Social" /></a>
              <div>
                <button type="button">
                  <img src={sha2Icon} alt="Share" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          <div className="full-story">
            <p>
              Before you do any of the following steps, be sure to pick a topic that actually interests you.
              Nothing and enthusiasm from the writer. You.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisici elit, ist ein Blindtext, der nichts bedeuten soll,
              sondern als Platzhalter im Layout verwendet wird, um einen Eindruck vom fertigen Schriftstuck zu
              erhalten.
            </p>
            <div className="story-media">
              <div>
                <img src={itemImage} alt="Story media 1" />
              </div>
              <div>
                <img src={trustedImage} alt="Story media 2" />
              </div>
            </div>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisici elit, ist ein Blindtext, der nichts bedeuten soll,
              sondern als Platzhalter im Layout verwendet wird, um einen Eindruck vom fertigen Schriftstuck zu
              erhalten.
            </p>
          </div>
        </div>
      </section>

      <section className="main-content">
        <div className="main-content-new-grid">
          <div className="mcnd-l">
            <div className="mcnd-l-h">
              <h2>Comments</h2>
              <div className="new-comment">
                <div className="new-comment-sender">
                  <img src={profImage} alt="Current user" />
                </div>
                <div className="new-comment-text">
                  <textarea rows={1} placeholder="your comment.."></textarea>
                  <button type="button">
                    <img src={pictureIcon} alt="Attach" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mcnd-l-b">
              <div className="mcnd-l-b-h">
                <button type="button">
                  <img src={acComIcon} alt="Comments" />
                  <span>8 Comments</span>
                </button>
                <button type="button">
                  <img src={acSide3Icon} alt="Likes" />
                  <span>47k Likes</span>
                </button>
                <button type="button">
                  <img src={acSavIcon} alt="Saves" />
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
                          <img src={acEyeIcon} alt="Views" />
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

      <section className="main-content">
        <div className="stories-sec-contents">
          <div className="swiper ss-swiper">
            <div className="swiper-wrapper">
              {relatedProjects.slice(0, 4).map((item) => (
                <div key={item.id} className="swiper-slide">
                  <div className="ss-item">
                    <div className="ss-item-img">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <div className="ss-item-text">
                      <div className="ss-item-text-h">
                        <div>
                          <img src={acUsIcon} alt="User" />
                          <span>Admin</span>
                        </div>
                        <div>
                          <img src={acMessIcon} alt="Messages" />
                          <span>3</span>
                        </div>
                      </div>
                      <h4>{item.title}</h4>
                      <p>
                        A small river named Duden flows by their place and supplies it with the necessary regelialia.
                      </p>
                      <div className="ss-item-text-f">
                        <div>
                          <img src={acCalIcon} alt="Calendar" />
                          <span>Oct 19, 2025 07:50 AM</span>
                        </div>
                        <button type="button">
                          <img src={acShareIcon} alt="Share" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="swiper-button-next ss-btn"></div>
            <div className="swiper-button-prev ss-btn"></div>
          </div>
        </div>

        <div className="sec-CTA">
          <button type="button">
            <span>View More</span>
            <img src={acNextIcon} alt="Next" />
          </button>
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

export default AcademiaReadStory;

