const selectors = {
  nav: '.account-mobile-nav'
}

function changeMobileNav(containerSelector) {
  const container = document.querySelector(containerSelector)
  if (!container) return
  const nav = container.querySelector(selectors.nav)

  nav.addEventListener('change', function() {
    window.location.href = nav.value
  })
}

changeMobileNav('.account__nav')
