<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Academia</title>
	<link href="../css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="../css/header.css">
	<link rel="stylesheet" type="text/css" href="../css/footer.css">
	<link rel="stylesheet" type="text/css" href="index.css">
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
		<div class="hero-sec-inner-top">
			<div class="hero-sec-inner-l">
				<img src="../assets/imgs/aca.png" alt="Academia Image">
			</div>
			<div class="hero-sec-inner-r">
				<div class="hero-sec-inner-r-t">
					<button type="button" onclick="window.location.href='/gonaraza/academia/journals'">
						<img src="../assets/icons/ac-plus.svg" alt="Plus Icon">
						<span>Post your project</span>
					</button>
					<button type="button" onclick="window.location.href='/gonaraza/academia/courses'">
						<img src="../assets/icons/book-open.svg" alt="Plus Icon">
						<span>View Courses</span>
					</button>
				</div>
				<div class="hero-sec-inner-r-b">
					<div class="hero-sec-inner-r-b-item">
						<div>
							<img src="../assets/icons/ac-1.svg" alt="Icon">
						</div>
						<div>
							<h6>Online Courses</h6>
							<p>Your transactions are protected with top-grade encryption — safe, fast, and hassle-free.</p>
						</div>
					</div>
					<div class="hero-sec-inner-r-b-item">
						<div>
							<img src="../assets/icons/ac-2.svg" alt="Icon">
						</div>
						<div>
							<h6>Earn Certificates</h6>
							<p>Your transactions are protected with top-grade encryption — safe, fast, and hassle-free.</p>
						</div>
					</div>
					<div class="hero-sec-inner-r-b-item">
						<div>
							<img src="../assets/icons/ac-3.svg" alt="Icon">
						</div>
						<div>
							<h6>Learn with Expert</h6>
							<p>Your transactions are protected with top-grade encryption — safe, fast, and hassle-free.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="hero-sec-inner-bottom">
			<div class="hero-sec-inner-bottom-h">
				<h2>Best Online Education Expertise</h2>
			</div>
			<div>
				<p>Lorem ipsum dolor sit, amet consectetur adipisicing elit.
					 Vero praesentium quasi architecto sapiente officia cons
					 ectetur blanditiis doloribus odit quo distinctio nostrum la
					 borum, dignissimos nam repellat? Animi adipisci quam odit ad.</p>
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


<section class="journals-sec">
	<div class="sec-h">
		<p>Orientation Guide projects</p>
		<h1>All Courses & Journals</h1>
	</div>

	<div class="swiper journalsSwiper">
		<div class="swiper-wrapper">

			<?php for ($i = 0; $i < 8; $i++): ?>
				<div class="swiper-slide">
					<div class="js-item" onclick="window.location.href='/gonaraza/academia/read-story'" style="cursor: pointer;">
						<div class="js-item-img">
							<img src="../assets/imgs/jr.jpg" alt="Journal Image">
						</div>
						<div class="js-item-text">
							<h6>
								Rwanda Unleashed Americans - 23 year old Justine Byiringiro eliminates americans over 230KM per hour, winning gold medal 2028
							</h6>
							<div>
								<span>Oct 19, 2025 07:50 AM</span>
								<button>
									<img src="../assets/icons/ac-wsh.svg" alt="Share">
								</button>
							</div>
						</div>
					</div>
				</div>
			<?php endfor; ?>

		</div>

		<div class="swiper-button-next js-btn"></div>
		<div class="swiper-button-prev js-btn"></div>

	</div>
</section>


<section class="popular-sec">
	<div class="sec-h">
		<p>Explore our top research interests</p>
		<h1>Popular Courses </h1>
	</div>
	<div class="popular-sec-contents">
		<div class="swiper psc-swiper">
			<div class="swiper-wrapper">
				<?php for ($i = 0; $i < 5; $i++): ?>
					<div class="swiper-slide psc-card">
						<div class="psc-card-h">
							<div class="psc-card-h-l">
								<h5>Economics </h5>
								<p>
									<span>11.34M</span>
									<small>Followers</small>
								</p>
							</div>
							<div class="psc-card-h-r">
								<button>
									<span>Follow</span>
									<img src="../assets/icons/ac-p1.svg" alt="Plus">
								</button>
							</div>
						</div>
						<div class="psc-card-b">
							<div class="psc-card-b-item">
								<h6>11.34M</h6>
								<p>Authors</p>
							</div>
							<div class="psc-card-b-item">
								<h6>234K</h6>
								<p>Learners</p>
							</div>
							<div class="psc-card-b-item">
								<h6>11.34M</h6>
								<p>Papers</p>
							</div>
						</div>
						<div class="psc-card-f">
							<button type="button" onclick="window.location.href='/gonaraza/academia/course-part'">View courses</button>
						</div>
					</div>
				<?php endfor; ?>
				<div class="swiper-slide psc-last-card">
					<h3>1000+ Popular course</h3>
					<div class="psc-last-card-imgs">
						<div class="psc-last-card-img">
							<img src="../assets/icons/dummy.svg" alt="Icon">
						</div>
						<div class="psc-last-card-img">
							<img src="../assets/icons/dummy.svg" alt="Icon">
						</div>
						<div class="psc-last-card-img">
							<img src="../assets/icons/dummy.svg" alt="Icon">
						</div>
						<div class="psc-last-card-number">
							9+
						</div>
					</div>
					<div class="psc-last-card-btn">
						<button type="button" onclick="window.location.href='/gonaraza/academia/courses'">Explore Courses</button>
					</div>
				</div>
			</div>
			<div class="swiper-pagination psc-pages"></div>
		</div>
	</div>
