import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import acStat1Icon from '../../../assets/icons/ac-stat1.svg';
import acStat2Icon from '../../../assets/icons/ac-stat2.svg';
import acStat3Icon from '../../../assets/icons/ac-stat3.svg';
import acStat4Icon from '../../../assets/icons/ac-stat4.svg';
import acMailIcon from '../../../assets/icons/ac-mail.png';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import acUsIcon from '../../../assets/icons/ac-us.svg';
import acMessIcon from '../../../assets/icons/ac-mess.svg';
import acCalIcon from '../../../assets/icons/ac-cal.svg';
import acShareIcon from '../../../assets/icons/ac-share.svg';
import acNextIcon from '../../../assets/icons/ac-next.svg';
import psIcon from '../../../assets/icons/ps.svg';
import pvIcon from '../../../assets/icons/pv.svg';
import pshIcon from '../../../assets/icons/psh.svg';
import pfIcon from '../../../assets/icons/pf.svg';
import learnersProfileImage from '../../../assets/imgs/default-profile.png';
import journalImage from '../../../assets/imgs/journal.jpg';
import video2 from '../../../assets/vids/video2.mp4';
import './watch.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const resolveStoryImage = (value) => {
  if (!value) return null;

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  return `${API_BASE_URL}${value}`;
};

