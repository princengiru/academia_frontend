<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Academia</title>
	<link href="../css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="../css/header.css">
	<link rel="stylesheet" type="text/css" href="../css/footer.css">
	<link rel="stylesheet" type="text/css" href="journals.css">
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
				<h1>Journals & Projects</h1>
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
					<a href="/gonaraza/academia/journals?type=all">All Courses</a>
				</li>
				<li class="dropdown-item">
					<a href="/gonaraza/academia/journals?type=certificates">Certificates</a>
				</li>
				<li class="dropdown-item">
					<a href="/gonaraza/academia/journals?type=diplomas">Diplomas</a>
				</li>
				<li class="dropdown-item">
					<a href="/gonaraza/academia/journals?type=degrees">Degrees</a>
				</li>
				<li class="dropdown-item">
					<a href="/gonaraza/academia/journals?type=workshops">Workshops</a>
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
									<a href="/gonaraza/academia/journals?sort=newest">Newest</a>
								</li>
								<li class="dropdown-item">
									<a href="/gonaraza/academia/journals?sort=top-papers">Top papers</a>
								</li>
								<li class="dropdown-item">
									<a href="/gonaraza/academia/journals?sort=past-papers">Past Papers</a>
								</li>
								<li class="dropdown-item">
									<a href="/gonaraza/academia/journals?sort=most-downloaded">Most Downloaded</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="best-links">
		<div class="best-links-body">
			<button>All</button>
			<button class="active">Showbiz</button>
			<button>Technology</button>
			<button>Business</button>
			<button>Science</button>
			<button>Health</button>
			<button>Sports</button>
			<button>Entertainment</button>
			<button>Education</button>
			<button>Travel</button>
			<button>All</button>
			<button>Showbiz</button>
			<button>Technology</button>
			<button>Business</button>
			<button>Science</button>
			<button>Health</button>
			<button>Sports</button>
			<button>Entertainment</button>
			<button>Education</button>
			<button>Travel</button>
		</div>
		<div class="best-links-end"><button><img src="../assets/icons/ddw.svg"></button></div>
	</div>
</section>

<section class="main-content-new">
	<div class="main-content-grid">
		<?php for ($i = 0; $i < 5; $i++): ?>
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
	<div class="main-content-grid skeletons">
		<?php for ($i = 0; $i < 5; $i++): ?>
		<div class="journal skeleton-journal">
			<div class="journal-img skeleton-img"></div>
			<div class="journal-info">
				<div class="journal-info-h">
					<div>
						<span class="skeleton-text skeleton-text-sm"></span>
						<span class="skeleton-text skeleton-text-sm"></span>
					</div>
					<div>
						<div>
							<button class="skeleton-btn"></button>
						</div>
					</div>
				</div>
				<div class="journal-info-b">
					<p class="skeleton-text skeleton-text-lg"></p>
				</div>
			</div>
		</div>
		<?php endfor; ?>
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
	const slider = document.querySelector('.best-links-body');
	let isDown=false, startX, scrollLeft;
	if(slider){
	    slider.addEventListener('mousedown', e=>{isDown=true; slider.classList.add('dragging'); startX=e.pageX-slider.offsetLeft; scrollLeft=slider.scrollLeft;});
	    slider.addEventListener('mouseleave', ()=>{isDown=false; slider.classList.remove('dragging');});
	    slider.addEventListener('mouseup', ()=>{isDown=false; slider.classList.remove('dragging');});
	    slider.addEventListener('mousemove', e=>{if(!isDown)return; e.preventDefault(); const x=e.pageX-slider.offsetLeft; const walk=(x-startX)*1.5; slider.scrollLeft=scrollLeft-walk;});
	}
</script>

</body>
</html>