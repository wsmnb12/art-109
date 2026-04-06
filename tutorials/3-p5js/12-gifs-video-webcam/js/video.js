const hoverVideos = document.querySelectorAll('.hover-videos');
const clickVideos = document.querySelectorAll('.click-videos');

hoverVideos.forEach(video => {
    video.addEventListener('mouseover', () => {
        video.play();
    });

    video.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0; 
    });
});


clickVideos.forEach(video => {
    video.addEventListener('click', () => {
        video.play();
    });
});