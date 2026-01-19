// 상태 관리
let currentStep = 1;
let selectedChoice = null;

// 캐릭터 상태 메시지
const characterStates = {
    step1: '눈썹문신 알아보는 중...',
    step2: '매장 탐색 중...',
    step3: '결정 고민 중...',
    step4: '비교 분석 중...',
    step5: '...'
};

// 캐릭터 이름
const characterName = '정숙';

// 캐릭터 여정별 생각 (단계별)
const journeyThoughts = {
    naver: [
        { phase: '발견', thought: '"네이버에서 눈썹문신 검색해볼까"', action: '네이버 검색' },
        { phase: '노출', thought: '"오잉? 여기 눈썹문신 하는 곳이네?"', action: '플레이스 발견' },
        { phase: '탐색', thought: '"리뷰 어떤지 볼까..."', action: '리뷰 확인' },
        { phase: '검증', thought: '"다른 곳이랑 뭐가 다르지?"', action: '정보 비교' },
        { phase: '행동', thought: '"여기로 해야겠다!"', action: '전화/예약' }
    ],
    instagram: [
        { phase: '발견', thought: '"인스타에서 눈썹문신 찾아볼까"', action: '인스타 검색' },
        { phase: '노출', thought: '"오 이 피드 괜찮은데?"', action: '콘텐츠 발견' },
        { phase: '탐색', thought: '"프로필 한번 볼까..."', action: '프로필 클릭' },
        { phase: '검증', thought: '"전후 사진 진짜인가?"', action: '홈페이지 방문' },
        { phase: '확신', thought: '"여긴 믿어도 되겠다"', action: '카카오톡 문의' },
        { phase: '행동', thought: '"여기로 할게요!"', action: '예약 완료' }
    ],
    referral: [
        { phase: '발견', thought: '"친구가 여기 좋다던데..."', action: '지인 추천 받음' },
        { phase: '탐색', thought: '"어디보자... 검색해볼까"', action: '매장 검색' },
        { phase: '검증', thought: '"친구 결과 괜찮았나?"', action: '후기 확인' },
        { phase: '확신', thought: '"친구가 추천했으니까"', action: '신뢰 형성' },
        { phase: '행동', thought: '"나도 해볼래요!"', action: '예약' }
    ],
    kakao: [
        { phase: '발견', thought: '"어디서 봤는데... 카톡으로 물어볼까"', action: '카카오톡 검색' },
        { phase: '탐색', thought: '"채널 추가해볼까"', action: '채널 추가' },
        { phase: '검증', thought: '"상담 한번 받아볼까..."', action: '문의 시작' },
        { phase: '확신', thought: '"답변이 친절하네"', action: '상담 진행' },
        { phase: '행동', thought: '"예약할게요!"', action: '예약' }
    ],
    unknown: [
        { phase: '???', thought: '"어디서 봤더라...?"', action: '??? (알 수 없음)' },
        { phase: '???', thought: '"뭔가 봤는데..."', action: '??? (알 수 없음)' },
        { phase: '???', thought: '"기억이 안 나네"', action: '??? (알 수 없음)' },
        { phase: '???', thought: '"그냥 문의해볼까"', action: '문의' },
        { phase: '행동', thought: '"예약은 했는데..."', action: '예약' }
    ]
};

// 각 단계별 전환율 데이터
const conversionRates = {
    naver: [100, 30, 50, 40, 70],
    instagram: [100, 10, 30, 40, 50, 70],
    referral: [100, 20, 60, 80, 90],
    kakao: [100, 15, 50, 60, 70],
    unknown: [100, '?', '?', '?', '?']
};

// 통제 가능 여부
const controllability = {
    naver: [false, false, false, true, true],
    instagram: [true, false, false, true, true, true],
    referral: [true, false, false, true, true],
    kakao: [false, false, true, true, true],
    unknown: [false, false, false, true, true]
};

// DOM 요소
const steps = document.querySelectorAll('.step');
const choiceButtons = document.querySelectorAll('.choice-btn');
const journeyMap = document.getElementById('journeyMap');
const controlContainer = document.getElementById('controlContainer');
const toStep3Btn = document.getElementById('toStep3');
const toStep4Btn = document.getElementById('toStep4');
const toStep5Btn = document.getElementById('toStep5');
const restartBtn = document.getElementById('restart');
const characterStatus = document.getElementById('characterStatus');
const currentThoughtEl = document.getElementById('currentThought');
const survivalFill = document.getElementById('survivalFill');
const survivalText = document.getElementById('survivalText');

