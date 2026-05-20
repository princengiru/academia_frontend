import heroImg from '../../../assets/hero.png'

function HomePage() {
  return (
    <section className="home-banner card">
      <div className="banner-copy">
        <span className="banner-kicker">Banner</span>
        <h2>Home page banner</h2>
        <p>
          This is the banner area for your React version. If you want, we can
          swap in your own image, logo, or promo copy next.
        </p>
      </div>

      <div className="banner-visual" aria-hidden="true">
        <img src={heroImg} alt="" />
      </div>
    </section>
  )
}

export default HomePage

