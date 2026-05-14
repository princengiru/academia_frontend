<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Academia</title>
	<link href="../css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="../css/header.css">
	<link rel="stylesheet" type="text/css" href="../css/footer.css">
	<link rel="stylesheet" type="text/css" href="rewards.css">
	<link rel="stylesheet" type="text/css" href="respo.css">
	<link rel="stylesheet" href="../library/swiper/swiper-bundle.min.css" />
	<style>
		/* Fonts with font-display: swap to prevent blocking */
		@font-face {
			font-family: 'Montserrat';
			src: url('../fonts/montserrat/Montserrat-VariableFont_wght.ttf') format('truetype');
		}

	</style>
</head>
<body>

<?php include '../components/header.php'; ?>

<section class="hero-sec">
	<div class="hero-sec-inner">
		<div class="hsi-contents">
			<div class="hsi-contents-h">
				<h1>Courses</h1>
			</div>
			<div class="hsi-contents-b">
				<p>Lorem ipsum dolor sit amet consectetur adipisicing elit.
					Nobis eaque sit aperiam? Hic eaque unde nobis nisi aut
					minus quas quod aliquid et minima. Omnis quidem iure ex itaque nemo
					Nobis eaque sit aperiam? Hic eaque unde nobis nisi aut
					minus quas quod aliquid et minima. Omnis quidem iure ex itaque nemo!
				</p>
			</div>
		</div>
	</div>
</section>

<section class="stats-sec">
	<div class="stats-sec-item">
		<div>
			<img src="../assets/icons/ac-stat1.svg" alt="Stats Icon">
		</div>
		<div>
			<h5>20,000+</h5>
			<p>Enrolled Students</p>
		</div>
	</div>
	<div class="stats-sec-item">
		<div>
			<img src="../assets/icons/ac-stat2.svg" alt="Stats Icon">
		</div>
		<div>
			<h5>20,000+</h5>
			<p>Trusted Tutors</p>
		</div>
	</div>
	<div class="stats-sec-item">
		<div>
			<img src="../assets/icons/ac-stat3.svg" alt="Stats Icon">
		</div>
		<div>
			<h5>20,000+</h5>
			<p>Schedules</p>
		</div>
	</div>
	<div class="stats-sec-item">
		<div>
			<img src="../assets/icons/ac-stat4.svg" alt="Stats Icon">
		</div>
		<div>
			<h5>20,000+</h5>
			<p>Courses</p>
		</div>
	</div>
</section>

<section class="new-content">
    <h2>Our Learners Certificate</h2>
    <div class="new-content-l">
        <img src="../assets/icons/ac-mail.png">
        <div>
            <h6>Subscribe to our Newsletter</h6>
            <p>Once every day</p>
        </div>
    </div>
</section>

<section class="main-content">
	<div class="main-content-inner">
		<?php for ($i = 0; $i < 12; $i++): ?>
		<div class="reward">
			<div class="reward-img">
				<img src="../assets/imgs/reward.jpg">
			</div>
			<div class="reward-text">
				<h4>Mathematics</h4>
				<div class="reward-footer">
					<p>
						<img src="../assets/icons/ac-us.svg" alt="User">
						<span>23.7K</span>
					</p>
					<button><img src="../assets/icons/ac-share.svg" alt="Calendar"></button>
				</div>
			</div>
		</div>
		<?php endfor; ?> 
	</div>
</section>


<section class="vid-sec">
	<div class="main-content-grid">
		<div class="story-thumbnail">
			<div class="video-container">
		        <video class="js-player" controls preload="metadata">
		        	<source src="../assets/vids/video2.mp4" type="video/mp4">
		        </video>
			</div>
		</div>
		<div class="main-content-grid-l">
                <div class="watch-content">
                    <h2>Expert &amp; experienced instructors</h2>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis,
                        pulvinar dapibus leo.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
                        ullamcorper mattis, pulvinar dapibus leo.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
                        tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis,
                        pulvinar dapibus leo.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
                        ullamcorper mattis, pulvinar dapibus leo.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
                        tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.Lorem ipsum dolor sit amet, consectetur
                        adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
                    </p>
                </div>

                <div class="watch-cta">
                    <div class="watch-cta-l">
                        <div class="watch-cta-stack">
                            <div class="watch-cta-thumb main-thumb">
                                <img src="../assets/imgs/journal.jpg" alt="Courses">
                                <div class="watch-cta-overlay">
                                    <span>200+<br>Courses</span>
                                </div>
                            </div>
                            <div class="watch-cta-thumb sub-thumb one">
                                <img src="../assets/imgs/journal.jpg" alt="Courses preview">
                            </div>
                            <div class="watch-cta-thumb sub-thumb two">
                                <img src="../assets/imgs/journal.jpg" alt="Courses preview">
                            </div>
                        </div>
                    </div>
                    <div class="watch-cta-r">
                        <button type="button">
                            <img src="../assets/icons/ac-non.svg" alt="Notification">
                            <span>Watch more youtube</span>
                        </button>
                    </div>
                </div>
		</div>
	</div>
</section>

<section class="newsletter-sec">
	<div class="newsletter-sec-l">
		<h3>Newsletter - Stay tune and get the latest update</h3>
		<p>Far far away, behind the word mountains</p>
	</div>
	<div class="newsletter-sec-r">
		<form>
			<img src="../assets/icons/ac-sms.svg" alt="Message" class="ac-sms">
			<input type="email" placeholder="Enter email address">
			<button type="submit">
				<img src="../assets/icons/ac-send.svg" alt="Next">
			</button>
		</form>
	</div>
</section>

