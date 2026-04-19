window.onload = function () {
    // 1. 수원대학교 건물별 정밀 좌표 데이터 (고정)
    const placeList = [
        { id: 1, name: '도서관', img: 'library', lat: 37.208633, lng: 126.975936, mission_type: 'quiz' },
        { id: 2, name: '학생회관', img: 'student', lat: 37.209134, lng: 126.977890, mission_type: 'photo' },
        { id: 3, name: '종합관', img: 'total', lat: 37.209083, lng: 126.978658, mission_type: 'quiz' },
        { id: 4, name: '아마랜스 홀', img: 'amaranth', lat: 37.2112, lng: 126.9778, mission_type: 'quiz' },
        { id: 5, name: '정문', img: 'front', lat: 37.2100, lng: 126.9752, mission_type: 'photo' },
        { id: 6, name: '미래혁신관', img: 'future', lat: 37.2098, lng: 126.9765, mission_type: 'quiz' },
        { id: 7, name: '인문사회융합대학', img: 'human', lat: 37.2106, lng: 126.9785, mission_type: 'quiz' },
        { id: 8, name: 'ICT융합대학', img: 'ict', lat: 37.2101, lng: 126.9810, mission_type: 'photo' }
    ];

    const API_URL = "https://dopamine-treasure-backend-production.up.railway.app";

    // 카카오맵 초기화
    var mapContainer = document.getElementById('kakao-map');
    var mapOption = { center: new kakao.maps.LatLng(33.450701, 126.570667), level: 3 };
    var map = new kakao.maps.Map(mapContainer, mapOption);

    // 실시간 보물 개수 가져오기 (필요 시)
    fetch(`${API_URL}/locations`)
        .then(res => res.json())
        .then(data => {
            const counts = data.locations;
            placeList.forEach(p => {
                const serverData = counts.find(s => s.id === p.id);
                if (serverData) p.treasure_count = serverData.treasure_count;
            });
            renderLocations(placeList);
        }).catch(() => renderLocations(placeList));
};

function renderLocations(places) {
    const grid = document.getElementById('locationsGrid');
    if (!grid) return;

    grid.innerHTML = places.map(p => {
        // 미션 타입에 따른 페이지 분기
        const targetPage = p.mission_type === 'photo' ? '2-1b.html' : '2-1a.html';
        return `
            <article class="place-card">
                <div class="place-image" style="background-image: url('./img/${p.img}.png')"></div>
                <div class="place-info">
                    <h4 class="place-name">${p.name}</h4>
                    <div class="treasure-oval">보물 ${p.treasure_count || 0}개 남음</div>
                    <button class="mission-btn" onclick="location.href='${targetPage}?id=${p.id}'">미션하러 가기</button>
                </div>
            </article>
        `;
    }).join('');
}