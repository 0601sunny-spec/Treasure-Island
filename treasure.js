// ===== 랜딩페이지 =====
const startBtn = document.getElementById("startBtn");

if (startBtn) {
  startBtn.onclick = () => {
    location.href = "map.html";     // 지도 페이지로 이동
  };
}

// ===== 장소 데이터 =====
const places = [
  { id: 1, name: "중앙도서관", hint: "책 많은 곳" },
  { id: 2, name: "학생회관", hint: "사람 많은 곳" }
];

// ===== 장소 목록 페이지 =====
const list = document.getElementById("list");

if (list) {
  places.forEach(place => {
    const div = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = place.name;

    const hint = document.createElement("p");
    hint.textContent = place.hint;

    div.appendChild(title);
    div.appendChild(hint);

    div.onclick = () => {
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
  2: { answer: "123" }        // 학생회관
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

    if (input === correctAnswer) {
      location.href = "success.html";
    } else {
      alert("틀렸습니다!");
    }
  };
}