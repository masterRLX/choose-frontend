import React, { useState, useEffect, useRef, useCallback } from 'react';

// 외부 파일 대신, 데이터를 이 파일 안에 직접 포함합니다.
const emojiPaintingMap = {
    '😌': { keywordGroups: [['portraits', 'landscapes', 'still life', 'serene']], title: '모나리자 - 레오나르도 다빈치' },
    '🤩': { keywordGroups: [['mythological', 'triumph', 'angels', 'cathedral', 'gold']], title: '아담의 창조 - 미켈란젤로' },
    '😂': { keywordGroups: [['celebration', 'dance', 'children', 'festival', 'playful']], title: '진주 귀고리를 한 소녀 - 요하네스 베르메르' },
    '😊': { keywordGroups: [['portraits', 'smile', 'mother', 'child', 'flowers']], title: '자화상 - 빈센트 반 고흐' },
    '😎': { keywordGroups: [['portraits', 'fashion', 'elegant', 'cityscape', 'modern art']], title: '그랑드 자트 섬의 일요일 오후 - 조르주 쇠라' },
    '😁': { keywordGroups: [['music', 'dance', 'party', 'laughing', 'vibrant']], title: '물랭 드 라 갈레트의 무도회 - 피에르 오귀스트 르누아르' },
    '🥰': { keywordGroups: [['love', 'couple', 'embrace', 'venus', 'mother and child']], title: '키스 - 구스타프 클림트' },
    '🥳': { keywordGroups: [['celebration', 'party', 'triumph', 'wedding', 'festival']], title: '라스 메니나스 - 디에고 벨라스케스' },
    '😴': { keywordGroups: [['night', 'landscapes', 'moon', 'dream', 'stillness']], title: '별이 빛나는 밤 - 빈센트 반 고흐' },
    '🤯': { keywordGroups: [['abstract art', 'surrealism', 'cubism', 'geometry']], title: '절규 - 에드바르 뭉크' },
    '😡': { keywordGroups: [['serene landscapes', 'still life with flowers', 'madonna and child', 'peace']], title: '1808년 5월 3일 - 프란시스코 고야' },
    '🥶': { keywordGroups: [['fire', 'sun', 'summer', 'flowers', 'warmth']], title: '안개 바다 위의 방랑자 - 카스파르 다비트 프리드리히' },
    '🥺': { keywordGroups: [['hope', 'light', 'angels', 'saints', 'charity'], ['sunrise', 'dawn', 'children'], ['gentle', 'soft', 'solace']], title: '비너스의 탄생 - 산드로 보티첼리' },
    '🤔': { keywordGroups: [['sculpture', 'philosophy', 'manuscripts', 'maps', 'self-portraits'], ['studio', 'artist', 'contemplation'], ['stillness', 'shadow', 'light']], title: '생각하는 사람 - 오귀스트 로댕' },
    '🤫': { keywordGroups: [['interiors', 'letters', 'window', 'symbols', 'allegory'], ['secret', 'glance', 'hidden'], ['quiet', 'intimate']], title: '아메리칸 고딕 - 그랜트 우드' },
    '😭': { keywordGroups: [['hope', 'light', 'landscapes', 'sunrise', 'solace'], ['prayer', 'faith', 'resilience'], ['healing', 'renewal', 'peace']], title: '최후의 만찬 - 레오나르도 다빈치' }
};

// test.html 시절의 원래 애니메이션 상수들을 모두 복원합니다.
const EFFECTIVE_ITEM_SIZE = 160;
const ROTATION_SPEED_DEGREES_PER_FRAME = 0.1;
const DRAG_SENSITIVITY = 0.2;
const DRAG_THRESHOLD_PX = 5;
const CLICK_ANIMATION_DURATION = 500;
const ARROW_PROXIMITY_RADIUS = 100;
const SINK_DURATION_TRANSFORM = 10000;
const SINK_DURATION_OPACITY = 2000;
const SINK_DISTANCE = 1500;
const MAX_BLUR = 30;
const SCREEN_SINK_START_DELAY = 0;
const SCREEN_SINK_DURATION_OPACITY = 2300;

