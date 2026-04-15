// ===== 랜딩페이지 =====
const startBtn = document.getElementById("startBtn");
if (startBtn) {
  startBtn.onclick = () => {
    location.href = "map.html";
  };
}

const hideBtn = document.getElementById("hideBtn");
if (hideBtn) {
  hideBtn.onclick = () => {
    location.href = "hide.html";
  };
}


// ===== 장소 목록 페이지 =====
const list = document.getElementById("list");

if (list) {
  fetch("http://localhost:3000/locations")
    .then(res => res.json())
    .then(data => {
      data.locations.forEach(place => {
        const div = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = place.name;

        const btn = document.createElement("p");
        btn.textContent = "미션 보기";

        div.appendChild(title);
        div.appendChild(btn);

        btn.onclick = (e) => {
  e.stopPropagation();
  location.href = `code.html?id=${place.id}`;
};

        list.appendChild(div);
      });
    });
}


// ===== 상세 페이지 =====
const nameEl = document.getElementById("name");

if (nameEl) {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  fetch(`http://localhost:3000/locations/${id}`)
    .then(res => res.json())
    .then(place => {
      document.getElementById("name").textContent = place.name;
      document.getElementById("hint").textContent = place.mission_content;
    });

  const btn = document.getElementById("goRedeem");
  btn.onclick = () => {
    location.href = `code.html?id=${id}`;
  };
}


// ===== 코드 입력 페이지 =====
const submitBtn = document.getElementById("submit");

if (submitBtn) {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  const inputBox = document.getElementById("inputBox");
  const loadingBox = document.getElementById("loadingBox");
  const resultBox = document.getElementById("resultBox");

  submitBtn.onclick = () => {
    const input = document.getElementById("code").value;

    // 입력값만 서버로 전송 (로딩 없음)
    fetch(`http://localhost:3000/locations/${id}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "test",
        student_id: "test",
        department: "test",
        mission_type: "quiz",
        answer: input
      })
    })
      .then(res => res.json())
      .then(data => {

        if (data.success) {
          resultBox.style.display = "block";

          resultBox.innerHTML = `
  <img src="success.png" width="100%">
  <h2>미션 성공 🎉</h2>
  <button id="openTreasureBtn">보물상자 열어보기</button>
`;

          setTimeout(() => {
            document.getElementById("openTreasureBtn").onclick = () => {
              startTreasureOpen(id, inputBox, loadingBox, resultBox);
            };
          }, 0);

        } else {
          alert(data.message);
        }
      });
  };
}


// ===== 보물 열기 (로딩 + claim + 결과) =====
function startTreasureOpen(id, inputBox, loadingBox, resultBox) {

  resultBox.style.display = "none";
  loadingBox.style.display = "block";

  setTimeout(() => {

    fetch(`http://localhost:3000/locations/${id}/claim`, {
      method: "POST"
    })
      .then(res => res.json())
      .then(data => {

        loadingBox.style.display = "none";
        resultBox.style.display = "block";

        const treasure = data.treasure;

        if (treasure.type === "message") {
          resultBox.innerHTML = `<h2>${treasure.content}</h2>`;
        } else {
          resultBox.innerHTML = `
            <h2>${treasure.content}</h2>
            <img src="http://localhost:3000/${treasure.image_path}" width="100%">
          `;
        }

        setTimeout(() => {
          location.href = "success.html";
        }, 1500);

      });

  }, 1200); // 로딩 연출
}


// ===== 보물 열기 페이지 (직접 접근용) =====
const openPage = document.getElementById("openPage");

if (openPage) {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  fetch(`http://localhost:3000/locations/${id}/claim`, {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {

      const treasure = data.treasure;

      const result = document.createElement("div");

      if (treasure.type === "message") {
        result.innerText = treasure.content;
      } else {
        result.innerHTML = `
          <p>${treasure.content}</p>
          <img src="http://localhost:3000/${treasure.image_path}" width="100%">
        `;
      }

      openPage.appendChild(result);

      setTimeout(() => {
        location.href = "success.html";
      }, 1500);
    });
}