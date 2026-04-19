window.onload = function () {
    const finishBtn = document.getElementById('sh-finishBtn');
    const modal = document.getElementById('sh-confirmModal');
    const finalOk = document.getElementById('sh-finalOk');
    const finalNo = document.getElementById('sh-finalNo');

    // [중요] 백엔드 서버 주소를 정확히 입력하세요 (마지막에 / 는 빼주세요)
    const API_URL = "https://dopamine-treasure-backend-production.up.railway.app";

    if (finishBtn) {
        finishBtn.onclick = function () {
            const content = document.getElementById('sh-mContent').value;
            const answer = document.getElementById('sh-mAnswer').value;

            if (!content || !answer) {
                alert("문제와 정답을 모두 입력해주세요!");
                return;
            }
            modal.style.setProperty('display', 'flex', 'important');
        };
    }

    if (finalNo) {
        finalNo.onclick = function () {
            modal.style.display = 'none';
        };
    }

    if (finalOk) {
        finalOk.onclick = async function () {
            try {
                // 1. 데이터 수집
                const info = JSON.parse(localStorage.getItem('hide_info')) || {};
                console.log("info:", info);
                const treasureType = localStorage.getItem('hide_type');
                const locationId = localStorage.getItem('hide_location');
                const rewardContent = localStorage.getItem('hide_reward_content') || ""; // 메시지 텍스트 또는 이미지 Base64

                const missionContent = document.getElementById('sh-mContent').value;
                const missionAnswer = document.getElementById('sh-mAnswer').value;

                if (!locationId) {
                    alert("위치 정보 없음");
                    return;
                }

                // 2. FormData 바구니 생성 (명세서 v13 규격)
                const formData = new FormData();
                formData.append('location_id', parseInt(locationId));
                formData.append('mission_content', missionContent);
                formData.append('mission_answer', missionAnswer);

                // 아래 세 줄이 핵심입니다. 데이터가 없으면 강제로 기본값을 박습니다.
                formData.append('name', info.name || "테스터");
                formData.append('student_id', info.studentId || info.student_id || "00000000");
                formData.append('department', info.department || "미소속"); // 중복 제거하고 한 번만!

                formData.append('treasure_type', treasureType);


                // 3. 보상 내용 처리
                if (treasureType === 'message') {
                    formData.append('content', rewardContent);
                } else {
                    if (rewardContent.startsWith('data:image')) {
                        const response = await fetch(rewardContent);
                        const blob = await response.blob();
                        formData.append('image', blob, 'treasure_file.png');
                    }

                    if (treasureType === 'gifticon') {
                        formData.append('content', rewardContent);
                    }
                }
                formData.append('mission_type', 'quiz');

                for (let pair of formData.entries()) {
                    console.log(pair[0] + ':', pair[1]);
                }

                // 4. 백엔드 전송 (명세서의 POST /treasures 호출)
                const res = await fetch(`${API_URL}/treasures`, {
                    method: 'POST',
                    body: formData
                    // 주의: headers는 여전히 비워둬야 합니다. FormData가 알아서 채워줍니다.
                });

                if (res.ok) {
                    alert("성공적으로 등록되었습니다!");
                    localStorage.clear(); // 전송 완료 후 저장소 비우기
                    location.href = 'finish.html';
                } else {
                    const errorMsg = await res.text();
                    alert("서버 전송 실패: " + errorMsg);
                }
            } catch (error) {
                console.error("에러:", error);
                alert("연결에 실패했습니다. API 주소와 네트워크를 확인하세요.");
            }
        };
    }
};