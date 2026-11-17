// Enkel kundvagnsräknare
(function () {
  const cartCount = document.getElementById("cartCount");
  let count = 0;

  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      count += 1;
      cartCount.textContent = count;
      cartCount.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.4)" },
          { transform: "scale(1)" },
        ],
        { duration: 300, easing: "ease-out" }
      );
    });
  });
})();
