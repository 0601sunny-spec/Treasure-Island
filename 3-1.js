// step2.js
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        localStorage.setItem('hide_type', btn.dataset.type);
        location.href = '3-1a.html';
    });
});