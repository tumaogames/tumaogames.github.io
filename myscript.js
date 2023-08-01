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
