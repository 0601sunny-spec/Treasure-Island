window.onload = function() {
    // 1. 수원대학교 건물별 정밀 좌표 데이터
    const placeList = [
        { id: 1, name: '도서관', img: 'library', lat: 37.208633, lng: 126.975936 },
        { id: 2, name: '학생회관', img: 'student', lat: 37.209134, lng: 126.977890 },
        { id: 3, name: '종합관', img: 'total', lat: 37.209083, lng: 126.978658 }, //여기까지 됨
        { id: 4, name: '아마랜스 홀', img: 'amaranth', lat: 37.2112, lng: 126.9778 },
        { id: 5, name: '정문', img: 'front', lat: 37.2100, lng: 126.9752 },
        { id: 6, name: '미래혁신관', img: 'future', lat: 37.2098, lng: 126.9765 },
        { id: 7, name: '인문사회융합대학', img: 'human', lat: 37.2106, lng: 126.9785 },
        { id: 8, name: 'ICT융합대학', img: 'ict', lat: 37.2128, lng: 126.9795 },
        { id: 9, name: '야구장', img: 'baseball', lat: 37.2148, lng: 126.9785 },
        { id: 10, name: '대운동장', img: 'ground', lat: 37.2158, lng: 126.9765 }
    ];

    // 2. 카카오 지도 초기화
    kakao.maps.load(() => {
        const container = document.getElementById('kakao-map');
        const options = {
            center: new kakao.maps.LatLng(37.2125, 126.9765), // 학교 중심
            level: 4 // 건물들이 다 보이게 축척 조정
        };
        const map = new kakao.maps.Map(container, options);

        // 3. 마커 생성 루프
        placeList.forEach(place => {
            const markerPosition = new kakao.maps.LatLng(place.lat, place.lng);
            
            // 마커 생성
            const marker = new kakao.maps.Marker({
                position: markerPosition,
                map: map
            });

            // 마커 위에 이름 표시 (인포윈도우)
            const iwContent = `<div style="padding:5px; font-size:12px; text-align:center;">${place.name}</div>`;
            const infowindow = new kakao.maps.InfoWindow({
                content: iwContent
            });

            // 마커에 마우스 올리면 이름 보이기
            kakao.maps.event.addListener(marker, 'mouseover', function() {
                infowindow.open(map, marker);
            });
            
            // 마우스 떼면 이름 숨기기
            kakao.maps.event.addListener(marker, 'mouseout', function() {
                infowindow.close();
            });
        });
    });

    // 4. 하단 장소 그리드 렌더링
    renderLocations(placeList);
};

// 2-1.js 내의 renderLocations 함수 수정
function renderLocations(places) {
    const grid = document.getElementById('locationsGrid');
    if (!grid) return;

    grid.innerHTML = places.map(p => `
        <article class="place-card">
            <div class="place-image" style="background-image: url('./img/${p.img}.png');"></div>
            <button class="mission-btn" onclick="location.href='2-1A.html?id=${p.id}'">미션 선택</button>
            <div class="treasure-oval" id="count-${p.id}">0/10</div>
        </article>
    `).join('');
}