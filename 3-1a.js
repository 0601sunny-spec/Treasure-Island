const type = localStorage.getItem('hide_type');
const title = document.getElementById('rewardTitle');
const area = document.getElementById('inputArea');

// 1. 유형에 따른 UI 출력
if (type === 'message') {
    title.innerText = "센스있는 응원문구 남기기";
    area.innerHTML = '<textarea id="content" class="sh-textarea" placeholder="응원 문구를 작성해주세요"></textarea>';
} else {
    title.innerText = type === 'meme' ? "자존감 올려주는 짤 등록" : "기프티콘 등록";
    area.innerHTML = `
        <div class="sh-upload-box">
            <label for="file" class="sh-file-label">📸 사진 추가하기</label>
            <input type="file" id="file" accept="image/*">
            <img id="imagePreview" alt="미리보기">
        </div>
    `;

    // 이미지 미리보기 이벤트
    const fileInput = document.getElementById('file');
    const preview = document.getElementById('imagePreview');

    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block'; // 사진 선택 시 표시
                // 사진 데이터를 임시 저장 (용량이 클 수 있으니 주의)
                localStorage.setItem('hide_reward_content', e.target.result); 
            }
            reader.readAsDataURL(file);
        }
    });
}

// 2. 다음 단계 이동
document.getElementById('nextBtn').addEventListener('click', () => {
    if (type === 'message') {
        const msg = document.getElementById('content').value;
        if(!msg) return alert("문구를 입력해주세요!");
        localStorage.setItem('hide_reward_content', msg);
    } else {
        const preview = document.getElementById('imagePreview');
        if(!preview.src || preview.style.display === 'none') {
            return alert("사진을 등록해주세요!");
        }
    }
    location.href = '3-2.html';
});