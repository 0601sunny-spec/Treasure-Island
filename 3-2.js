// step4.js
const locs = ["도서관", "학생회관", "종합관", "아마랜스홀", "정문", "미래혁신관", "인문사회융합대학", "ICT융합대학", "야구장", "대운동장"];
const grid = document.getElementById('sh-locGrid');
let selectedId = null;

locs.forEach((name, i) => {
    const btn = document.createElement('button');
    btn.className = 'sh-loc-btn'; // CSS의 .sh-loc-btn과 일치
    btn.innerText = name;
    btn.onclick = () => {
        document.querySelectorAll('.sh-loc-btn').forEach(b => b.classList.remove('sh-selected'));
        btn.classList.add('sh-selected'); // CSS의 .sh-selected와 일치
        selectedId = i + 1;
    };
    grid.appendChild(btn);
});

document.getElementById('sh-nextBtn').onclick = () => {
    if (!selectedId) return alert("장소를 선택해주세요.");
    localStorage.setItem('hide_location', selectedId);
    location.href = '3-3.html';
};