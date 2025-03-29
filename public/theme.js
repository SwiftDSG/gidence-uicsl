if (localStorage) {
  const theme = localStorage.getItem('theme')
  if (theme) {
    document.documentElement.classList.add(`rd-${theme}`)
  }
}