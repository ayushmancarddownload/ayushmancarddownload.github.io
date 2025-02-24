 document.addEventListener("DOMContentLoaded", function () {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");

  // Jab user 20px scroll kare, tab button dikhao
  window.onscroll = function () {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      scrollToTopBtn.style.display = "block";
    } else {
      scrollToTopBtn.style.display = "none";
    }
  };

  // Button par click karne par smooth scrolling karein
  scrollToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0, // Top of the page
      behavior: "smooth", // Smooth scrolling effect
    });
  });
});
