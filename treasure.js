const API_BASE = "https://dopamine-treasure-backend-production.up.railway.app";
const CONTACT_CHAT_URL = "https://open.kakao.com/o/sW4xEyqi";
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

function saveParticipantInfo(info) {
  try {
    localStorage.setItem("participantInfo", JSON.stringify(info));
  } catch (error) {
    console.warn("참여자 정보 저장 실패:", error);
  }
}

function getParticipantInfo() {
  try {
    const stored = localStorage.getItem("participantInfo");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn("참여자 정보 읽기 실패:", error);
    return null;
  }
}

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

function postFormData(url, formData) {
  return fetch(url, {
    method: "POST",
    body: formData
  }).then(async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
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

const TOTAL_QUESTIONS_PER_LOCATION = 10;

function getLocationQuestionCount(location) {
  const rawCount = location.remaining
    ?? location.remaining_treasure
    ?? location.available
    ?? location.available_count
    ?? location.remaining_mission
    ?? location.remaining_problems
    ?? location.questions_remaining
    ?? location.problem_count
    ?? location.missions_left
    ?? location.total_treasures
    ?? null;

  const count = rawCount == null ? null : Number(rawCount);
  return Number.isFinite(count) && count >= 0 ? count : null;
}

function createLocationCard(location) {
  const treasureCount = getLocationQuestionCount(location);
  const card = document.createElement("article");
  card.className = "location-card";

  const title = document.createElement("strong");
  title.textContent = location.name;

  const selectButton = makeButton("미션 선택", "primary location-select");
  selectButton.onclick = () => {
    if (treasureCount === 0) {
      alert("이 장소에는 보물이 없어요.");
      return;
    }
    window.location.href = `code.html?id=${location.id}`;
  };

  const info = document.createElement("p");
  info.className = "location-count";
  if (treasureCount === null) {
    info.textContent = "잔여 보물: 정보 없음";
  } else {
    info.textContent = `잔여 보물: ${treasureCount}개`;
    if (treasureCount <= 3) {
      info.classList.add("low-count");
    }
  }

  card.appendChild(title);
  card.appendChild(selectButton);
  card.appendChild(info);
  return card;
}

function createMapPoint(location) {
  const questionCount = getLocationQuestionCount(location);
  const point = document.createElement("button");
  point.type = "button";
  point.className = "point";
  point.title = questionCount === 0 ? `${location.name} (보물 없음)` : location.name;
  point.onclick = () => {
    if (questionCount === 0) {
      alert("이 장소에는 보물이 없어요.");
      return;
    }
    window.location.href = `code.html?id=${location.id}`;
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
  const goMap = document.getElementById("goMap");
  const goHide = document.getElementById("goHide");
  const goAdmin = document.getElementById("goAdmin");
  const goRule = document.getElementById("goRule");
  const participantSection = document.getElementById("participantModal");
  const ruleSection = document.getElementById("ruleModal");
  const participantForm = document.getElementById("participantInfoForm");
  const participantName = document.getElementById("participantName");
  const participantDepartment = document.getElementById("participantDepartment");
  const participantStudentId = document.getElementById("participantStudentId");
  const closeParticipantInfo = document.getElementById("closeParticipantInfo");
  const closeRuleInfo = document.getElementById("closeRuleInfo");
  let selectedAction = "map";

  const savedInfo = getParticipantInfo();
  if (savedInfo) {
    participantName.value = savedInfo.name || "";
    participantDepartment.value = savedInfo.department || "";
    participantStudentId.value = savedInfo.studentId || "";
  }

  function openParticipantSection(action) {
    selectedAction = action;
    participantSection.style.display = "flex";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeParticipantSection() {
    participantSection.style.display = "none";
  }

  function openRuleSection() {
    ruleSection.style.display = "flex";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeRuleSection() {
    ruleSection.style.display = "none";
  }

  goMap.onclick = () => openParticipantSection("map");
  goHide.onclick = () => openParticipantSection("hide");
  goAdmin.onclick = () => {
    location.href = "admin.html";
  };
  goRule.onclick = openRuleSection;
  closeParticipantInfo.onclick = closeParticipantSection;
  closeRuleInfo.onclick = closeRuleSection;

  participantForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = participantName.value.trim();
    const department = participantDepartment.value.trim();
    const studentId = participantStudentId.value.trim();

    if (!name || !department || !studentId) {
      alert("모든 참여자 정보를 입력해주세요.");
      return;
    }

    saveParticipantInfo({ name, department, studentId });
    if (selectedAction === "hide") {
      location.href = "choose.html";
    } else {
      location.href = "map.html";
    }
  });
}

function initMapPage() {
  const list = document.getElementById("locationList");
  const emptyState = document.getElementById("emptyState");
  const pointContainer = document.getElementById("mapPoints");
  const participantSummary = document.getElementById("participantSummary");
  const participantInfo = getParticipantInfo();

  // 카카오 지도 초기화
  const mapContainer = document.getElementById("mapContainer");
  const mapOptions = {
    center: new kakao.maps.LatLng(37.209157, 126.976904),
    level: 3
  };
  const map = new kakao.maps.Map(mapContainer, mapOptions);

  if (participantInfo) {
    participantSummary.innerHTML = `
      <h2>참여자 정보</h2>
      <p>학과: ${participantInfo.department}</p>
      <p>학번: ${participantInfo.studentId}</p>
      <p>이름: ${participantInfo.name}</p>
      <p id="treasureCountInfo">실시간 보물 현황을 불러오는 중입니다...</p>
    `;
  } else {
    participantSummary.innerHTML = `
      <h2>참여자 정보</h2>
      <p>보물찾기를 시작하려면 먼저 홈으로 돌아가 참여자 정보를 입력하세요.</p>
      <button type="button" class="secondary" onclick="location.href='treasure.html'">홈으로 돌아가기</button>
    `;
  }

  fetchJson(`${API_BASE}/locations`)
    .then((data) => {
      const locations = data.locations ?? data;
      if (!Array.isArray(locations) || locations.length === 0) {
        emptyState.textContent = "보물 장소를 찾을 수 없습니다.";
        return;
      }

      emptyState.style.display = "none";

      const totalRemaining = locations.reduce((sum, location) => {
        return sum + Number(location.remaining ?? location.remaining_treasure ?? location.available ?? 0);
      }, 0);
      const totalClaimed = locations.reduce((sum, location) => {
        return sum + Number(location.claimed_treasures ?? location.claimed_count ?? location.found ?? 0);
      }, 0);
      const totalQuestionCount = locations.reduce((sum, location) => {
        const count = getLocationQuestionCount(location);
        return sum + (count ?? 0);
      }, 0);
      const totalQuestionLimit = locations.length * TOTAL_QUESTIONS_PER_LOCATION;

      const treasureInfo = document.getElementById("treasureCountInfo");
      if (treasureInfo) {
        treasureInfo.textContent = `획득된 보물: ${totalClaimed}개 · 남은 보물: ${totalRemaining}개 · 문제 합계: ${totalQuestionCount}/${totalQuestionLimit}`;
      }

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
  const participantInfo = getParticipantInfo(); // ✅ 추가됨

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
  formData.append("image", file);

  // ✅ 안전 처리 (participantInfo 없을 때 터지는 거 방지)
  const participantInfo = getParticipantInfo();

  if (participantInfo) {
    formData.append("name", participantInfo.name || "");
    formData.append("student_id", participantInfo.student_id || participantInfo.studentId || "");    formData.append("department", participantInfo.department || "");
  }

  formData.append("agreed", "true");

  postFormData(url, formData)
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
  const savedInfo = getParticipantInfo();

  if (savedInfo) {
    document.getElementById("hideNickname").value = savedInfo.name || "";
    document.getElementById("hideDepartment").value = savedInfo.department || "";
    document.getElementById("hideStudentId").value = savedInfo.studentId || "";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    hideElement(resultBox);

    const payload = {
      nickname: document.getElementById("hideNickname").value.trim(),
      department: document.getElementById("hideDepartment").value.trim(),
      student_id: document.getElementById("hideStudentId").value.trim(),
      location_id: parseInt(document.getElementById("hideLocation").value, 10),
      type: document.getElementById("hideType").value,
      content: document.getElementById("hideContent").value.trim(),
      mission_question: document.getElementById("hideMission").value.trim(),
      mission_answer: document.getElementById("hideAnswer").value.trim()
    };

    if (!payload.nickname || !payload.department || !payload.student_id || !payload.content || !payload.mission_question || !payload.mission_answer) {
      alert("모든 항목을 빠짐없이 입력해주세요.");
      return;
    }

    saveParticipantInfo({
      name: payload.nickname,
      department: payload.department,
      studentId: payload.student_id
    });

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
  if (page === "gifticon") initGifticonPage();
});

function initGifticonPage() {
  const input = document.getElementById("gifticonInput");
  const submitBtn = document.getElementById("gifticonSubmit");
  const imagePreview = document.getElementById("giftImagePreview");
  const previewContainer = document.getElementById("giftPreviewContainer");

  let file = null;

  // 1. 사진 선택 시 미리보기 로직
  input.addEventListener("change", (e) => {
    file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        if (imagePreview) imagePreview.src = event.target.result;
        if (previewContainer) previewContainer.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // 2. OK 버튼 클릭 시 서버 전송 로직
  submitBtn.addEventListener("click", async () => {
    if (!file) {
      alert("기프티콘 사진을 먼저 등록해주세요!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file); 
    formData.append("treasure_type", "gifticon");
    formData.append("content", "기프티콘 보물"); 

    const info = getParticipantInfo();
    if (info) {
      formData.append("name", info.name || "익명");
      // 명세서 규격에 맞춰 student_id 사용
      formData.append("student_id", info.studentId || ""); 
      formData.append("department", info.department || "");
    }

    try {
      const res = await fetch(`${API_BASE}/treasures`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("기프티콘이 성공적으로 등록되었습니다!");
        location.href = "hide-place.html";
      } else {
        const errorData = await res.json();
        console.log("백엔드 에러 상세:", errorData); 
        alert("등록 실패: " + (errorData.message || "서버 데이터 형식을 확인하세요."));
      }
    } catch (err) {
      console.error("네트워크 에러:", err);
      alert("서버 연결에 실패했습니다.");
    }
  }); // <--- submitBtn 리스너 닫기
} // <--- initGifticonPage 함수 닫기 (여기서 빨간줄이 사라질 거예요)