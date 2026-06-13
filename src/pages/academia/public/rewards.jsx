import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Icons & Images ---
import acStat1Icon from '../../../assets/icons/ac-stat1.svg';
import acStat2Icon from '../../../assets/icons/ac-stat2.svg';
import acStat3Icon from '../../../assets/icons/ac-stat3.svg';
import acStat4Icon from '../../../assets/icons/ac-stat4.svg';
import acMailIcon from '../../../assets/icons/ac-mail.png';
import acUsIcon from '../../../assets/icons/ac-us.svg';
import acShareIcon from '../../../assets/icons/ac-share.svg';
import acNonIcon from '../../../assets/icons/ac-non.svg';
import psIcon from '../../../assets/icons/ps.svg';
import pvIcon from '../../../assets/icons/pv.svg';
import pshIcon from '../../../assets/icons/psh.svg';
import pfIcon from '../../../assets/icons/pf.svg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import rewardImage from '../../../assets/imgs/reward.jpg';
import journalImage from '../../../assets/imgs/journal.jpg';
import video2 from '../../../assets/vids/video2.mp4';

import './rewards.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function AcademiaRewards() {
  const navigate = useNavigate();

  // --- State ---
  const [rewardsData, setRewardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // --- Video Player State ---
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressAreaRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const stats = [
    { icon: acStat1Icon, value: '20,000+', label: 'Enrolled Students' },
    { icon: acStat2Icon, value: '1,500+', label: 'Trusted Tutors' },
    { icon: acStat3Icon, value: '10,000+', label: 'Certificates Issued' },
    { icon: acStat4Icon, value: '5,000+', label: 'Active Courses' },
  ];

  // --- Data Fetching ---
  useEffect(() => {
    let mounted = true;

    const fetchRewards = async () => {
      setLoading(true);
      try {
        // Fetch popular courses to display as "Rewards / Top Achievers"
        const res = await fetch(`${API_BASE_URL}/api/courses/public/popular?limit=12`);
        const body = await res.json().catch(() => ({}));
        
        if (!mounted) return;

        const dataList = Array.isArray(body?.data) ? body.data : [];
        
        if (dataList.length > 0) {
          setRewardsData(dataList.map((item, idx) => ({
            id: item.id || idx,
            title: item.title || item.name || 'Achievement',
            users: item.learners_count || item.enrolled_count || '0',
            thumbnail: item.thumbnail_url || item.thumbnail || rewardImage
          })));
        } else {
          // Fallback static data if backend is empty/offline
          setRewardsData(Array.from({ length: 12 }, (_, index) => ({
            id: `static-${index}`,
            title: ['Advanced Mathematics', 'Software Architecture', 'Data Science Honors', 'Business Analytics'][index % 4],
            users: `${(Math.random() * 20 + 1).toFixed(1)}K`,
            thumbnail: rewardImage
          })));
        }
      } catch (error) {
        if (mounted) {
          setRewardsData(Array.from({ length: 12 }, (_, index) => ({
            id: `static-${index}`,
            title: 'Top Achiever Award',
            users: '10K+',
            thumbnail: rewardImage
          })));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRewards();

    return () => { mounted = false; };
  }, []);

  // --- Handlers ---
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    console.log("Subscribing:", newsletterEmail);
    setNewsletterEmail('');
    alert("Subscribed to the newsletter successfully!");
  };

  const handleWatchMore = () => {
    navigate('/academia/watch');
  };

  // --- Custom React Video Player Logic ---
  const formatTime = (timeInSeconds) => {
    if (Number.isNaN(timeInSeconds) || !Number.isFinite(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isDragging) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    
    setCurrentTime(formatTime(current));
    setProgress((current / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(formatTime(videoRef.current.duration));
    setCurrentTime(formatTime(videoRef.current.currentTime));
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  const skipTime = (amount) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += amount;
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

  const handleProgressScrub = (e) => {
    if (!progressAreaRef.current || !videoRef.current) return;
    const rect = progressAreaRef.current.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    
    setProgress(pos * 100);
    videoRef.current.currentTime = pos * videoRef.current.duration;
    setCurrentTime(formatTime(videoRef.current.currentTime));
  };

  const onDragStart = (e) => {
    setIsDragging(true);
    handleProgressScrub(e);
  };

  const onDragMove = (e) => {
    if (isDragging) handleProgressScrub(e);
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onDragEnd);
    } else {
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
    };
  }, [isDragging]);

  const resolveImage = (imgSrc) => {
    if (!imgSrc) return rewardImage;
    if (imgSrc.startsWith('http')) return imgSrc;
    return `${API_BASE_URL}${imgSrc}`;
  };

  return (
    <div className="academia-rewards-page">
      
      {/* Hero Section */}
      <section className="hero-sec">
        <div className="hero-sec-inner">
          <div className="hsi-contents">
            <div className="hsi-contents-h">
              <h1>Academia Rewards</h1>
            </div>
            <div className="hsi-contents-b">
              <p>
                Recognizing excellence in online education. Explore our top-rated programs, celebrate our community achievements, and discover what makes our learners succeed on a global scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-sec">
        {stats.map((stat) => (
          <div key={stat.label} className="stats-sec-item">
            <div>
              <img src={stat.icon} alt="Stats Icon" />
            </div>
            <div>
              <h5>{stat.value}</h5>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Mini Newsletter Banner */}
      <section className="new-content">
        <h2>Our Learners Certificates</h2>
        <div className="new-content-l">
          <img src={acMailIcon} alt="Mail Icon" />
          <div>
            <h6>Subscribe to our Newsletter</h6>
            <p>Get daily updates on top achievers</p>
          </div>
        </div>
      </section>

      {/* Rewards Grid */}
      <section className="main-content">
        <div className="main-content-inner">
          {loading ? (
            <div style={{ padding: '40px', width: '100%', textAlign: 'center', color: '#64748B' }}>Loading rewards data...</div>
          ) : (
            rewardsData.map((reward) => (
              <div key={reward.id} className="reward" style={{ cursor: 'pointer' }}>
                <div className="reward-img">
                  <img src={resolveImage(reward.thumbnail)} alt={reward.title} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                </div>
                <div className="reward-text">
                  <h4>{reward.title}</h4>
                  <div className="reward-footer">
                    <p>
                      <img src={acUsIcon} alt="User" />
                      <span>{reward.users} Enrolled</span>
                    </p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); }}>
                      <img src={acShareIcon} alt="Share" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Custom React Video Player Section */}
      <section className="vid-sec">
        <div className="main-content-grid">
          <div className="story-thumbnail">
            
            <div 
              ref={containerRef} 
              className={`video-container ${isPlaying ? 'playing' : 'paused'}`}
              style={{ position: 'relative', width: '100%', height: '100%', background: '#000', borderRadius: '12px', overflow: 'hidden' }}
            >
              <video 
                ref={videoRef}
                className="js-player" 
                preload="metadata"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnded}
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
              >
                <source src={video2} type="video/mp4" />
              </video>
              
              {/* React UI Layer */}
              <div className="ui-layer">
                <div className="center-controls">
                  <button className="center-btn" type="button" onClick={(e) => { e.stopPropagation(); skipTime(-10); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">10</text>
                    </svg>
                  </button>
                  
                  <button className="center-btn big-play" type="button" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                    {!isPlaying ? (
                      <svg className="icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    ) : (
                      <svg className="icon-pause" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    )}
                  </button>
                  
                  <button className="center-btn" type="button" onClick={(e) => { e.stopPropagation(); skipTime(10); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">10</text>
                    </svg>
                  </button>
                </div>

                <div className="bottom-controls">
                  <div className="left-pill">
                    <button className="icon-btn" type="button" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                      {!isPlaying ? (
                        <img className="icon-play" src={psIcon} alt="Play" />
                      ) : (
                        <svg className="icon-pause" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', color: '#fff' }}><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                      )}
                    </button>
                    <button className="icon-btn" type="button" onClick={toggleMute}>
                      {!isMuted ? (
                        <img className="icon-vol-on" src={pvIcon} alt="Sound on" />
                      ) : (
                        <svg className="icon-vol-off" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', color: '#fff' }}><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                      )}
                    </button>
                    <div className="time-text">{currentTime} / {duration}</div>
                  </div>
                  
                  <div className="right-actions">
                    <button className="icon-btn" type="button" onClick={(e) => e.stopPropagation()}>
                      <img className="icon-vol-on" src={pshIcon} alt="Share" />
                    </button>
                    <button className="icon-btn" type="button" onClick={toggleFullscreen}>
                      <img className="icon-vol-on" src={pfIcon} alt="Fullscreen" />
                    </button>
                  </div>
                  
                  <div className="progress-area" ref={progressAreaRef} onMouseDown={onDragStart} style={{ cursor: 'pointer' }}>
                    <div className={`progress-fill ${isDragging ? 'no-transition' : ''}`} style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Right Text Content */}
          <div className="main-content-grid-l">
            <div className="watch-content">
              <h2>Expert &amp; experienced instructors</h2>
              <p>
                Our platform connects you with the brightest minds across multiple disciplines. Dive deep into advanced concepts, hands-on projects, and real-world applications guided by professionals who have mastered their craft.
              </p>
              <p>
                Whether you are a beginner looking for fundamentals or a seasoned professional seeking to sharpen your skills, our rewards program ensures that your dedication and hard work are recognized and celebrated.
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
                <button type="button" onClick={handleWatchMore}>
                  <img src={acNonIcon} alt="Notification" />
                  <span>Watch more videos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer Newsletter Signup */}
      <section className="newsletter-sec">
        <div className="newsletter-sec-l">
          <h3>Newsletter - Stay tuned and get the latest update</h3>
          <p>Join our mailing list to receive exclusive offers and weekly course recommendations.</p>
        </div>
        <div className="newsletter-sec-r">
          <form onSubmit={handleNewsletterSubmit}>
            <img src={acSmsIcon} alt="Message" className="ac-sms" />
            <input 
              type="email" 
              placeholder="Enter email address" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required 
            />
            <button type="submit">
              <img src={acSendIcon} alt="Submit" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AcademiaRewards;