// 초기화
function init() {
    choiceButtons.forEach(btn => {
        btn.addEventListener('click', handleChoice);
    });

    toStep3Btn.addEventListener('click', () => goToStep(3));
    toStep4Btn.addEventListener('click', () => goToStep(4));
    toStep5Btn.addEventListener('click', () => goToStep(5));
    restartBtn.addEventListener('click', restart);
}

// 선택 처리
function handleChoice(e) {
    const btn = e.currentTarget;
    selectedChoice = btn.dataset.choice;

    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = '';
        goToStep(2);
    }, 150);
}

// 단계 이동
function goToStep(stepNum) {
    steps.forEach(step => step.classList.remove('active'));

    const newStep = document.getElementById(`step${stepNum}`);
    newStep.classList.add('active');
    currentStep = stepNum;

    // 캐릭터 상태 업데이트
    updateCharacterStatus(stepNum);

    // 단계별 초기화
    if (stepNum === 2) {
        renderJourneyMap();
    } else if (stepNum === 3) {
        renderControlView();
    }
}

// 캐릭터 상태 업데이트
function updateCharacterStatus(stepNum) {
    characterStatus.textContent = characterStates[`step${stepNum}`];
}

// 누적 확률 계산
function calculateCumulativeProbability(rates) {
    let cumulative = 100;
    return rates.map((rate, index) => {
        if (index === 0) return 100;
        if (rate === '?') return '?';
        cumulative = Math.round(cumulative * (rate / 100));
        return cumulative;
    });
}

// 여정 맵 렌더링 (STEP 2)
function renderJourneyMap() {
    const journey = journeyThoughts[selectedChoice];
    const rates = conversionRates[selectedChoice];
    const cumulativeProbs = calculateCumulativeProbability(rates);

    journeyMap.innerHTML = '';

    let currentNodeIndex = 0;

    function showNextNode() {
        if (currentNodeIndex >= journey.length) {
            // 모든 노드 표시 완료 후 최종 결과
            showFinalResult(cumulativeProbs[cumulativeProbs.length - 1]);
            return;
        }

        const step = journey[currentNodeIndex];
        const survival = cumulativeProbs[currentNodeIndex];
        const rate = rates[currentNodeIndex];

        // 캐릭터 생각 업데이트
        if (currentThoughtEl) {
            currentThoughtEl.textContent = step.thought;
        }

        // 노드 생성
        const node = document.createElement('div');
        node.className = 'journey-node';
        if (currentNodeIndex === journey.length - 1) {
            node.classList.add('current');
        }

        const phaseEl = document.createElement('span');
        phaseEl.className = 'node-phase';
        phaseEl.textContent = step.phase;

        const actionEl = document.createElement('span');
        actionEl.className = 'node-action';
        actionEl.textContent = step.action;

        const survivalEl = document.createElement('span');
        survivalEl.className = 'node-survival';
        if (survival === '?') {
            survivalEl.textContent = '?%';
        } else {
            survivalEl.textContent = `${survival}%`;
            if (survival <= 10) survivalEl.classList.add('critical');
            else if (survival <= 30) survivalEl.classList.add('low');
            else if (survival <= 60) survivalEl.classList.add('medium');
        }

        node.appendChild(phaseEl);
        node.appendChild(actionEl);
        node.appendChild(survivalEl);
        journeyMap.appendChild(node);

        // 노드 애니메이션
        setTimeout(() => node.classList.add('visible'), 50);

        // 생존 바 업데이트
        updateSurvivalBar(survival);

        // 화살표 추가 (마지막 노드 제외)
        if (currentNodeIndex < journey.length - 1) {
            const nextRate = rates[currentNodeIndex + 1];
            setTimeout(() => {
                const arrow = document.createElement('div');
                arrow.className = 'journey-arrow';

                const arrowIcon = document.createElement('span');
                arrowIcon.className = 'arrow';
                arrowIcon.textContent = '↓';

                const dropRate = document.createElement('span');
                dropRate.className = 'drop-rate';
                dropRate.textContent = nextRate === '?' ? '이탈 ?%' : `이탈 ${100 - nextRate}%`;

                arrow.appendChild(arrowIcon);
                arrow.appendChild(dropRate);
                journeyMap.appendChild(arrow);

                setTimeout(() => arrow.classList.add('visible'), 50);

                currentNodeIndex++;
                setTimeout(showNextNode, 600);
            }, 400);
        } else {
            currentNodeIndex++;
            setTimeout(showNextNode, 600);
        }
    }

    // 시작
    setTimeout(showNextNode, 300);
}

