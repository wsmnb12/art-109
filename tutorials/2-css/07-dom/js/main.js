

// Select HTML elements
const header = document.querySelector('header');
const changeHeaderButton = document.querySelector('#change-header-button');
const changeThemeButton = document.querySelector('#change-theme-button');
const img1 = document.querySelector('#img1');
const img2 = document.querySelector('#img2');
const img3 = document.querySelector('#img3');

// Change header with button click
changeHeaderButton.addEventListener('click', () => {
    header.innerHTML = "POW";
});

// create function for changing button text
function changeButtonText() { 
    if (document.body.classList.contains('dark')) {
       changeThemeButton.textContent = "Light Mode";
    } else {
        changeThemeButton.textContent = "Dark Mode";
    }
}

// Toggle color theme
changeThemeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    changeButtonText();
});

// Toggle image visibility 
img1.addEventListener('click', () => {
    img2.classList.remove('hidden');
});

img2.addEventListener('click', () => {
    img3.classList.remove('hidden');
});     