function Carousel({ onEmojiSelect, onTransitionEnd }) {
    const mainContainerRef = useRef(null);
    const carouselWrapperRef = useRef(null);
    const carouselContainerRef = useRef(null);
    const prevBtnRef = useRef(null);
    const nextBtnRef = useRef(null);
    const [currentEmojis, setCurrentEmojis] = useState([]);
    const [currentRotation, setCurrentRotation] = useState(0);
    const [isInteractingWithCarousel, setIsInteractingWithCarousel] = useState(false);
    const [isCenterHoveredOrClicked, setIsCenterHoveredOrClicked] = useState(false);
    const [isHoveringAnyEmojiOrWrapper, setIsHoveringAnyEmojiOrWrapper] = useState(false);
    const [hoveredItemIndex, setHoveredItemIndex] = useState(-1);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const startRotationAtDragRef = useRef(0);
    const hasDraggedRef = useRef(false);
    const lastMouseXRef = useRef(0);
    const lastMoveTimestampRef = useRef(0);
    const currentDragVelocityRef = useRef(0);
    const animationFrameIdRef = useRef(null);
    const momentumAnimationFrameIdRef = useRef(null);
    const clickAnimationFrameIdRef = useRef(null);
    const animationStartTimeRef = useRef(null);
    const initialRotationForClickRef = useRef(0);
    const targetRotationForClickRef = useRef(0);
    const numItems = currentEmojis.length; // numItems는 currentEmojis에 의존
    const anglePerItem = numItems === 0 ? 0 : 360 / numItems; // anglePerItem은 numItems에 의존
    const radius = numItems === 0 ? 0 : Math.round((EFFECTIVE_ITEM_SIZE / 2) / Math.tan(Math.PI / numItems)) + 70; // radius는 numItems에 의존

    // handleInteractionEnd를 먼저 정의하여 다른 훅에서 참조할 수 있도록 합니다.
    const handleInteractionEnd = useCallback(() => {
        setIsInteractingWithCarousel(false);
    }, []); // 이 함수는 외부 상태에 의존하지 않으므로 빈 배열

    const handleInteractionStart = useCallback(() => {
        setIsInteractingWithCarousel(true);
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (clickAnimationFrameIdRef.current) {
            cancelAnimationFrame(clickAnimationFrameIdRef.current);
            clickAnimationFrameIdRef.current = null;
        }
        if (momentumAnimationFrameIdRef.current) {
            cancelAnimationFrame(momentumAnimationFrameIdRef.current);
            momentumAnimationFrameIdRef.current = null;
        }
    }, []); // 이 함수는 외부 상태에 의존하지 않으므로 빈 배열

    const easeOutQuad = useCallback((t) => t * (2 - t), []); // 외부 상태에 의존하지 않음

    const startMomentumAnimation = useCallback((initialVelocity) => {
        if (momentumAnimationFrameIdRef.current) cancelAnimationFrame(momentumAnimationFrameIdRef.current);
        let momentumVelocity = initialVelocity;
        const momentumDeceleration = 0.92; // 상수
        const minFlickVelocity = 0.05;     // 상수

        function animateMomentum() {
            setCurrentRotation(prev => prev + momentumVelocity);
            momentumVelocity *= momentumDeceleration;
            if (Math.abs(momentumVelocity) > minFlickVelocity) {
                momentumAnimationFrameIdRef.current = requestAnimationFrame(animateMomentum);
            } else {
                momentumAnimationFrameIdRef.current = null;
                handleInteractionEnd(); // 의존성 추가
            }
        }
        momentumAnimationFrameIdRef.current = requestAnimationFrame(animateMomentum);
    }, [handleInteractionEnd]); // handleInteractionEnd 추가

    const animateToTargetRotation = useCallback((targetRot) => {
        if (clickAnimationFrameIdRef.current) cancelAnimationFrame(clickAnimationFrameIdRef.current);
        initialRotationForClickRef.current = currentRotation; // currentRotation은 상태
        targetRotationForClickRef.current = targetRot;
        animationStartTimeRef.current = null;

        function step(timestamp) {
            if (!animationStartTimeRef.current) animationStartTimeRef.current = timestamp;
            const elapsed = timestamp - animationStartTimeRef.current;
            let progress = elapsed / CLICK_ANIMATION_DURATION; // CLICK_ANIMATION_DURATION은 상수
            if (progress > 1) progress = 1;
            const easedProgress = easeOutQuad(progress); // easeOutQuad는 함수
            const rotationDifference = targetRotationForClickRef.current - initialRotationForClickRef.current;
            setCurrentRotation(initialRotationForClickRef.current + rotationDifference * easedProgress);
            if (progress < 1) {
                clickAnimationFrameIdRef.current = requestAnimationFrame(step);
            } else {
                setCurrentRotation(targetRotationForClickRef.current);
                clickAnimationFrameIdRef.current = null;
                handleInteractionEnd(); // 의존성 추가
            }
        }
        clickAnimationFrameIdRef.current = requestAnimationFrame(step);
    }, [currentRotation, easeOutQuad, handleInteractionEnd]); // currentRotation, easeOutQuad, handleInteractionEnd 추가

    // updateCarouselDisplay는 여러 상태에 의존하므로 의존성 배열에 모두 포함
    const updateCarouselDisplay = useCallback(() => {
        if (!carouselContainerRef.current) return;
        carouselContainerRef.current.style.transform = `rotateY(${currentRotation}deg)`;
        let selectedIndex = numItems > 0 ? Math.round(-currentRotation / anglePerItem) % numItems : 0;
        if (selectedIndex < 0) selectedIndex += numItems;

        currentEmojis.forEach((item, index) => {
            const emojiElement = carouselContainerRef.current.children[index];
            if (!emojiElement) return;

            let itemAbsoluteAngle = numItems > 0 ? (index * anglePerItem + currentRotation) % 360 : 0;
            if (itemAbsoluteAngle > 180) itemAbsoluteAngle -= 360;
            else if (itemAbsoluteAngle < -180) itemAbsoluteAngle += 360;

            const distanceAngle = Math.abs(itemAbsoluteAngle);
            let blurAmount = 0, opacityAmount = 1, currentScale = 1;

            if (index === hoveredItemIndex) currentScale = 1.1;

            if (index === selectedIndex) {
                emojiElement.classList.add('selected');
            } else {
                emojiElement.classList.remove('selected');
                if (distanceAngle > 90) opacityAmount = Math.max(0, 1 - ((distanceAngle - 90) / 90));
                else opacityAmount = Math.max(0.3, 1 - (distanceAngle / 90 * 0.7));
                if (isCenterHoveredOrClicked) {
                    if (distanceAngle > 90) blurAmount = (distanceAngle - 90) / 90 * 7;
                    else blurAmount = distanceAngle / 90 * 5;
                }
            }
            // 가라앉는 중이 아니면 transform을 업데이트
            if (emojiElement.dataset.isSinking !== 'true') {
                emojiElement.style.opacity = opacityAmount;
                emojiElement.style.filter = `blur(${blurAmount}px)`;
                emojiElement.style.transform = `translate(-50%, -50%) rotateY(${index * anglePerItem}deg) translateZ(${radius}px) scale(${currentScale})`;
            }
        });
    }, [currentRotation, anglePerItem, numItems, hoveredItemIndex, isCenterHoveredOrClicked, currentEmojis, radius]); // 모든 의존성 포함

    // animateRotation은 isInteractingWithCarousel에 의존
    const animateRotation = useCallback(() => {
        if (!isInteractingWithCarousel) {
            setCurrentRotation(prev => prev - ROTATION_SPEED_DEGREES_PER_FRAME);
            animationFrameIdRef.current = requestAnimationFrame(animateRotation);
        } else {
            animationFrameIdRef.current = null;
        }
    }, [isInteractingWithCarousel]); // isInteractingWithCarousel 추가

    const startAutoRotation = useCallback(() => {
        if (!animationFrameIdRef.current && !isInteractingWithCarousel && !isHoveringAnyEmojiOrWrapper && numItems > 0) {
            animationFrameIdRef.current = requestAnimationFrame(animateRotation);
        }
    }, [animateRotation, isInteractingWithCarousel, isHoveringAnyEmojiOrWrapper, numItems]); // 모든 의존성 포함

    useEffect(() => {
        startAutoRotation();
    }, [startAutoRotation]); // startAutoRotation 추가

    const handleMouseDown = useCallback((e) => {
        if (e.button === 0) {
            isDraggingRef.current = true;
            startXRef.current = e.clientX;
            startRotationAtDragRef.current = currentRotation; // currentRotation은 상태
            handleInteractionStart(); // 의존성 추가
            if (carouselWrapperRef.current) carouselWrapperRef.current.style.cursor = 'grabbing';
            hasDraggedRef.current = false;
            lastMouseXRef.current = e.clientX;
            lastMoveTimestampRef.current = performance.now();
            currentDragVelocityRef.current = 0;
            e.preventDefault();
        }
    }, [currentRotation, handleInteractionStart]); // currentRotation, handleInteractionStart 추가

    const handleMouseMove = useCallback((e) => {
        if (isDraggingRef.current) {
            const deltaX = e.clientX - startXRef.current;
            if (Math.abs(deltaX) > DRAG_THRESHOLD_PX) { hasDraggedRef.current = true; } // DRAG_THRESHOLD_PX는 상수
            const rotationChange = deltaX * DRAG_SENSITIVITY; // DRAG_SENSITIVITY는 상수
            setCurrentRotation(startRotationAtDragRef.current + rotationChange); // startRotationAtDragRef는 ref
            const now = performance.now();
            const deltaXForVelocity = e.clientX - lastMouseXRef.current; // lastMouseXRef는 ref
            const deltaTimeForVelocity = now - lastMoveTimestampRef.current; // lastMoveTimestampRef는 ref
            if (deltaTimeForVelocity > 0) { currentDragVelocityRef.current = deltaXForVelocity / deltaTimeForVelocity; } // currentDragVelocityRef는 ref
            lastMouseXRef.current = e.clientX;
            lastMoveTimestampRef.current = now;
            e.preventDefault();
        }
    }, []); // ref.current 값은 의존성 배열에 넣지 않아도 됨 (클로저 문제 없음). 상수도 불변이라 괜찮음.

    const handleMouseUp = useCallback(() => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
            if (carouselWrapperRef.current) { carouselWrapperRef.current.style.cursor = 'grab'; }
            if (hasDraggedRef.current) {
                startMomentumAnimation(currentDragVelocityRef.current * DRAG_SENSITIVITY * 150); // DRAG_SENSITIVITY는 상수
            } else {
                handleInteractionEnd(); // 의존성 추가
            }
        }
    }, [startMomentumAnimation, handleInteractionEnd]); // startMomentumAnimation, handleInteractionEnd 추가

    const handleControlClick = useCallback((direction) => {
        handleInteractionStart(); // 의존성 추가
        const targetRot = currentRotation + (direction === 'prev' ? -anglePerItem : anglePerItem); // currentRotation, anglePerItem은 상태/파생 상태
        animateToTargetRotation(targetRot); // 의존성 추가
    }, [currentRotation, anglePerItem, handleInteractionStart, animateToTargetRotation]); // 모든 의존성 포함

    const handleWrapperHover = useCallback(() => {
        handleInteractionStart(); // 의존성 추가
        setIsHoveringAnyEmojiOrWrapper(true);
    }, [handleInteractionStart]); // handleInteractionStart 추가

    const handleWrapperMouseLeave = useCallback(() => {
        handleInteractionEnd(); // 의존성 추가
        setHoveredItemIndex(-1);
        setIsHoveringAnyEmojiOrWrapper(false);
    }, [handleInteractionEnd]); // handleInteractionEnd 추가

    const handleEmojiMouseOver = useCallback((index) => {
        handleInteractionStart(); // 의존성 추가
        const emojiElement = carouselContainerRef.current.children[index];
        if (emojiElement && emojiElement.classList.contains('selected')) { setIsCenterHoveredOrClicked(true); }
        setHoveredItemIndex(index);
        setIsHoveringAnyEmojiOrWrapper(true);
    }, [handleInteractionStart, isCenterHoveredOrClicked]); // handleInteractionStart, isCenterHoveredOrClicked 추가 (selectedIndex가 아닌 isCenterHoveredOrClicked가 정확한 의존성)

    const handleEmojiMouseOut = useCallback(() => {
        handleInteractionEnd(); // 의존성 추가
        setIsCenterHoveredOrClicked(false);
        setHoveredItemIndex(-1);
        setIsHoveringAnyEmojiOrWrapper(false);
    }, [handleInteractionEnd]); // handleInteractionEnd 추가

    // 마우스 이벤트 리스너를 한 곳에서 관리
    useEffect(() => {
        document.body.addEventListener('mouseup', handleMouseUp);
        document.body.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.body.removeEventListener('mouseup', handleMouseUp);
            document.body.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleMouseUp, handleMouseMove]); // handleMouseUp, handleMouseMove 추가

    const getElementCenter = useCallback((element) => {
        if (!element) return { x: 0, y: 0 };
        const rect = element.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, []); // 의존성 없음

    useEffect(() => {
        const mouseMoveHandler = (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            let showArrows = false;
            const prevBtnElement = prevBtnRef.current;
            const nextBtnElement = nextBtnRef.current;
            if (prevBtnElement) {
                const btnCenter = getElementCenter(prevBtnElement);
                if (Math.sqrt(Math.pow(mouseX - btnCenter.x, 2) + Math.pow(mouseY - btnCenter.y, 2)) < ARROW_PROXIMITY_RADIUS) { // ARROW_PROXIMITY_RADIUS는 상수
                    showArrows = true;
                }
            }
            if (nextBtnElement) {
                const btnCenter = getElementCenter(nextBtnElement);
                if (Math.sqrt(Math.pow(mouseX - btnCenter.x, 2) + Math.pow(mouseY - btnCenter.y, 2)) < ARROW_PROXIMITY_RADIUS) {
                    showArrows = true;
                }
            }
            if (isHoveringAnyEmojiOrWrapper) { // isHoveringAnyEmojiOrWrapper는 상태
                showArrows = true;
            }
            if (prevBtnElement) prevBtnElement.classList.toggle('visible', showArrows);
            if (nextBtnElement) nextBtnRef.current.classList.toggle('visible', showArrows); // nextBtnElement로 변경
        };
        document.body.addEventListener('mousemove', mouseMoveHandler);
        return () => document.body.removeEventListener('mousemove', mouseMoveHandler);
    }, [getElementCenter, isHoveringAnyEmojiOrWrapper]); // getElementCenter, isHoveringAnyEmojiOrWrapper 추가

    // currentRotation 또는 관련 상태가 변경될 때마다 updateCarouselDisplay 호출
    useEffect(() => {
        const animationId = requestAnimationFrame(updateCarouselDisplay);
        return () => cancelAnimationFrame(animationId);
    }, [currentRotation, hoveredItemIndex, isCenterHoveredOrClicked, updateCarouselDisplay]); // updateCarouselDisplay는 useCallback으로 감싸져 있으므로 안전

    return (
    <>
        <h1 className="main-title">Choose your moment.</h1>
        <div className="main-container" ref={mainContainerRef}>
            <button className="carousel-control left" ref={prevBtnRef} onClick={() => handleControlClick('prev')} onMouseOver={handleWrapperHover} onMouseOut={handleWrapperMouseLeave}>&lt;</button>
            <div className="carousel-wrapper" ref={carouselWrapperRef} onMouseDown={handleMouseDown} onMouseOver={handleWrapperHover} onMouseOut={handleWrapperMouseLeave}>
                <div className="carousel-container" ref={carouselContainerRef}>
                    {currentEmojis.map((item, index) => (
                        <div key={item.emoji} className="carousel-item" onClick={() => handleEmojiClick(item.emoji)} onMouseOver={() => handleEmojiMouseOver(index)} onMouseOut={() => handleEmojiMouseOut(index)}>
                            {item.emoji}
                        </div>
                    ))}
                </div>
            </div>
            <button className="carousel-control right" ref={nextBtnRef} onClick={() => handleControlClick('next')} onMouseOver={handleWrapperHover} onMouseOut={handleWrapperMouseLeave}>&gt;</button>
        </div>
    </>
    );
}

export default Carousel;