// src/data/emojiPaintingMap.js
// API에서 작품을 찾을 확률을 높이기 위해 키워드를 더 일반적이고 광범위하게 조정
export const emojiPaintingMap = {
    '😌': { keywordGroups: [['serene', 'calm', 'peaceful', 'landscape', 'portrait']], title: '모나리자 - 레오나르도 다빈치' },
    '🤩': { keywordGroups: [['masterpiece', 'grand', 'divine', 'light', 'awe', 'celestial', 'gold']], title: '아담의 창조 - 미켈란젤로' },
    '😂': { keywordGroups: [['joy', 'celebration', 'laughter', 'playful', 'children', 'vibrant']], title: '진주 귀고리를 한 소녀 - 요하네스 베르메르' },
    '😊': { keywordGroups: [['happiness', 'smile', 'love', 'warmth', 'flower', 'kindness']], title: '자화상 - 빈센트 반 고흐' },
    '😎': { keywordGroups: [['cool', 'style', 'fashion', 'modern', 'city', 'portrait']], title: '그랑드 자트 섬의 일요일 오후 - 조르주 쇠라' },
    '😁': { keywordGroups: [['vibrant', 'lively', 'music', 'dance', 'party', 'celebration']], title: '물랭 드 라 갈레트의 무도회 - 피에르 오귀스트 르누아르' },
    '🥰': { keywordGroups: [['love', 'romance', 'embrace', 'tenderness', 'couple', 'affection']], title: '키스 - 구스타프 클림트' },
    '🥳': { keywordGroups: [['party', 'festival', 'celebration', 'excitement', 'joyful']], title: '라스 메니나스 - 디에고 벨라스케스' },
    '😴': { keywordGroups: [['night', 'dream', 'stillness', 'sleep', 'moon', 'stars']], title: '별이 빛나는 밤 - 빈센트 반 고흐' },
    '🤯': { keywordGroups: [['abstract', 'surreal', 'geometric', 'mind', 'complex', 'chaos']], title: '절규 - 에드바르 뭉크' },
    '😡': { keywordGroups: [['peace', 'calm', 'tranquility', 'serene', 'healing', 'nature']], title: '1808년 5월 3일 - 프란시스코 고야' }, // 반대 감성
    '🥶': { keywordGroups: [['warmth', 'comfort', 'light', 'sun', 'summer', 'shelter']], title: '안개 바다 위의 방랑자 - 카스파르 다비트 프리드리히' }, // 반대 감성
    '🥺': { keywordGroups: [['hope', 'gentle', 'solace', 'innocence', 'vulnerability', 'light']], title: '비너스의 탄생 - 산드로 보티첼리' },
    '🤔': { keywordGroups: [['thought', 'philosophy', 'meditation', 'intellectual', 'contemplation', 'wisdom']], title: '생각하는 사람 - 오귀스트 로댕' },
    '🤫': { keywordGroups: [['secret', 'mystery', 'hidden', 'quiet', 'intimate', 'allegory']], title: '아메리칸 고딕 - 그랜트 우드' },
    '😭': { keywordGroups: [['solace', 'healing', 'hope', 'peace', 'comfort', 'renewal', 'light']], title: '최후의 만찬 - 레오나르도 다빈치' } // 감성 치유
};