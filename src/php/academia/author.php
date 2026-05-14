<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Academia</title>
	<link href="../css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="../css/header.css">
	<link rel="stylesheet" type="text/css" href="../css/footer.css">
	<link rel="stylesheet" type="text/css" href="author.css">
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
		<div class="hsi-img">
			<img src="../assets/imgs/prof.jpg">
		</div>
		<div class="hsi-text">
			<div>
				<h6>Xavera KABARANGA </h6>
				<p>|</p>
				<p>UI/UX Designer</p>
			</div>
			<div>
				<p>Member Since: January 24, 2021</p>
			</div>
		</div>
	</div>
</section>

<section class="main-content">
	<div class="main-content-grid">
		<div class="main-content-grid-l">
			<div class="mcgl-t">
				<div class="mcgl-t-1">
					<div></div>
					<p>Available Now</p>
				</div>
				<div class="mcgl-t-items">
					<div class="mcgl-t-item">
						<img src="../assets/icons/ac-ued.svg" alt="">
						<span>UI / UX Design</span>
					</div>
					<div class="mcgl-t-item">
						<img src="../assets/icons/ac-bri.svg" alt="">
						<span>6 yrs experience</span>
					</div>
					<div class="mcgl-t-item">
						<img src="../assets/icons/ac-geo.svg" alt="">
						<span>Kigali, Rwanda</span>
					</div>
				</div>
			</div>

			<div class="mcgl-actions">
				<button type="button">
					<img src="../assets/icons/ac-pp.svg">
					<span>Follow</span>
				</button>
				<button type="button">
					<span>Get In Touch</span>
					<img src="../assets/icons/ac-lk.svg">
				</button>
			</div>

			<div class="mcgl-about">
				<h4>About</h4>
				<p>
					Statistics is the branch of mathematics that deals with the collection, analysis, interpretation,
					presentation, and organization of data. It provides methodologies for making inferences about
					populations based on sample data, enabling researchers to quantify uncertainty and variability
					in empirical findings...
					<a href="/gonaraza/academia/read-journal">Read more</a>
				</p>
			</div>

			<div class="mcgl-project-stats">
				<h4>Projects Stats</h4>
				<div class="mcgl-project-stats-list">
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

			<div class="mcgl-tools-skills">
				<h4>Tools &amp; Skills</h4>
				<ul>
					<li>Adobe Illustrator</li>
					<li>Adobe Photoshop</li>
					<li>Coding Skills (CSS, HTML &amp; React)</li>
					<li>Adobe InDesign</li>
				</ul>
			</div>
		</div>
		<div class="main-content-grid-r">
			<?php for ($i = 0; $i < 6; $i++): ?>
			<div class="journal" onclick="window.location.href='/gonaraza/academia/read-journal'" style="cursor: pointer;">
				<div class="journal-img">
					<img src="../assets/imgs/journal.jpg">
				</div>
				<div class="journal-info">
					<div class="journal-info-h">
						<div>
							<span>By</span>
							<p>Fabrice</p>
						</div>
						<div>
							<div>
								<button>
									<img src="../assets/icons/ac-her2.svg">
									<span>10.6K</span>
								</button>
								<button>
									<img src="../assets/icons/ac-eye.svg">
									<span>10.6K</span>
								</button>
							</div>
						</div>
					</div>
					<div class="journal-info-b">
						<p>Build your software & engineering dream career</p>
					</div>
				</div>
			</div>
			<div class="journal" onclick="window.location.href='/gonaraza/academia/read-journal'" style="cursor: pointer;">
				<div class="journal-img">
					<img src="../assets/imgs/journal.jpg">
				</div>
				<div class="journal-info">
					<div class="journal-info-h">
						<div>
							<span>By</span>
							<p>Fabrice</p>
						</div>
						<div>
							<div>
								<button>
									<img src="../assets/icons/ac-her1.svg">
									<span>10.6K</span>
								</button>
								<button>
									<img src="../assets/icons/ac-eye.svg">
									<span>10.6K</span>
								</button>
							</div>
						</div>
					</div>
					<div class="journal-info-b">
						<p>Build your software & engineering dream career</p>
					</div>
				</div>
			</div>
			<?php endfor; ?>
		</div>
	</div>
</section>

<section class="main-content">
	<div class="more-from">
		<div>
			<h3>More from</h3>
			<div class="more-from-p">
				<div class="more-from-img">
					<img src="../assets/imgs/prof.jpg">
				</div>
				<div class="more-from-text">
					<h6>Team Owners</h6>
					<button>Follow All</button>
				</div>
			</div>
		</div>
		<div>
			<button>
				<span>Hire us</span>
				<img src="../assets/icons/ac-gt.svg">
			</button>
		</div>
	</div>
	<div class="swiper more-from-grid">
		<div class="swiper-wrapper">
			<?php for ($i = 0; $i < 5; $i++): ?>
			<div class="swiper-slide">
				<div class="journal">
					<div class="journal-img">
						<img src="../assets/imgs/journal.jpg">
					</div>
					<div class="journal-info">
						<div class="journal-info-h">
							<div>
								<span>By</span>
								<p>Fabrice</p>
							</div>
							<div>
								<div>
									<button>
										<img src="../assets/icons/ac-her2.svg">
										<span>10.6K</span>
									</button>
									<button>
										<img src="../assets/icons/ac-eye.svg">
										<span>10.6K</span>
									</button>
								</div>
							</div>
						</div>
						<div class="journal-info-b">
							<p>Build your software & engineering dream career</p>
						</div>
					</div>
				</div>
			</div>
			<div class="swiper-slide">
				<div class="journal">
					<div class="journal-img">
						<img src="../assets/imgs/journal.jpg">
					</div>
					<div class="journal-info">
						<div class="journal-info-h">
							<div>
								<span>By</span>
								<p>Fabrice</p>
							</div>
							<div>
								<div>
									<button>
										<img src="../assets/icons/ac-her1.svg">
										<span>10.6K</span>
									</button>
									<button>
										<img src="../assets/icons/ac-eye.svg">
										<span>10.6K</span>
									</button>
								</div>
							</div>
						</div>
						<div class="journal-info-b">
							<p>Build your software & engineering dream career</p>
						</div>
					</div>
				</div>
			</div>
			<?php endfor; ?>
		</div>
		<div class="swiper-button-prev js-btn"></div>
		<div class="swiper-button-next js-btn"></div>
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
const moreFromSwiper = new Swiper('.more-from-grid', {
    slidesPerView: 'auto',
    spaceBetween: 20,
    pagination: {
        el: '.more-from-grid .swiper-pagination',
        clickable: true,
    },
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
</script>

</body>
</html>