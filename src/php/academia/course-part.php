<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Academia</title>
	<link href="../css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="../css/header.css">
	<link rel="stylesheet" type="text/css" href="../css/footer.css">
	<link rel="stylesheet" type="text/css" href="course-part.css">
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


<section class="main-content">
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
	<div class="main-content-grid">
		<div class="main-content-grid-l">
			<div class="mcgl-h">
				<h2>Key research themes</h2>
			</div>
			<div class="mcgl-b">
				<?php for ($i = 0; $i < 6; $i++): ?>
				<div class="course-part">
					<div class="course-part-h">
						<div>
							<h5>An Operadic Approach to Internal Structures</h5>
							<p>By Dr. Xavier KABARANGA</p>
						</div>
						<div>
							<button type="button" onclick="window.location.href='/gonaraza/academia/read-contents'">
								<img src="../assets/icons/ac-book.svg">
								<span>View Paper</span>
							</button>
							<button>
								<img src="../assets/icons/ac-dl.svg">
								<span>Download</span>
							</button>
						</div>
					</div>
					<div class="course-part-b">
						<p>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings... Read more</p>
					</div>
				</div>
				<?php endfor; ?>
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
		<div class="main-content-grid-r">
			<div class="mcgr-h">
				<h2>Related Suptopics</h2>
			</div>
			<div class="mcgr-b">
				<?php for ($i = 0; $i < 3; $i++): ?>
				<div class="fgbl-item">
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
				<div class="fgbl-item">
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

</body>
</html>