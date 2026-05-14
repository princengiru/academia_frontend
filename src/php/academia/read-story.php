<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Academia</title>
	<link href="../css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="../css/header.css">
	<link rel="stylesheet" type="text/css" href="../css/footer.css">
	<link rel="stylesheet" type="text/css" href="read-story.css">
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
	<div class="filters-grid-b-h">
		<button type="button" onclick="window.location.href='/gonaraza/academia/watch'">
			<img src="../assets/icons/ac-le.svg" alt="Left">
		</button>
		<div>
			<p>Mathematics & Science</p>
			<span>/</span>
			<span>Algebra</span>
			<span>/</span>
		</div>
	</div>
	<div class="main-content-inner">
		<div class="main-content-inner-h">
			<h3>Build your dream software & engineering career</h3>
			<div>
				<p>5 mins read</p>
				<p>|</p>
				<p>Oct 21, 2025 07:51 AM</p>
			</div>
		</div>
		<div class="main-content-inner-b">
			<img src="../assets/imgs/ac-str.JPG">
		</div>
		<div class="story-footer">
			<div class="story-author">
				<div class="story-author-img">
					<img src="../assets/imgs/prof.JPG">
				</div>
				<div class="story-author-name" onclick="window.location.href='/gonaraza/academia/author'" style="cursor: pointer;">
					<h6>Esther Howard</h6>
					<label>Journalist</label>
				</div>
			</div>
			<div class="story-footer-r">
				<a href="#"><img src="../assets/icons/con5.svg"></a>
				<a href="#"><img src="../assets/icons/con6.svg"></a>
				<a href="#"><img src="../assets/icons/con4.svg"></a>
				<a href="#"><img src="../assets/icons/con3.svg"></a>
				<div>
					<button>
						<img src="../assets/icons/sha2.svg">
						<span>Share</span>
					</button>
				</div>
			</div>
		</div>
		<div class="full-story">
			<p>Before you do any of the following steps, be sure to pick a topic that actually interests you. Nothing – and enthusiasm from the writer. You.</p>
			<p>Lorem ipsum dolor sit amet, consectetur adipisici elit, ist ein Blindtext, der nichts bedeuten soll, sondern als Platzhalter im Layout verwendet wird, um einen Eindruck vom fertigen Schriftstück zu erhaltenim , Lorem ipsum dolor sit amet, consectetur adipisici elit, ist ein Blindtext, der nichts bedeuten soll, sondern als Platzhalter im Layout verwendet wird, um einen Eindruck vom fertigen Schriftstück zu erhaltenim SchriftstückLorem ipsum dolor sit amet, consectetur adipisici elit, ist ein Blindtext, der nichts bedeuten soll, sondern als Platzhalter im Layout verwendet wird, um einen Eindruck vom fertigen Schriftstück zu erhaltenim , Lorem ipsum dolor sit amet, consectetur adipisici elit, ist ein Blindtext, der nichts bedeuten soll, sondern als Platzhalter im Layout verwendet wird, um einen Eindruck vom fertigen Schriftstück zu erhaltenim Schriftstück</p>
			<div class="story-media">
				<div>
					<img src="../assets/imgs/item.JPG">
				</div>
				<div>
					<img src="../assets/imgs/trusted.JPG">
				</div>
			</div>
			<p>Lorem ipsum dolor sit amet, consectetur adipisici elit, ist ein Blindtext, der nichts bedeuten soll, sondern als Platzhalter im Layout verwendet wird, um einen Eindruck vom fertigen Schriftstück zu erhaltenim , Lorem ipsum dolor sit amet, consectetur adipisici elit, ist ein Blindtext, der nichts bedeuten soll, sondern als Platzhalter im Layout verwendet wird, um einen Eindruck vom fertigen Schriftstück zu erhaltenim SchriftstückLorem ipsum dolor sit amet, consectetur adipisici elit, ist ein Blindtext, der nichts bedeuten soll, sondern als Platzhalter im Layout verwendet wird, um einen Eindruck vom fertigen Schriftstück zu erhaltenim , Lorem ipsum dolor sit amet, consectetur adipisici elit, ist ein Blindtext, der nichts bedeuten soll, sondern als Platzhalter im Layout verwendet wird, um einen Eindruck vom fertigen Schriftstück zu erhaltenim Schriftstück</p>
		</div>
	</div>
</section>

<section class="main-content">
	<div class="main-content-new-grid">
		<div class="mcnd-l">
			<div class="mcnd-l-h">
				<h2>Comments</h2>
				<div class="new-comment">
			      <div class="new-comment-sender">
			        <img src="../assets/imgs/prof.JPG">
			      </div>
			      <div class="new-comment-text">
			        <textarea row="1" placeholder="your comment.."></textarea>
			        <button><img src="../assets/icons/picture.svg"></button>
			      </div>
			    </div>
			</div>
			<div class="mcnd-l-b">
				<div class="mcnd-l-b-h">
					<button>
						<img src="../assets/icons/ac-com.svg">
						<span>8 Comments</span>
					</button>
					<button>
						<img src="../assets/icons/ac-sd3.svg">
						<span>47k Likes</span>
					</button>
					<button>
						<img src="../assets/icons/ac-sav.svg">
						<span>900 Saves</span>
					</button>
				</div>
				<div class="mcnd-l-b-b">
					<?php for ($i = 0; $i < 10; $i++): ?>
					<div class="comment">
						<div class="comment-img">
							<img src="../assets/imgs/prof.jpg">
						</div>
						<div class="comment-text">
							<div>
								<h6>Mr. Anderson</h6>
								<span>1 Day ago</span>
							</div>
							<p>Long before you sit dow to put digital pen to paper you need to make sure you have to sit down and write. I’ll show you how to write a great blog post in five simple steps that people will actually want to read. Ready?</p>
						</div>
					</div>
					<?php endfor; ?> 
				</div>
			</div>
		</div>
		<div class="mcnd-r">
			<div class="mcnd-r-h">
				<h3>Related Projects</h3>
			</div>
			<div class="mcnd-r-b">
				<?php for ($i = 0; $i < 6; $i++): ?>
				<div class="related-item">
					<div class="related-item-img">
						<img src="../assets/imgs/ac-str.JPG">
					</div>
					<div class="related-item-l">
						<div class="related-item-l-t">
							<div>
								<label>By</label>
								<h6>Jose Carine</h6>
							</div>
							<div>
								<p>
									<img src="../assets/icons/ac-sd3.svg">
									<span>11</span>
								</p>
								<p>
									<img src="../assets/icons/ac-eye.svg">
									<span>1.1K</span>
								</p>
							</div>
						</div>
						<div class="related-item-l-b">
							<p>Build your software & engineering dream career</p>
						</div>
					</div>
				</div>
				<?php endfor; ?> 
			</div>
			<div class="mcnd-r-CTA">
				<button>See more</button>
			</div>
		</div>
	</div>
</section>

<section class="main-content">
	<div class="stories-sec-contents">
		<div class="swiper ss-swiper">
			<div class="swiper-wrapper">
				<?php for ($i = 0; $i < 4; $i++): ?>
					<div class="swiper-slide">
						<div class="ss-item">
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
		<button>
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
  document.querySelector('.new-comment-text textarea').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
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

</body>
</html>