<?php include '../components/footer.php'; ?>
<script src="../library/swiper/swiper-bundle.min.js"></script>
<script>
document.addEventListener("DOMContentLoaded", () => {
    // 1. Select all containers
    const containers = document.querySelectorAll('.story-thumbnail');

    containers.forEach(container => {
        const video = container.querySelector('video');
        if (!video) return;

        // Hide native controls
        video.controls = false;
        container.classList.add('paused'); 

        // 2. Inject the Exact Design HTML
        const ui = document.createElement('div');
        ui.classList.add('ui-layer');
        ui.innerHTML = `
            <div class="center-controls">
                <button class="center-btn" data-action="rewind">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <text x="12" y="16" text-anchor="middle" font-size="8" fill="currentColor" stroke="none" font-weight="bold">10</text>
                    </svg>
                </button>
                
                <button class="center-btn big-play" data-action="toggle">
                    <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>

                <button class="center-btn" data-action="forward">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <text x="12" y="16" text-anchor="middle" font-size="8" fill="currentColor" stroke="none" font-weight="bold">10</text>
                    </svg>
                </button>
            </div>

            <div class="bottom-controls">
                
                <div class="left-pill">
                    <button class="icon-btn" data-action="toggle-mini">
                        <img class="icon-play" src="../assets/icons/ps.svg">
                        <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </button>
                    
                    <button class="icon-btn" data-action="mute">
                        <img class="icon-vol-on" src="../assets/icons/pv.svg">
                        <svg class="icon-vol-off" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                    </button>

                    <div class="time-text">0:00 / 0:00</div>
                </div>

                <div class="right-actions">
                    <button class="icon-btn" data-action="share">
                        <img class="icon-vol-on" src="../assets/icons/psh.svg">
                    </button>
                    <button class="icon-btn" data-action="fullscreen">
                        <img class="icon-vol-on" src="../assets/icons/pf.svg">
                    </button>
                </div>

                <div class="progress-area">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;
        container.querySelector('.video-container').appendChild(ui);

        // 3. Logic Elements
        const toggleBtns = ui.querySelectorAll('[data-action="toggle"], [data-action="toggle-mini"]');
        const rewindBtn = ui.querySelector('[data-action="rewind"]');
        const forwardBtn = ui.querySelector('[data-action="forward"]');
        const muteBtn = ui.querySelector('[data-action="mute"]');
        const fsBtn = ui.querySelector('[data-action="fullscreen"]');
        const timeDisplay = ui.querySelector('.time-text');
        const progressArea = ui.querySelector('.progress-area');
        const progressFill = ui.querySelector('.progress-fill');

        // 4. Helper: Format Time
        const formatTime = (s) => {
            if(isNaN(s) || !isFinite(s)) return "0:00";
            const min = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return `${min}:${sec < 10 ? '0' : ''}${sec}`;
        };

        // 5. Play / Pause Logic
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

        const updateIcons = () => {
            const paused = video.paused;
            ui.querySelectorAll('.icon-play').forEach(i => i.style.display = paused ? 'block' : 'none');
            ui.querySelectorAll('.icon-pause').forEach(i => i.style.display = paused ? 'none' : 'block');
        };

        // 6. Events
        toggleBtns.forEach(btn => btn.addEventListener('click', togglePlay));
        video.addEventListener('click', togglePlay); 

        rewindBtn.addEventListener('click', (e) => { e.stopPropagation(); video.currentTime -= 10; });
        forwardBtn.addEventListener('click', (e) => { e.stopPropagation(); video.currentTime += 10; });

        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.muted = !video.muted;
            ui.querySelector('.icon-vol-on').style.display = video.muted ? 'none' : 'block';
            ui.querySelector('.icon-vol-off').style.display = video.muted ? 'block' : 'none';
        });

        fsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(err => console.log(err));
            } else {
                document.exitFullscreen();
            }
        });

        // --- NEW: Handle Video End (Replay Mode) ---
        video.addEventListener('ended', () => {
            container.classList.remove('playing');
            container.classList.add('paused'); // Show controls again
            video.currentTime = 0; // Reset to start
            progressFill.style.width = '0%'; // Reset bar
            updateIcons(); // Show play button
        });

        // --- NEW: Handle Initial Duration Display ---
        video.addEventListener('loadedmetadata', () => {
            timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        });
        
        // Check if data is already loaded (for cached videos)
        if (video.readyState >= 1) {
            timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        }

        // 7. SMOOTH PROGRESS BAR LOGIC
        video.addEventListener('timeupdate', () => {
            if(!isDragging) {
                const percent = (video.currentTime / video.duration) * 100;
                progressFill.style.width = `${percent}%`;
                timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
            }
        });

        // DRAG / SCRUB LOGIC
        let isDragging = false;

        const scrub = (e) => {
            const rect = progressArea.getBoundingClientRect();
            let pos = (e.clientX - rect.left) / rect.width;
            pos = Math.max(0, Math.min(1, pos));
            
            progressFill.style.width = `${pos * 100}%`;
            
            const targetTime = pos * video.duration;
            timeDisplay.textContent = `${formatTime(targetTime)} / ${formatTime(video.duration)}`;
            
            return targetTime;
        };

        progressArea.addEventListener('mousedown', (e) => {
            isDragging = true;
            progressFill.classList.add('no-transition');
            scrub(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                scrub(e);
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (isDragging) {
                const targetTime = scrub(e);
                video.currentTime = targetTime; 
                isDragging = false;
                setTimeout(() => {
                    progressFill.classList.remove('no-transition');
                }, 50); 
            }
        });
    });
});
</script>
</body>
</html>