</section>


<section class="online-sec">
	<div class="sec-h">
		<p>Courses</p>
		<h1>Online Courses</h1>
	</div>
	<div class="online-sec-contents">
		<?php for ($i = 0; $i < 4; $i++): ?>
		<div class="osc-item" onclick="window.location.href='/gonaraza/academia/course-part'" style="cursor: pointer;">
			<div class="osc-item-img">
				<img src="../assets/imgs/ac-on.jpg" alt="Online Course">
			</div>
			<div class="osc-item-text">
				<div class="osc-item-text-float">
					<p>$5 / Per Month</p>
				</div>
				<div>
					<h6>Software Development</h6>
					<small>Emma Furgreance</small>
				</div>
				<div>
					<p>Learn the fundamentals of software development and build your first application.</p>
				</div>
				<div>
					<small>Starts : Jan 4th 2026</small>
					<button type="button" onclick="event.stopPropagation(); window.location.href='/gonaraza/academia/course-part';">
						<img src="../assets/icons/ac-en.svg" alt="Enroll">
					</button>
				</div>
			</div>
		</div>
		<?php endfor; ?>
	</div>
	<div class="sec-CTA">
		<button type="button" onclick="window.location.href='/gonaraza/academia/courses'">
			<span>View More</span>
			<img src="../assets/icons/ac-next.svg" alt="Next">
		</button>
	</div>
</section>	


<section class="free-sec">
	<div class="sec-h">
		<p>Courses</p>
		<h1>Free Courses </h1>
	</div>
	<div class="free-sec-contents">
		<?php for ($i = 0; $i < 5; $i++): ?>
			<div class="fsc-item" onclick="window.location.href='/gonaraza/academia/course-part'" style="cursor: pointer;">
				<div class="fsc-item-img">
					<img src="../assets/imgs/ac-on.jpg" alt="Free Course">
				</div>
				<div class="fsc-item-text">
					<h6>Software Development</h6>
					<small>Emma Furgreance</small>
				</div>
			</div>
		<?php endfor; ?>
	</div>
	<div class="sec-CTA">
		<button type="button" onclick="window.location.href='/gonaraza/academia/courses?type=free'">
			<span>View More</span>
			<img src="../assets/icons/ac-next.svg" alt="Next">
		</button>
	</div>
</section>	


<section class="choice-sec">
	<img src="../assets/icons/ac-l.svg" class="ac-l">
	<img src="../assets/icons/rw-l.svg" class="rw-l">
	<div class="sec-h">
		<p>Abroad Academia Education</p>
		<h1>Why Choose US</h1>
	</div>
	<div class="choice-sec-inner">
		<div class="choice-sec-inner-l">
			<div>
				<img src="../assets/icons/ac-aca.svg" alt="Academia Icon">
			</div>
			<div>
				<h4>Get access to millions of research papers and stay informed with the important topics around the world.</h4>
			</div>
			<div>
				<button type="button" onclick="window.location.href='/gonaraza/academia/journals'">
					<span>Explore More</span>
					<img src="../assets/icons/ac-nnex.svg" alt="View">
				</button>
			</div>
		</div>
		<div class="choice-sec-inner-r">
			<div class="csir-item">
				<div class="csir-item-icon">
					<img src="../assets/icons/ac-aca2.svg" alt="Icon">
				</div>
				<div class="csir-item-text">
					<h6>Expert & experienced instructors</h6>
					<p>Our instructors are experts in their fields and have years of experience teaching.</p>
				</div>
			</div>
			<div class="csir-item">
				<div class="csir-item-icon">
					<img src="../assets/icons/ac-aca3.svg" alt="Icon">
				</div>
				<div class="csir-item-text">
					<h6>Lifetime free access</h6>
					<p>Our instructors are experts in their fields and have years of experience teaching.</p>
				</div>
			</div>
			<div class="csir-item">
				<div class="csir-item-icon">
					<img src="../assets/icons/ac-aca4.svg" alt="Icon">
				</div>
				<div class="csir-item-text">
					<h6>Dedicated support</h6>
					<p>Our instructors are experts in their fields and have years of experience teaching.</p>
				</div>
			</div>
		</div>
	</div>
