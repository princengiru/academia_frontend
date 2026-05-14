<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Academia</title>
	<link href="../css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="../css/header.css">
	<link rel="stylesheet" type="text/css" href="../css/footer.css">
	<link rel="stylesheet" type="text/css" href="courses.css">
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

<section class="journals-sec">
	<div class="sec-h">
		<h1>Programs & Courses </h1>
		<p>Explore our top research interests</p>
	</div>
</section>

<section class="main-content">

	<div class="tab-content" id="myTabContent">
	    <div class="" id="ns-jobs-tab-pane" role="tabpanel" aria-labelledby="ns-jobs-tab" tabindex="0">
	    	<div class="div-h">
				<div class="dropdown filter-drop">
					<button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
						<div>
							<img src="../assets/icons/ac-ff.svg" alt="">
							<span>All Courses</span>
						</div>
					</button>
					<ul class="dropdown-menu">
						<li class="dropdown-item active">
							<a href="/gonaraza/academia/courses?type=all">All Courses</a>
						</li>
						<li class="dropdown-item">
							<a href="/gonaraza/academia/courses?type=certificates">Certificates</a>
						</li>
						<li class="dropdown-item">
							<a href="/gonaraza/academia/courses?type=diplomas">Diplomas</a>
						</li>
						<li class="dropdown-item">
							<a href="/gonaraza/academia/courses?type=degrees">Degrees</a>
						</li>
						<li class="dropdown-item">
							<a href="/gonaraza/academia/courses?type=workshops">Workshops</a>
						</li>
					</ul>
				</div>
				<div class="div-h-r">
					<div class="div-h-r-s">
						<input type="search" placeholder="Search any projects...">
						<div class="div-h-r-s-f">
							<button class="active">All</button>
							<button>Free</button>
							<button>Paid</button>
							<div class="div-h-r-s-f-f">
								<div class="dropdown">
									<button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
										<div>
											<img src="../assets/icons/ac-fi.svg">
											<span>Filters</span>
										</div>
									</button>
									<ul class="dropdown-menu">
										<li class="dropdown-item active">
											<a href="/gonaraza/academia/courses?sort=newest">Newest</a>
										</li>
										<li class="dropdown-item">
											<a href="/gonaraza/academia/courses?sort=top-papers">Top papers</a>
										</li>
										<li class="dropdown-item">
											<a href="/gonaraza/academia/courses?sort=past-papers">Past Papers</a>
										</li>
										<li class="dropdown-item">
											<a href="/gonaraza/academia/courses?sort=most-downloaded">Most Downloaded</a>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="filters-grid">
				<div class="filters">
					<div class="accordion" id="courseFilterAccordion">

					    <div class="accordion-item">
					        <h2 class="accordion-header" id="mathScienceHeading">
					            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#mathScienceCollapse" aria-expanded="true" aria-controls="mathScienceCollapse">
					                Mathematics & Science
					            </button>
					        </h2>
					        <div id="mathScienceCollapse" class="accordion-collapse collapse show" aria-labelledby="mathScienceHeading">
					            <div class="accordion-body">
					                <div class="form-stick">
					                    <input class="form-stick-input" type="checkbox" id="algebra" checked>
					                    <label class="form-stick-label" for="algebra">Algebra</label>
					                    <span>410</span>
					                </div>
					                <div class="form-stick">
					                    <input class="form-stick-input" type="checkbox" id="calculus">
					                    <label class="form-stick-label" for="calculus">Calculus</label>
					                    <span>12</span>
					                </div>
					                <div class="form-stick">
					                    <input class="form-stick-input" type="checkbox" id="compMath">
					                    <label class="form-stick-label" for="compMath">Computational Math</label>
					                    <span>2,899</span>
					                </div>
					                <div class="form-stick">
					                    <input class="form-stick-input" type="checkbox" id="appliedMath">
					                    <label class="form-stick-label" for="appliedMath">Applied Math</label>
					                    <span>23</span>
					                </div>
					                <div class="form-stick">
					                    <input class="form-stick-input" type="checkbox" id="funcAnalysis">
					                    <label class="form-stick-label" for="funcAnalysis">Functional analysis</label>
					                    <span>567</span>
					                </div>
					                <div class="form-stick">
					                    <input class="form-stick-input" type="checkbox" id="geometry">
					                    <label class="form-stick-label" for="geometry">Geometry</label>
					                    <span>1,099</span>
					                </div>
					                <button style="background: none; border: none; color: #8B5CF6; cursor: pointer; padding: 0;">Show more</button>
					            </div>
					        </div>
					    </div>

					    <div class="accordion-item">
					        <h2 class="accordion-header" id="historyHeading">
					            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#historyCollapse" aria-expanded="false" aria-controls="historyCollapse">
					                History
					            </button>
					        </h2>
					        <div id="historyCollapse" class="accordion-collapse collapse" aria-labelledby="historyHeading">
					            <div class="accordion-body">
					                <div class="form-stick">
					                    <input class="form-stick-input" type="checkbox" id="history1">
					                    <label class="form-stick-label" for="history1">Ancient History</label>
					                </div>
					            </div>
					        </div>
					    </div>

					    <div class="accordion-item">
					        <h2 class="accordion-header" id="engineeringHeading">
					            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#engineeringCollapse" aria-expanded="false" aria-controls="engineeringCollapse">
					                Engineering
					            </button>
					        </h2>
					        <div id="engineeringCollapse" class="accordion-collapse collapse" aria-labelledby="engineeringHeading">
					            <div class="accordion-body">
					                <div class="form-stick">
					                    <input class="form-stick-input" type="checkbox" id="engineering1">
					                    <label class="form-stick-label" for="engineering1">Civil Engineering</label>
					                </div>
					            </div>
					        </div>
					    </div>

					    <div class="accordion-item">
					        <h2 class="accordion-header" id="economicsHeading">
					            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#economicsCollapse" aria-expanded="false" aria-controls="economicsCollapse">
					                Economics
					            </button>
					        </h2>
					        <div id="economicsCollapse" class="accordion-collapse collapse" aria-labelledby="economicsHeading">
					            <div class="accordion-body">
					                <div class="form-stick">
					                    <input class="form-stick-input" type="checkbox" id="economics1">
					                    <label class="form-stick-label" for="economics1">Microeconomics</label>
					                </div>
					            </div>
					        </div>
					    </div>

					    <div class="accordion-item">
					        <h2 class="accordion-header" id="psychologyHeading">
					            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#psychologyCollapse" aria-expanded="false" aria-controls="psychologyCollapse">
					                Psychology
					            </button>
					        </h2>
					        <div id="psychologyCollapse" class="accordion-collapse collapse" aria-labelledby="psychologyHeading">
					            <div class="accordion-body">
					                <div class="form-stick">
					                    <input class="form-stick-input" type="checkbox" id="psychology1">
					                    <label class="form-stick-label" for="psychology1">General Psychology</label>
					                </div>
					            </div>
					        </div>
					    </div>

					    <div class="accordion-item">
					        <h2 class="accordion-header" id="dataScienceHeading">
					            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#dataScienceCollapse" aria-expanded="false" aria-controls="dataScienceCollapse">
					                Data Science
					            </button>
					        </h2>
					        <div id="dataScienceCollapse" class="accordion-collapse collapse" aria-labelledby="dataScienceHeading">
					            <div class="accordion-body">
					                <div class="form-stick">
					                    <input class="form-stick-input" type="checkbox" id="dataScience1">
					                    <label class="form-stick-label" for="dataScience1">Machine Learning</label>
					                </div>
					            </div>
					        </div>
					    </div>

					    <div class="accordion-item">
					        <h2 class="accordion-header" id="itSoftwareHeading">
					            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#itSoftwareCollapse" aria-expanded="false" aria-controls="itSoftwareCollapse">
					                IT & Software development
					            </button>
					        </h2>
					        <div id="itSoftwareCollapse" class="accordion-collapse collapse" aria-labelledby="itSoftwareHeading">
					            <div class="accordion-body">
					                <div class="form-stick">
					                    <input class="form-stick-input" type="checkbox" id="itSoftware1">
					                    <label class="form-stick-label" for="itSoftware1">Web Development</label>
					                </div>
					            </div>
					        </div>
					    </div>

					</div>
				</div>
				<div class="filters-grid-b">
					<div class="filters-grid-b-h">
						<button type="button" onclick="window.location.href='/gonaraza/academia/courses'">
							<img src="../assets/icons/ac-le.svg" alt="Left">
						</button>
						<div>
							<p>Mathematics & Science</p>
							<span>/</span>
							<span>Algebra</span>
							<span>/</span>
						</div>
					</div>
					<div class="filters-grid-b-sel">
						<div class="filters-grid-b-sel-h">
							<h1>Algebra</h1>
							<div>
								<p>
									<img src="../assets/icons/ac-us.svg">
									<span>12.7K Followers</span>
								</p>
								<button>
									<span>Follow</span>
									<img src="../assets/icons/ac-p1.svg" alt="Plus">
								</button>
							</div>
						</div>
						<div class="filters-grid-b-sel-b">
							<p>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.</p>
						</div>
					</div>
					<div class="filters-grid-b-list">
						<?php for ($i = 0; $i < 6; $i++): ?>
						<div class="fgbl-item" onclick="window.location.href='/gonaraza/academia/course-part'" style="cursor: pointer;">
							<div class="fgbl-item-l">
								<h4>Linear Algebra</h4>
								<p>
									<span>14 Papers</span>
									<span>|</span>
									<span>14 Papers</span>
								</p>
							</div>
							<div class="fgbl-item-r">
								<button>
									<span>Follow</span>
									<img src="../assets/icons/ac-pp.svg">
								</button>
							</div>
						</div>
						<div class="fgbl-item" onclick="window.location.href='/gonaraza/academia/course-part'" style="cursor: pointer;">
							<div class="fgbl-item-l">
								<h4>Linear Algebra</h4>
								<p>
									<span>14 Papers</span>
									<span>|</span>
									<span>14 Papers</span>
								</p>
							</div>
							<div class="fgbl-item-r">
								<button>
									<span>Follow</span>
									<img src="../assets/icons/ac-lock.svg">
								</button>
							</div>
						</div>
						<?php endfor; ?>
					</div>
					<div class="pagination">
						<button>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16" stroke="currentColor" stroke-width="0.7">
								<path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
							</svg>
						</button>
						<div>
							<p>1</p>
							<p>2</p>
							<p class="active">3</p>
							<p>4</p>
							<p>5</p>
						</div>
						<button>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16" stroke="currentColor" stroke-width="0.7">
								<path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
							</svg>
						</button>
					</div>
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

</body>
</html>