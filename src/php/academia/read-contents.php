<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Academia</title>
	<link href="../css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="../css/header.css">
	<link rel="stylesheet" type="text/css" href="../css/footer.css">
	<link rel="stylesheet" type="text/css" href="read-contents.css">
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
		<button type="button" onclick="window.location.href='/gonaraza/academia/course-part'">
			<img src="../assets/icons/ac-le.svg" alt="Left">
		</button>
		<div>
			<p>Mathematics & Science</p>
			<span>/</span>
			<span>Algebra</span>
			<span>/</span>
		</div>
	</div>
	<div class="course-part">
		<div class="course-part-h">
			<div>
				<h5>An Operadic Approach to Internal Structures</h5>
				<div class="course-part-h-p">
					<div class="course-part-h-img">
						<img src="../assets/imgs/prof.jpg">
					</div>
					<p>By Dr. Xavier KABARANGA</p>
				</div>
				
			</div>
			<div>
				<button>
					<img src="../assets/icons/ac-bm.svg">
					<span>Save to library</span>
				</button>
				<button>
					<img src="../assets/icons/ac-dl.svg">
					<span>Download</span>
				</button>
			</div>
		</div>
		<div class="course-part-b">
			<h5>Abstract</h5>
			<p>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings... Read more</p>
		</div>
	</div>
</section>

<section class="main-content">
	<div class="main-content-grid">
		<div class="main-content-grid-l">
			<div class="mcgl-h">
				<h2>Outline</h2>
			</div>
			<div class="cont-page">
				
			</div>
		</div>
		<div class="main-content-grid-r">
			<div class="mcgr-h">
				<h2>Related Papers</h2>
			</div>
			<div class="related-list">
				<?php for ($i = 0; $i < 3; $i++): ?>
				<div class="course-part">
					<div class="course-part-h related-h">
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