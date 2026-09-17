function showPopup(imageUrl) {
  const popup = document.getElementById("popup");
  const popupImage = document.getElementById("popup-image");

  popupImage.src = imageUrl;
  popup.style.display = "block";
}

function closePopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("#ftco-nav .navbar-nav");
  if (nav && !nav.querySelector('a[href="play.html"]')) {
    const item = document.createElement("li");
    item.className = "nav-item";
    item.innerHTML = '<a href="play.html" class="nav-link"><span>Play / Business</span></a>';
    const contact = nav.querySelector('a[href="#contact-section"]')?.closest("li");
    nav.insertBefore(item, contact || null);
  }

  document.querySelectorAll("#home-section a.btn-primary").forEach((button) => {
    button.href = "play.html";
    button.textContent = "Play / Business";
  });

  const hireSection = document.querySelector(".ftco-hireme");
  if (hireSection) {
    const heading = hireSection.querySelector("h2");
    const copy = hireSection.querySelector("p:not(.mb-0)");
    const button = hireSection.querySelector("a.btn-primary");
    if (heading) heading.textContent = "Play, license, publish, or partner with TumaoGames";
    if (copy) copy.textContent = "Explore live titles and commercial paths built around owned games and reusable IP.";
    if (button) {
      button.href = "play.html";
      button.textContent = "Explore TumaoGames";
    }
  }
});
