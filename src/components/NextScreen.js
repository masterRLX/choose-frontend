import React, { useState, useEffect, useCallback, useRef } from 'react';

function NextScreen({ paintingDetails, isLoading, error, onClose, onNextClick }) {
    // 화면에 실제로 표시되는 그림을 관리하는 상태
    const [displayPainting, setDisplayPainting] = useState(null);
    // 페이드인/아웃 효과를 제어하는 상태
    const [isFading, setIsFading] = useState(false);
    
    const intervalRef = useRef(null);
    const transitionTimeoutRef = useRef(null);

    useEffect(() => {
        // 컴포넌트가 처음 마운트될 때, 초기 그림 데이터를 즉시 표시 상태로 설정
        // 또는 새로운 그림 데이터(prop)가 들어왔고, 현재 표시된 그림과 다를 때
        if (paintingDetails && (!displayPainting || paintingDetails.img_hq !== displayPainting.img_hq)) {
            // 새 그림 로드 시작 시 기존 그림을 fade-out 시키거나 초기화
            setIsFading(false); // 먼저 숨김

            // 기존 타임아웃이 있다면 클리어
            if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);

            // 유령 로딩 시작 (고화질 이미지 미리 로드)
            const highResLoader = new Image();
            highResLoader.src = paintingDetails.img_hq;

            highResLoader.onload = () => {
                // 고화질 이미지 로딩 완료 후, 일정 시간(transitionTimeoutRef) 후에 표시
                transitionTimeoutRef.current = setTimeout(() => {
                    setDisplayPainting(paintingDetails);
                    // 아주 잠깐의 틈을 준 뒤 fade-in 신호를 보냄 (애니메이션 스킵 방지)
                    setTimeout(() => {
                        setIsFading(true);
                    }, 50); // 짧은 딜레이로 페이드인 시작
                }, displayPainting ? 1500 : 0); // 기존 그림이 있다면 페이드아웃 시간만큼 기다림 (1.5초)
            };
            highResLoader.onerror = () => {
                // 고화질 로딩 실패 시 다음 그림으로 넘어감
                console.warn("Failed to load high-res image, attempting next painting.");
                onNextClick();
            };
        } else if (!paintingDetails && displayPainting) {
             // paintingDetails가 null이 되면 화면을 비움 (ex: 에러나서 그림이 없을때)
             setIsFading(false);
             setTimeout(() => setDisplayPainting(null), 1500); // fade-out 시간만큼 기다린 후 비움
        }
        
        return () => {
            if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        };
    }, [paintingDetails, displayPainting, onNextClick]);
    
    // 1분 자동 전환 타이머
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (!error && displayPainting) {
            intervalRef.current = setInterval(() => {
                if (!isLoading) onNextClick();
            }, 60000);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [displayPainting, error, isLoading, onNextClick]);

    const handleKeyDown = useCallback((event) => {
        if (['Escape', 'Backspace', 'ArrowLeft'].includes(event.key)) {
            event.preventDefault();
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    
    return (
        <div id="nextScreen">
            {/* 로딩 중일 때 메시지 표시. displayPainting이 없으면 초기 로딩이거나 다음 그림을 기다리는 중 */}
            {(isLoading || (!displayPainting && !error)) && <p style={{color: '#fff', fontSize: '1.2rem'}}>...LOADING...</p>}
            {error && <div style={{position: 'absolute', zIndex: 20, color: 'orange'}}><p>{error}</p></div>}
            
            {displayPainting && (
                <div 
                    onClick={() => { if (!isLoading && !error) onNextClick(); }} 
                    style={{ cursor: isLoading || error ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
                >
                    <img
                        id="paintingImage"
                        alt={displayPainting.title}
                        src={displayPainting.img_hq}
                        style={{
                            opacity: isFading ? 1 : 0,
                            transition: 'opacity 1.5s ease-in-out'
                        }}
                    />
                     <div id="paintingInfo" style={{
                        opacity: isFading ? 1 : 0,
                        transition: 'opacity 1.5s ease-in-out'
                     }}>
                        {displayPainting.title} - {displayPainting.artist}
                    </div>
                    <button id="infoIcon" onClick={(e) => { e.stopPropagation(); if (displayPainting.objectURL) window.open(displayPainting.objectURL, '_blank'); }}>i</button>
                </div>
            )}
        </div>
    );
}

export default NextScreen;