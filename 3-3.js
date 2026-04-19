// step5.js
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        localStorage.setItem('hide_mission_type', btn.dataset.mission);
        location.href = '3-3a.html';
    });
});