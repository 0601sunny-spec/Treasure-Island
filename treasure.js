// ===== 랜딩페이지 =====
const startBtn = document.getElementById("startBtn");

if (startBtn) {
  startBtn.onclick = () => {
    location.href = "map.html";     // 지도 페이지로 이동
  };
}

const hideBtn = document.getElementById("hideBtn");

if (hideBtn) {
  hideBtn.onclick = () => {
    location.href = "hide.html";   // 보물 숨기기 페이지로 이동
  };
}


// ===== 장소 데이터 =====
const places = [
  { id: 1, name: "도서관", hint: "도서관 맞은 편 계단 개수는?" },
  { id: 2, name: "학생회관", hint: " 로비 거울 앞에서 사진 찍고 업로드하기" },
  { id: 3, name: "종합관 ", hint: "오늘의 학식사진 업로드하기" },
  { id: 4, name: "아마랜스 홀 ", hint: " 건물 옆에서 학교전경을 촬영하여 업로드하기" },
  { id: 5, name: "정문", hint: " 정문 사진 찍고 업로드하기" },
  { id: 6, name: "미래혁신관", hint: "- 건물 사진 찍고 업로드하기" },
  { id: 7, name: "인문사회융합대학", hint: "수업 전 강의실 안에서 사진찍고 업로드하기" },
  { id: 8, name: "ICT 융합대학", hint: "- ICT융합대학과 붙어있는 건물 이름은?" },
  { id: 9, name: "야구장", hint: " 돌계단에서 사진 찍고 업로드하기" },
  { id: 10, name: "대운동장 ", hint: " 한바퀴 산책하고 인증사진 남기기 " },
];

// ===== 장소 목록 페이지 =====
const list = document.getElementById("list");

// ✅ 완료 목록 가져오기 (위에 이미 있으니까 중복이면 제거해도 됨)
const completed = JSON.parse(localStorage.getItem("completed") || "[]");

if (list) {
  places.forEach(place => {
    const div = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = place.name;

    const hint = document.createElement("p");
    hint.textContent = place.hint;

    div.appendChild(title);
    div.appendChild(hint);

    // ✅ 완료된 장소 표시
    if (completed.includes(String(place.id))) {
      title.textContent += " ✅";
    }

    // ✅ 클릭 막기
    div.onclick = () => {
      if (completed.includes(String(place.id))) {
        alert("이미 완료한 장소입니다!");
        return;
      }
      location.href = `detail.html?id=${place.id}`;
    };

    list.appendChild(div);
  });
}

// ===== 상세 페이지 =====
const nameEl = document.getElementById("name");

if (nameEl) {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  const place = places.find(p => p.id == id);

  if (place) {
    document.getElementById("name").textContent = place.name;
    document.getElementById("hint").textContent = place.hint;
  }

  const btn = document.getElementById("goRedeem");
  btn.onclick = () => {
    location.href = `code.html?id=${id}`;
  };
}


// ===== 장소별 정답 =====
const missions = {
  1: { answer: "345" },            // 중앙도서관
  2: { answer: "123" },        // 학생회관
  3: { answer: "999" },        // 종합관
};

// ===== 현재 장소 id 가져오기 =====
const params = new URLSearchParams(location.search);
const id = params.get("id");

// ===== 코드 입력 버튼 =====
const submitBtn = document.getElementById("submit");

if (submitBtn) {
  submitBtn.onclick = () => {
    const input = document.getElementById("code").value;
    const correctAnswer = missions[id]?.answer;

    // ✅ 이미 성공한 경우 막기
    if (completed.includes(String(id))) {
      alert("이미 완료한 장소입니다!");
      return;
    }

    if (input === correctAnswer) {
      // ✅ 완료 저장
      completed.push(id);
      localStorage.setItem("completed", JSON.stringify(completed));

      location.href = "success.html";
    } else {
      alert("틀렸습니다!");
    }
  };
}