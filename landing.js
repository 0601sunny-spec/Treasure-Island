// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function () {
    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', handleScroll);

    // 초기 스크롤 상태 확인
    handleScroll();

    // 모든 모달창 이벤트 리스너 설정
    setupAllModalListeners();

    // 버튼 효과 초기화
    initializeButtonEffects();
});

// 모든 모달창 이벤트 리스너 설정
function setupAllModalListeners() {
    // 규칙 모달창
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const rulesModalOverlay = document.getElementById('rulesModalOverlay');

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeRulesModal);
    }

    if (rulesModalOverlay) {
        rulesModalOverlay.addEventListener('click', function (e) {
            if (e.target === rulesModalOverlay) {
                closeRulesModal();
            }
        });
    }

    // 정보 입력 모달창 이벤트 리스너 설정
    setupInputModalListeners();
}

// 스크롤 이벤트 처리
function handleScroll() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}

// 맨위로 올라가기 기능
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 버튼 1: 규칙설명 -> 모달창 열기
function goToRules() {
    openRulesModal();
}

// 규칙 모달창 열기 1-0
function openRulesModal() {
    const modalOverlay = document.getElementById('rulesModalOverlay');
    const modalRulesBox = document.getElementById('modalRulesBox');

    // 규칙 내용 설정
    const rulesContent = `
        <div class="modal-rules-content">
            <p>찾으러 가기를 누르고 정보를 입력하면 <br>어느 장소에 보물이 숨겨져있는지 확인하고 선택할 수 있습니다. <br>선택 후 나오는 미션을 클리어하면 보물을 획득할 수 있습니다.</p>
            <p>숨기러 가기를 누르고 정보를 입력하면 <br>어떤 보물을 자신이 원하는 답을 입력하여 선택해 원하는 장소에 숨길 수 있습니다.</p>
            <p>오류나 불편사항이 있으면 아래 불편사항 제보하기를 눌러 오픈채팅 방에 문의해주세요.</p>
            <p>관리자 버튼은 관리자만 사용할 수 있습니다.</p>
        </div>
    `;

    modalRulesBox.innerHTML = rulesContent;

    // 모달창 표시
    modalOverlay.classList.add('active');

    // 스크롤 방지
    document.body.style.overflow = 'hidden';
}

// 규칙 모달창 닫기
function closeRulesModal() {
    const modalOverlay = document.getElementById('rulesModalOverlay');

    // 모달창 숨기기
    modalOverlay.classList.remove('active');

    // 스크롤 복원
    document.body.style.overflow = '';
}

// 정보 입력 모달창 열기
function openInputModal() {
    const modalOverlay = document.getElementById('inputModalOverlay');

    // 모달창 표시
    modalOverlay.classList.add('active');

    // 스크롤 방지
    document.body.style.overflow = 'hidden';
}

// 정보 입력 모달창 닫기
function closeInputModal() {
    const modalOverlay = document.getElementById('inputModalOverlay');

    // 모달창 숨기기
    modalOverlay.classList.remove('active');

    // 스크롤 복원
    document.body.style.overflow = '';
}

// 정보 입력 모달창 이벤트 리스너 설정
function setupInputModalListeners() {
    const modalCloseBtn = document.getElementById('inputModalCloseBtn');
    const modalOverlay = document.getElementById('inputModalOverlay');
    const submitBtn = document.getElementById('submitBtn');
    const treasureBtn = document.getElementById('treasureBtn');

    // 닫기 버튼 클릭 이벤트
    modalCloseBtn.addEventListener('click', function () {
        closeInputModal();
    });

    // 오버레이 클릭 시 닫기
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            closeInputModal();
        }
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const modalOverlay = document.getElementById('inputModalOverlay');
            if (modalOverlay.classList.contains('active')) {
                closeInputModal();
            }
        }
    });

    // 오케이 버튼 클릭 이벤트
    submitBtn.addEventListener('click', function () {
        submitForm();
    });
}

// 폼 제출 처리
function submitForm() {
    const department = document.getElementById('department').value;
    const studentId = document.getElementById('studentId').value;
    const name = document.getElementById('name').value;

    // 입력값 검증
    if (!department || !studentId || !name) {
        showMessage('모든 항목을 입력해주세요.');
        return;
    }

    // 여기에 서버 전송 로직 추가
    console.log('제출된 정보:', { department, studentId, name });

    // 성공 메시지
    showMessage('정보가 성공적으로 제출되었습니다.');

    // 잠시 후 모달창 닫고 다른 페이지로 이동
    setTimeout(() => {
        closeInputModal();
        // 다른 페이지로 이동 (사용자가 지정할 경로)
        window.location.href = '2-1.html'; // 이 경로는 사용자가 변경할 수 있음
    }, 1500);
}

// 메시지 표시 함수
function showMessage(message) {
    // 기존 메시지가 있다면 제거
    const existingMessage = document.querySelector('.message-popup');
    if (existingMessage) {
        existingMessage.remove();
    }

    // 새 메시지 생성
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-popup';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #333;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 2000;
        font-size: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    document.body.appendChild(messageDiv);

    // 3초 후 메시지 제거
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// 버튼 2: 찾으러가기 -> 정보입력 모달창 열기
function goToFind() {
    openInputModal('find');
}

// 버튼 3: 숨기러가기 -> 정보입력 모달창 열기
function goToHide() {
    openInputModal('hide');
}

// 정보 입력 모달창 열기 (모드별)
function openInputModal(mode) {
    const modalOverlay = document.getElementById('inputModalOverlay');

    // 모달창 표시
    modalOverlay.classList.add('active');

    // 스크롤 방지
    document.body.style.overflow = 'hidden';

    // 모드에 따른 제목 설정
    const modalTitle = document.querySelector('#inputModalContainer .modal-title');
    if (modalTitle) {
        modalTitle.textContent = mode === 'find' ? '찾으러 가기' : '숨기러 가기';
    }
}

// 버튼 4: 관리자 -> 관리자 비밀번호 인증페이지로 이동
function goToAdmin() {
    // 임시로 관리자 페이지로 이동
    window.location.href = 'admin.html';
}

// 버튼 5: 불편사항 제보하기 -> 오픈채팅 카톡창으로 이동
function goToReport() {
    window.open('https://open.kakao.com/o/sW4xEyqi', '_blank');
}

// 부드러운 스크롤 애니메이션
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 버튼 클릭 시 피드백 효과
document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            // 클릭 효과 추가
            this.style.transform = 'scale(0.95)';

            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });

        button.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});

// 로딩 애니메이션 (선택적)
window.addEventListener('load', function () {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