</section>


<section class="stories-sec">
	<div class="sec-h">
		<p>Blogs</p>
		<h1>Community stories</h1>
	</div>
	<div class="stories-sec-contents">
		<div class="swiper ss-swiper">
			<div class="swiper-wrapper">
				<?php for ($i = 0; $i < 4; $i++): ?>
					<div class="swiper-slide">
						<div class="ss-item" onclick="window.location.href='/gonaraza/academia/read-story'" style="cursor: pointer;">
							<div class="ss-item-img">
								<img src="../assets/imgs/ac-str.jpg" alt="Story Image">
							</div>
							<div class="ss-item-text">
								<div class="ss-item-text-h">
									<div>
										<img src="../assets/icons/ac-us.svg" alt="User">
										<span>Admin</span>
									</div>
									<div>
										<img src="../assets/icons/ac-mess.svg" alt="User">
										<span>3</span>
									</div>
								</div>
								<h4>Build your dream software & engineering career</h4>
								<p>A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>
								<div class="ss-item-text-f">
									<div>
										<img src="../assets/icons/ac-cal.svg" alt="Calendar">
										<span>Oct 19, 2025 07:50 AM</span>
									</div>
									<button>
										<img src="../assets/icons/ac-share.svg" alt="Calendar">
									</button>
								</div>
							</div>
						</div>
					</div>
				<?php endfor; ?>
			</div>
			<div class="swiper-button-next ss-btn"></div>
			<div class="swiper-button-prev ss-btn"></div>
		</div>
	</div>
	<div class="sec-CTA">
		<button type="button" onclick="window.location.href='/gonaraza/academia/watch'">
			<span>View More</span>
			<img src="../assets/icons/ac-next.svg" alt="Next">
		</button>
	</div>
</section>


<section class="testimonials-sec">
	<div class="sec-h">
		<p>Testimonials</p>
		<h1>Our Successful stories</h1>
	</div>
	<div class="testimonials-sec-contents">
		<div class="swiper tsc-swiper">
			<div class="swiper-wrapper">
				<?php for ($i = 0; $i < 5; $i++): ?>
					<div class="swiper-slide tsc-card">
						<div class="tsc-card-h">
							<div class="tsc-card-h-l">
								<img src="../assets/imgs/prof.jpg" alt="User">
							</div>
							<div class="tsc-card-h-r">
								<h5>Roger Scott</h5>
								<p>Student</p>
							</div>
						</div>
						<div class="tsc-card-text">
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
						</div>
					</div>
				<?php endfor; ?>
			</div>
			<div class="swiper-pagination tsc-pages"></div>
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
  const Pswiper = new Swiper('.psc-swiper', {
    spaceBetween: 20,
    loop: false,
	grabCursor: true,
	pagination: {
	  el: '.swiper-pagination',
	  clickable: true,
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
</script>

<script>
  const sSwiper = new Swiper('.ss-swiper', {
    spaceBetween: 20,
    loop: false,
	grabCursor: true,
	breakpoints: {
		0: {
			slidesPerView: 1,
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
		},
		769: {
			slidesPerView: 4,
		},
	},
  });
</script>
<script>
  const tSwiper = new Swiper('.tsc-swiper', {
    spaceBetween: 20,
    loop: false,
	grabCursor: true,
	pagination: {
	  el: '.swiper-pagination',
	  clickable: true,
	},
	breakpoints: {
		0: {
			slidesPerView: 1,
		},
		769: {
			slidesPerView: 3,
		},
	},
  });
</script>

<script>
	const jSwiper = new Swiper(".journalsSwiper", {
		effect: "coverflow",
		grabCursor: true,
		centeredSlides: true,
		slidesPerView: "auto",
		loop: true,

		coverflowEffect: {
			rotate: 0,
			stretch: 0,
			depth: 200,
			modifier: 1.5,
			slideShadows: false,
		},

		navigation: {
			nextEl: ".swiper-button-next",
			prevEl: ".swiper-button-prev",
		},

		pagination: {
			el: ".swiper-pagination",
			clickable: true,
		},

		breakpoints: {
			0: {
				slidesPerView: 1.2,
			},
			768: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 3,
			},
		},
	});
</script>

</body>
</html>