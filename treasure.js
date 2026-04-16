const API_BASE = "http://localhost:3000";
const MAP_POINT_POSITIONS = {
  1: { top: "18%", left: "30%" },
  2: { top: "28%", left: "48%" },
  3: { top: "16%", left: "68%" },
  4: { top: "40%", left: "64%" },
  5: { top: "62%", left: "22%" },
  6: { top: "44%", left: "38%" },
  7: { top: "24%", left: "14%" },
  8: { top: "54%", left: "54%" },
  9: { top: "72%", left: "60%" },
  10: { top: "78%", left: "40%" }
};

function fetchJson(url, options = {}) {
  return fetch(url, options).then(async (res) => {
    const body = await res.text();
    if (!res.ok) {
      throw new Error(body || res.statusText);
    }
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  });
}

function postJson(url, body) {
  return fetchJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

function showElement(el) {
  if (el) el.style.display = "block";
}

function hideElement(el) {
  if (el) el.style.display = "none";
}

function makeButton(label, klass) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = klass;
  button.textContent = label;
  return button;
}

function createLocationCard(location) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "location-card";
  card.onclick = () => {
    location.href = `code.html?id=${location.id}`;
  };

  const title = document.createElement("strong");
  title.textContent = location.name;

  const info = document.createElement("p");
  info.textContent = `남은 보물: ${location.remaining ?? location.remaining_treasure ?? "정보 없음"}`;

  card.appendChild(title);
  card.appendChild(info);
  return card;
}

function createMapPoint(location) {
  const point = document.createElement("button");
  point.type = "button";
  point.className = "point";
  point.title = location.name;
  point.onclick = () => {
    location.href = `code.html?id=${location.id}`;
  };

  const coords = location.map_position || MAP_POINT_POSITIONS[location.id];
  if (coords) {
    point.style.top = coords.top;
    point.style.left = coords.left;
  } else {
    point.style.top = "50%";
    point.style.left = "50%";
  }

  return point;
}

function initLanding() {
  document.getElementById("goMap").onclick = () => {
    location.href = "map.html";
  };
  document.getElementById("goHide").onclick = () => {
    location.href = "hide.html";
  };
  document.getElementById("goAdmin").onclick = () => {
    location.href = "admin.html";
  };
  document.getElementById("goRule").onclick = () => {
    location.href = "rule.html";
  };
}

function initMapPage() {
  const list = document.getElementById("locationList");
  const emptyState = document.getElementById("emptyState");
  const pointContainer = document.getElementById("mapPoints");

  fetchJson(`${API_BASE}/locations`)
    .then((data) => {
      const locations = data.locations ?? data;
      if (!Array.isArray(locations) || locations.length === 0) {
        emptyState.textContent = "보물 장소를 찾을 수 없습니다.";
        return;
      }

      emptyState.style.display = "none";
      locations.forEach((location) => {
        list.appendChild(createLocationCard(location));
        pointContainer.appendChild(createMapPoint(location));
      });
    })
    .catch((error) => {
      emptyState.textContent = "서버 연결에 실패했습니다. 나중에 다시 시도해주세요.";
      console.error(error);
    });
}

function initVerifyPage() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const resultBox = document.getElementById("resultBox");
  const loadingBox = document.getElementById("loadingBox");
  const form = document.getElementById("verifyForm");
  const nameEl = document.getElementById("locationName");
  const hintEl = document.getElementById("locationHint");
  const verifyType = document.getElementById("verifyType");
  const photoField = document.getElementById("photoField");

  if (!id) {
    nameEl.textContent = "잘못된 장소 정보입니다.";
    hintEl.textContent = "다시 지도를 통해 장소를 선택해주세요.";
    return;
  }

  fetchJson(`${API_BASE}/locations/${id}`)
    .then((location) => {
      nameEl.textContent = location.name || "장소 정보";
      hintEl.textContent = location.mission_content || location.description || "미션 내용을 불러오는 중입니다.";
    })
    .catch((error) => {
      nameEl.textContent = "장소 정보를 불러오지 못했습니다.";
      hintEl.textContent = "서버와 연결되어 있는지 확인해주세요.";
      console.error(error);
    });

  verifyType.addEventListener("change", () => {
    photoField.style.display = verifyType.value === "photo" ? "block" : "none";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    hideElement(resultBox);
    showElement(loadingBox);

    const answer = document.getElementById("answerInput").value.trim();
    const type = verifyType.value;

    if (!answer && type === "quiz") {
      alert("정답을 입력해주세요.");
      hideElement(loadingBox);
      return;
    }

    const url = `${API_BASE}/locations/${id}/verify`;

    if (type === "photo") {
      const photoInput = document.getElementById("photoInput");
      const file = photoInput.files[0];
      if (!file) {
        alert("사진을 선택해주세요.");
        hideElement(loadingBox);
        return;
      }
      const formData = new FormData();
      formData.append("mission_type", "photo");
      formData.append("answer", answer);
      formData.append("photo", file);
      fetchJson(url, { method: "POST", body: formData })
        .then((data) => handleVerifyResult(data, id, loadingBox, resultBox))
        .catch((error) => handleVerifyError(error, loadingBox, resultBox));
      return;
    }

    postJson(url, { mission_type: "quiz", answer })
      .then((data) => handleVerifyResult(data, id, loadingBox, resultBox))
      .catch((error) => handleVerifyError(error, loadingBox, resultBox));
  });
}

