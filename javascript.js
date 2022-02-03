const btnHome = document.getElementById('nav-home');
const btnaboutMe = document.getElementById('nav-aboutMe');
const btnmySkills = document.getElementById('nav-mySkills');
const btncontactMe = document.getElementById('nav-contactMe');

function navBtn1(){
    btnHome.classList.add('coloring');
    btnaboutMe.classList.remove('coloring');
    btnmySkills.classList.remove('coloring');
    btncontactMe.classList.remove('coloring');
};

function navBtn2(){
    btnHome.classList.remove('coloring');
    btnaboutMe.classList.add('coloring');
    btnmySkills.classList.remove('coloring');
    btncontactMe.classList.remove('coloring');
};

function navBtn3(){
    btnHome.classList.remove('coloring');
    btnaboutMe.classList.remove('coloring');
    btnmySkills.classList.add('coloring');
    btncontactMe.classList.remove('coloring');
};

function navBtn4(){
    btnHome.classList.remove('coloring');
    btnaboutMe.classList.remove('coloring');
    btnmySkills.classList.remove('coloring');
    btncontactMe.classList.add('coloring');
};

btnHome.addEventListener('click', navBtn1);
btnaboutMe.addEventListener('click', navBtn2);
btnmySkills.addEventListener('click', navBtn3);
btncontactMe.addEventListener('click', navBtn4);

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