function AcademiaWatch() {
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    document.querySelectorAll('.academia-watch-page .story-thumbnail').forEach((container) => {
      const video = container.querySelector('video');
      if (!video) return;

      video.controls = false;
      container.classList.add('paused');

      const ui = document.createElement('div');
      ui.classList.add('ui-layer');
      ui.innerHTML = `
        <div class="center-controls">
          <button class="center-btn" data-action="rewind" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <text x="12" y="16" text-anchor="middle" font-size="8" fill="currentColor" stroke="none" font-weight="bold">10</text>
            </svg>
          </button>
          <button class="center-btn big-play" data-action="toggle" type="button">
            <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          </button>
          <button class="center-btn" data-action="forward" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <text x="12" y="16" text-anchor="middle" font-size="8" fill="currentColor" stroke="none" font-weight="bold">10</text>
            </svg>
          </button>
        </div>
        <div class="bottom-controls">
          <div class="left-pill">
            <button class="icon-btn" data-action="toggle-mini" type="button">
              <img class="icon-play" src="${psIcon}" alt="Play" />
              <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <button class="icon-btn" data-action="mute" type="button">
              <img class="icon-vol-on" src="${pvIcon}" alt="Sound on" />
              <svg class="icon-vol-off" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
            </button>
            <div class="time-text">0:00 / 0:00</div>
          </div>
          <div class="right-actions">
            <button class="icon-btn" data-action="share" type="button">
              <img class="icon-vol-on" src="${pshIcon}" alt="Share" />
            </button>
            <button class="icon-btn" data-action="fullscreen" type="button">
              <img class="icon-vol-on" src="${pfIcon}" alt="Fullscreen" />
            </button>
          </div>
          <div class="progress-area">
            <div class="progress-fill"></div>
          </div>
        </div>
      `;
      container.querySelector('.video-container').appendChild(ui);

      const toggleBtns = ui.querySelectorAll('[data-action="toggle"], [data-action="toggle-mini"]');
      const rewindBtn = ui.querySelector('[data-action="rewind"]');
      const forwardBtn = ui.querySelector('[data-action="forward"]');
      const muteBtn = ui.querySelector('[data-action="mute"]');
      const fsBtn = ui.querySelector('[data-action="fullscreen"]');
      const timeDisplay = ui.querySelector('.time-text');
      const progressArea = ui.querySelector('.progress-area');
      const progressFill = ui.querySelector('.progress-fill');
      let isDragging = false;

      const formatTime = (value) => {
        if (Number.isNaN(value) || !Number.isFinite(value)) return '0:00';
        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      };

      const updateIcons = () => {
        const paused = video.paused;
        ui.querySelectorAll('.icon-play').forEach((icon) => {
          icon.style.display = paused ? 'block' : 'none';
        });
        ui.querySelectorAll('.icon-pause').forEach((icon) => {
          icon.style.display = paused ? 'none' : 'block';
        });
      };

      const togglePlay = () => {
        if (video.paused) {
          video.play();
          container.classList.remove('paused');
          container.classList.add('playing');
        } else {
          video.pause();
          container.classList.remove('playing');
          container.classList.add('paused');
        }
        updateIcons();
      };

      const scrub = (event) => {
        const rect = progressArea.getBoundingClientRect();
        let position = (event.clientX - rect.left) / rect.width;
        position = Math.max(0, Math.min(1, position));
        progressFill.style.width = `${position * 100}%`;
        const targetTime = position * video.duration;
        timeDisplay.textContent = `${formatTime(targetTime)} / ${formatTime(video.duration)}`;
        return targetTime;
      };

      toggleBtns.forEach((button) => button.addEventListener('click', togglePlay));
      video.addEventListener('click', togglePlay);
      rewindBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        video.currentTime -= 10;
      });
      forwardBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        video.currentTime += 10;
      });
      muteBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        video.muted = !video.muted;
        ui.querySelector('.icon-vol-on').style.display = video.muted ? 'none' : 'block';
        ui.querySelector('.icon-vol-off').style.display = video.muted ? 'block' : 'none';
      });
      fsBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch((error) => console.log(error));
        } else {
          document.exitFullscreen();
        }
      });

      video.addEventListener('ended', () => {
        container.classList.remove('playing');
        container.classList.add('paused');
        video.currentTime = 0;
        progressFill.style.width = '0%';
        updateIcons();
      });

      video.addEventListener('loadedmetadata', () => {
        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      });

      if (video.readyState >= 1) {
        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      }

      video.addEventListener('timeupdate', () => {
        if (!isDragging) {
          const percent = (video.currentTime / video.duration) * 100;
          progressFill.style.width = `${percent}%`;
          timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        }
      });

      progressArea.addEventListener('mousedown', (event) => {
        isDragging = true;
        progressFill.classList.add('no-transition');
        scrub(event);
      });

      document.addEventListener('mousemove', (event) => {
        if (isDragging) {
          scrub(event);
        }
      });

      document.addEventListener('mouseup', (event) => {
        if (isDragging) {
          const targetTime = scrub(event);
          video.currentTime = targetTime;
          isDragging = false;
          setTimeout(() => {
            progressFill.classList.remove('no-transition');
          }, 50);
        }
      });
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/community-stories?page=${page}&limit=12`);
        const body = await res.json().catch(() => ({}));
        if (!mounted) return;
        const data = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
        setStories(data);
        setPagination(body?.pagination || body?.meta || null);
      } catch (e) {
        // keep empty
        setStories([]);
        setPagination(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [page]);

  return (
    <div className="academia-watch-page">
      <section className="stats-sec">
        <div className="stats-sec-item">
          <div>
            <img src={acStat1Icon} alt="Stats Icon" />
          </div>
          <div>
            <h5>20,000+</h5>
            <p>Enrolled Students</p>
          </div>
        </div>
        <div className="stats-sec-item">
          <div>
            <img src={acStat2Icon} alt="Stats Icon" />
          </div>
          <div>
            <h5>20,000+</h5>
            <p>Trusted Tutors</p>
          </div>
        </div>
        <div className="stats-sec-item">
          <div>
            <img src={acStat3Icon} alt="Stats Icon" />
          </div>
          <div>
            <h5>20,000+</h5>
            <p>Schedules</p>
          </div>
        </div>
        <div className="stats-sec-item">
          <div>
            <img src={acStat4Icon} alt="Stats Icon" />
          </div>
          <div>
            <h5>20,000+</h5>
            <p>Courses</p>
          </div>
        </div>
      </section>

      <section className="hero-sec">
        <div className="main-content-grid">
          <div className="story-thumbnail">
            <div className="video-container">
              <video className="js-player" controls preload="metadata">
                <source src={video2} type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="main-content-grid-l">
            <div className="watch-content">
              <h2>Expert & experienced instructors</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper
                mattis, pulvinar dapibus leo.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus,
                luctus nec ullamcorper mattis, pulvinar dapibus leo.Lorem ipsum dolor sit amet, consectetur elit.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper
                mattis, pulvinar dapibus leo.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus,
                luctus nec ullamcorper mattis, pulvinar dapibus leo.Lorem ipsum dolor sit amet, consectetur elit.
              </p>
            </div>

            <div className="watch-cta">
              <div className="watch-cta-l">
                <div className="watch-cta-stack">
                  <div className="watch-cta-thumb main-thumb">
                    <img src={journalImage} alt="Courses" />
                    <div className="watch-cta-overlay">
                      <span>200+<br />Courses</span>
                    </div>
                  </div>
                  <div className="watch-cta-thumb sub-thumb one">
                    <img src={journalImage} alt="Courses preview" />
                  </div>
                  <div className="watch-cta-thumb sub-thumb two">
                    <img src={journalImage} alt="Courses preview" />
                  </div>
                </div>
              </div>
              <div className="watch-cta-r">
                <button type="button">
                  <img src={acNextIcon} alt="Watch more" />
                  <span>Watch more youtube</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="new-content">
        <h2>Our Community Stories</h2>
        <div className="new-content-l">
          <img src={acMailIcon} alt="Mail" />
          <div>
            <h6>Subscribe to our Newsletter</h6>
            <p>Once every day</p>
          </div>
        </div>
      </section>

      <section className="main-content">
        <div className="new-main-content-grid">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="ss-item ss-empty">
              <div className="ss-item-img">
                <div className="skeleton-img" />
              </div>
              <div className="ss-item-text">
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
              </div>
            </div>
          ))}

          {!loading && stories && stories.length > 0 && stories.map((story) => (
            <div
              key={story.id || story._id}
              className="ss-item"
              onClick={() => navigate(`/academia/read-story?id=${story.id || story._id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="ss-item-img">
                  {resolveStoryImage(story.thumbnail) ? <img src={resolveStoryImage(story.thumbnail)} alt="Story Image" /> : null}
              </div>
              <div className="ss-item-text">
                <div className="ss-item-text-h">
                  <div>
                    <img src={acUsIcon} alt="User" />
                    <span>{story.author_name || story.author || 'Admin'}</span>
                  </div>
                  <div>
                    <img src={acMessIcon} alt="Messages" />
                    <span>{story.comments_count || 0}</span>
                  </div>
                </div>
                <h4>{story.title || story.heading || 'Story'}</h4>
                <p>{story.excerpt || story.summary || (story.content ? (story.content.substring(0, 120) + '...') : 'No description')}</p>
                <div className="ss-item-text-f">
                  <div>
                    <img src={acCalIcon} alt="Calendar" />
                    <span>{new Date(story.published_at || story.created_at || Date.now()).toLocaleString()}</span>
                  </div>
                  <button type="button">
                    <img src={acShareIcon} alt="Share" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && (!stories || stories.length === 0) && (
            <div className="ss-empty-state">
              <div className="empty-title">No community stories</div>
              <div className="empty-desc">There are no community stories published yet.</div>
            </div>
          )}
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

export default AcademiaWatch;