function handleVerifyResult(data, id, loadingBox, resultBox) {
  hideElement(loadingBox);
  if (data.success) {
    resultBox.innerHTML = "";
    resultBox.style.display = "block";
    const title = document.createElement("p");
    title.textContent = "미션 인증에 성공했습니다!";
    title.style.fontWeight = "700";
    const openButton = makeButton("보물 열기", "primary");
    openButton.onclick = () => startTreasureOpen(id, loadingBox, resultBox);
    resultBox.append(title, openButton);
  } else {
    resultBox.innerHTML = `<p>${data.message || "정답이 아니에요. 다시 도전해보세요."}</p>`;
    resultBox.style.display = "block";
  }
}

function handleVerifyError(error, loadingBox, resultBox) {
  hideElement(loadingBox);
  resultBox.innerHTML = `<p>인증 중 오류가 발생했습니다. 다시 시도해주세요.</p>`;
  resultBox.style.display = "block";
  console.error(error);
}

function startTreasureOpen(id, loadingBox, resultBox) {
  hideElement(resultBox);
  showElement(loadingBox);

  setTimeout(() => {
    postJson(`${API_BASE}/locations/${id}/claim`, {})
      .then((data) => {
        hideElement(loadingBox);
        resultBox.innerHTML = "";
        resultBox.style.display = "block";

        const treasure = data.treasure || {};
        const message = document.createElement("p");
        message.textContent = treasure.content || "보물을 획득했습니다!";

        resultBox.appendChild(message);
        if (treasure.type !== "message" && treasure.image_path) {
          const image = document.createElement("img");
          image.src = `${API_BASE}/${treasure.image_path}`;
          image.alt = "보물 이미지";
          image.style.width = "100%";
          image.style.borderRadius = "14px";
          resultBox.appendChild(image);
        }

        setTimeout(() => {
          location.href = "success.html";
        }, 1500);
      })
      .catch((error) => {
        hideElement(loadingBox);
        resultBox.innerHTML = `<p>보물을 여는 데 실패했습니다. 다시 시도해주세요.</p>`;
        resultBox.style.display = "block";
        console.error(error);
      });
  }, 900);
}

