const li = document.querySelectorAll(".nav-link");
const sec = document.querySelectorAll("section");

function activeMenu(){
    let len = sec.length;
    while(--len && window.scrollY + 600 < sec[len].offsetTop){}
    li.forEach(ltx => ltx.classList.remove('coloring'));
    li[len].classList.add('coloring');
}
window.addEventListener('scroll', activeMenu);

function checkRefresh()
{
    window.location.hash = ('#home');
    window.scroll(0,0);
}

var goToTopbutton = document.getElementById("top");

window.onscroll = function scrollFunction() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    goToTopbutton.style.display = "block";
  } else {
    goToTopbutton.style.display = "none";
  }
}

function goToTop(){
    window.scroll(0,0);
    btnHome.classList.add('coloring');
    btnaboutMe.classList.remove('coloring');
    btnmySkills.classList.remove('coloring');
    btncontactMe.classList.remove('coloring');
}