// 생존 바 업데이트
function updateSurvivalBar(survival) {
    if (survival === '?') {
        survivalFill.style.width = '50%';
        survivalText.innerHTML = '100명 중 <strong>?</strong>명 남음';
    } else {
        survivalFill.style.width = `${survival}%`;
        survivalText.innerHTML = `100명 중 <strong>${survival}</strong>명 남음`;
    }
}

// 최종 결과 표시
function showFinalResult(finalSurvival) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'final-probability';

    if (finalSurvival === '?') {
        resultDiv.innerHTML = `
            <span class="prob-number unknown">?</span>
            <span class="prob-text">100명이 검색해도<br><strong>몇 명</strong>이 예약하는지 모릅니다</span>
        `;
    } else {
        resultDiv.innerHTML = `
            <span class="prob-number">${finalSurvival}</span>
            <span class="prob-text">100명이 검색하면<br><strong>${finalSurvival}명</strong>만 예약합니다</span>
        `;
    }

    journeyMap.appendChild(resultDiv);
    setTimeout(() => resultDiv.classList.add('visible'), 100);

    // 마지막 생각 업데이트
    if (currentThoughtEl) {
        if (finalSurvival === '?') {
            currentThoughtEl.textContent = '"경로를 모르면 개선도 못해요"';
        } else if (finalSurvival <= 5) {
            currentThoughtEl.textContent = '"대부분 조용히 이탈했네요..."';
        } else {
            currentThoughtEl.textContent = '"여기로 할게요!"';
        }
    }
}

// 통제 영역 렌더링 (STEP 3)
function renderControlView() {
    const journey = journeyThoughts[selectedChoice];
    const control = controllability[selectedChoice];

    controlContainer.innerHTML = '';

    journey.forEach((step, index) => {
        const isControllable = control[index];

        // 노드 생성
        const node = document.createElement('div');
        node.className = `journey-node ${isControllable ? 'controllable' : 'uncontrollable'}`;

        const icon = document.createElement('span');
        icon.className = 'control-icon';
        icon.textContent = isControllable ? '⭕' : '❌';

        const phaseEl = document.createElement('span');
        phaseEl.className = 'node-phase';
        phaseEl.textContent = step.phase;

        const actionEl = document.createElement('span');
        actionEl.className = 'node-action';
        actionEl.textContent = step.action;

        node.appendChild(icon);
        node.appendChild(phaseEl);
        node.appendChild(actionEl);
        controlContainer.appendChild(node);

        // 순차적 애니메이션
        setTimeout(() => node.classList.add('visible'), index * 200);

        // 화살표 (마지막 제외)
        if (index < journey.length - 1) {
            const arrow = document.createElement('div');
            arrow.className = 'journey-arrow';
            arrow.innerHTML = '<span class="arrow">↓</span>';
            controlContainer.appendChild(arrow);

            setTimeout(() => arrow.classList.add('visible'), index * 200 + 100);
        }
    });

    // 통제 가능 개수 계산
    const controllableCount = control.filter(c => c).length;
    const uncontrollableCount = control.filter(c => !c).length;

    // 컨트롤 생각 업데이트
    const controlThought = document.getElementById('controlThought');
    if (controlThought) {
        setTimeout(() => {
            controlThought.textContent = `"${journey.length}단계 중 ${controllableCount}개만 설계 가능하네..."`;
        }, journey.length * 200 + 500);
    }
}

// 재시작
function restart() {
    currentStep = 1;
    selectedChoice = null;
    journeyMap.innerHTML = '';
    controlContainer.innerHTML = '';

    // 생존 바 초기화
    if (survivalFill) survivalFill.style.width = '100%';
    if (survivalText) survivalText.innerHTML = '100명 중 <strong>100</strong>명 남음';

    steps.forEach(step => step.classList.remove('active'));
    document.getElementById('step1').classList.add('active');

    updateCharacterStatus(1);
}

// 앱 시작
init();