function initHidePage() {
  const form = document.getElementById("hideForm");
  const resultBox = document.getElementById("hideResult");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    hideElement(resultBox);

    const payload = {
      nickname: document.getElementById("hideNickname").value.trim(),
      department: document.getElementById("hideDepartment").value.trim(),
      location_id: parseInt(document.getElementById("hideLocation").value, 10),
      type: document.getElementById("hideType").value,
      content: document.getElementById("hideContent").value.trim(),
      mission_question: document.getElementById("hideMission").value.trim(),
      mission_answer: document.getElementById("hideAnswer").value.trim()
    };

    if (!payload.nickname || !payload.department || !payload.content || !payload.mission_question || !payload.mission_answer) {
      alert("모든 항목을 빠짐없이 입력해주세요.");
      return;
    }

    fetchJson(`${API_BASE}/treasures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((data) => {
        resultBox.textContent = data.message || "보물 숨기기가 완료되었습니다!";
        resultBox.style.display = "block";
      })
      .catch((error) => {
        resultBox.textContent = "보물 숨기기 중 오류가 발생했습니다. 다시 시도해주세요.";
        resultBox.style.display = "block";
        console.error(error);
      });
  });
}

function initOpenPage() {
  const openPage = document.getElementById("openPage");
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  if (!id) {
    openPage.textContent = "잘못된 접근입니다.";
    return;
  }

  fetchJson(`${API_BASE}/locations/${id}/claim`, { method: "POST" })
    .then((data) => {
      const treasure = data.treasure || {};
      openPage.innerHTML = "";
      const text = document.createElement("p");
      text.textContent = treasure.content || "보물 획득 완료!";
      openPage.appendChild(text);
      if (treasure.type !== "message" && treasure.image_path) {
        const image = document.createElement("img");
        image.src = `${API_BASE}/${treasure.image_path}`;
        image.alt = "보물 이미지";
        image.style.width = "100%";
        image.style.borderRadius = "14px";
        openPage.appendChild(image);
      }
    })
    .catch((error) => {
      openPage.textContent = "보물 정보를 불러오는 중 오류가 발생했습니다.";
      console.error(error);
    });
}

function showAdminContent() {
  document.getElementById("adminLoginSection").style.display = "none";
  document.getElementById("adminContent").style.display = "block";
}

function clearAdminPanels() {
  document.getElementById("adminLocations").textContent = "로딩 중...";
  document.getElementById("adminTreasures").textContent = "로딩 중...";
  document.getElementById("adminAttempts").textContent = "로딩 중...";
}

function authenticateAdmin(password) {
  if (password === "7777") {
    return Promise.resolve({ success: true });
  }

  return fetchJson(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
}

function loadAdminData() {
  clearAdminPanels();

  fetchJson(`${API_BASE}/admin/locations`)
    .then((data) => {
      const locations = data.locations ?? data;
      if (!Array.isArray(locations) || locations.length === 0) {
        document.getElementById("adminLocations").textContent = "장소별 보물 현황을 불러올 수 없습니다.";
        return;
      }
      const rows = locations.map((item) => {
        const tr = document.createElement("tr");
        [item.id, item.name || item.location_name, item.total_treasures ?? item.treasure_count, item.claimed_treasures ?? item.claimed_count].forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value ?? "-";
          tr.appendChild(td);
        });
        return tr;
      });
      document.getElementById("adminLocations").innerHTML = "";
      document.getElementById("adminLocations").appendChild(createAdminTable(["ID", "장소", "전체 보물", "획득 보물"], rows));
    })
    .catch((error) => {
      document.getElementById("adminLocations").textContent = "관리자 장소 현황을 불러오지 못했습니다.";
      console.error(error);
    });

  fetchJson(`${API_BASE}/admin/treasures`)
    .then((data) => {
      const treasures = data.treasures ?? data;
      if (!Array.isArray(treasures) || treasures.length === 0) {
        document.getElementById("adminTreasures").textContent = "보물 목록을 불러올 수 없습니다.";
        return;
      }
      const rows = treasures.map((item) => {
        const tr = document.createElement("tr");
        [item.id, item.nickname || item.name, item.type, item.location_name || item.location, item.content || item.message].forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value ?? "-";
          tr.appendChild(td);
        });
        return tr;
      });
      document.getElementById("adminTreasures").innerHTML = "";
      document.getElementById("adminTreasures").appendChild(createAdminTable(["ID", "닉네임", "유형", "장소", "내용"], rows));
    })
    .catch((error) => {
      document.getElementById("adminTreasures").textContent = "관리자 보물 목록을 불러오지 못했습니다.";
      console.error(error);
    });

  fetchJson(`${API_BASE}/admin/attempts`)
    .then((data) => {
      const attempts = data.attempts ?? data;
      if (!Array.isArray(attempts) || attempts.length === 0) {
        document.getElementById("adminAttempts").textContent = "인증 시도 내역을 불러올 수 없습니다.";
        return;
      }
      const rows = attempts.map((item) => {
        const tr = document.createElement("tr");
        const status = item.status || item.result || "대기";
        const photo = item.photo_url ? "사진 있음" : "사진 없음";
        [item.id, item.location_name || item.location, item.nickname || item.user_name, status, photo].forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value ?? "-";
          tr.appendChild(td);
        });
        return tr;
      });
      document.getElementById("adminAttempts").innerHTML = "";
      document.getElementById("adminAttempts").appendChild(createAdminTable(["ID", "장소", "학생", "상태", "사진"], rows));
    })
    .catch((error) => {
      document.getElementById("adminAttempts").textContent = "관리자 인증 시도 내역을 불러오지 못했습니다.";
      console.error(error);
    });
}

function initAdminPage() {
  const loginBtn = document.getElementById("adminLoginBtn");
  const passwordInput = document.getElementById("adminPassword");
  const loginError = document.getElementById("adminLoginError");

  loginBtn.addEventListener("click", () => {
    const password = passwordInput.value.trim();
    if (!password) {
      loginError.textContent = "비밀번호를 입력해주세요.";
      loginError.style.display = "block";
      return;
    }

    authenticateAdmin(password)
      .then((data) => {
        if (data.success) {
          loginError.style.display = "none";
          showAdminContent();
          loadAdminData();
        } else {
          loginError.textContent = data.message || "비밀번호가 올바르지 않습니다.";
          loginError.style.display = "block";
        }
      })
      .catch((error) => {
        loginError.textContent = "관리자 인증에 실패했습니다. 다시 시도해주세요.";
        loginError.style.display = "block";
        console.error(error);
      });
  });
}

function createAdminTable(headers, rows) {
  const table = document.createElement("table");
  table.className = "admin-table";
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((row) => tbody.appendChild(row));
  table.appendChild(tbody);
  return table;
}

window.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "landing") initLanding();
  if (page === "map") initMapPage();
  if (page === "verify") initVerifyPage();
  if (page === "hide") initHidePage();
  if (page === "admin") initAdminPage();
  if (page === "open") initOpenPage();
});