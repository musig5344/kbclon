/**
 * KB StarBanking 명령 팔레트 (Ctrl+K 스타일)
 * 키보드로 빠른 액션 실행 및 네비게이션
 */

import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback,
  KeyboardEvent,
  useMemo
} from 'react';

import styled from 'styled-components';

import { globalKeyboardTrapManager } from '../core/KeyboardTrapManager';
import { CommandPaletteItem, CommandPaletteOptions } from '../types';

interface CommandPaletteProps extends CommandPaletteOptions {
  isOpen: boolean;
  items: CommandPaletteItem[];
  onClose: () => void;
  onExecute: (item: CommandPaletteItem) => void;
  className?: string;
}

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  animation: ${props => props.isOpen ? 'fadeIn' : 'fadeOut'} 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @media (max-width: 640px) {
    margin: 0 16px;
    max-width: calc(100vw - 32px);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  border-bottom: 1px solid #eee;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 18px;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 20px 20px 20px 50px;
  border: none;
  background: transparent;
  font-size: 18px;
  outline: none;
  color: #333;
  
  &::placeholder {
    color: #999;
  }
`;

const ResultsContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
`;

const CategoryHeader = styled.div`
  padding: 12px 20px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f8f9fa;
  border-bottom: 1px solid #f0f0f0;
  
  &:not(:first-child) {
    border-top: 1px solid #f0f0f0;
  }
`;

const ResultItem = styled.div<{ isHighlighted?: boolean; disabled?: boolean }>`
  padding: 12px 20px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.1s ease;
  
  ${props => props.disabled && `
    opacity: 0.5;
    color: #999;
  `}
  
  ${props => props.isHighlighted && !props.disabled && `
    background: #f0f8ff;
    border-left: 4px solid #007bff;
  `}
  
  &:hover:not([disabled]) {
    background: #f8f9fa;
  }
`;

const ItemIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
  flex-shrink: 0;
`;

const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
`;

const ItemDescription = styled.div`
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemShortcut = styled.div`
  font-size: 11px;
  color: #999;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  flex-shrink: 0;
`;

const NoResults = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
`;

const Footer = styled.div`
  padding: 12px 20px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
`;

const FooterHint = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const KeyHint = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const KeyCode = styled.kbd`
  background: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: 'Courier New', monospace;
`;

// 퍼지 검색 함수
const fuzzySearch = (query: string, text: string): number => {
  const normalizedQuery = query.toLowerCase();
  const normalizedText = text.toLowerCase();
  
  if (normalizedText.includes(normalizedQuery)) {
    return normalizedQuery.length / normalizedText.length;
  }
  
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < normalizedText.length && queryIndex < normalizedQuery.length; i++) {
    if (normalizedText[i] === normalizedQuery[queryIndex]) {
      score += 1;
      queryIndex++;
    }
  }
  
  return queryIndex === normalizedQuery.length ? score / normalizedText.length : 0;
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  items,
  onClose,
  onExecute,
  placeholder = '명령어를 검색하세요...',
  maxResults = 50,
  enableFuzzySearch = true,
  showCategories = true,
  showShortcuts = true,
  theme = 'light',
  className
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 검색 결과 필터링 및 정렬
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return items.slice(0, maxResults);
    }
    
    const searchResults = items
      .map(item => {
        // 키워드와 제목, 설명에서 검색
        const titleScore = enableFuzzySearch 
          ? fuzzySearch(query, item.title)
          : item.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        
        const descriptionScore = enableFuzzySearch && item.description
          ? fuzzySearch(query, item.description) * 0.7
          : (item.description?.toLowerCase().includes(query.toLowerCase()) ? 0.7 : 0);
        
        const keywordScore = item.keywords.some(keyword => 
          enableFuzzySearch
            ? fuzzySearch(query, keyword) > 0.5
            : keyword.toLowerCase().includes(query.toLowerCase())
        ) ? 0.8 : 0;
        
        const totalScore = Math.max(titleScore, descriptionScore, keywordScore);
        
        return { item, score: totalScore };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(result => result.item);
    
    return searchResults;
  }, [query, items, maxResults, enableFuzzySearch]);

  // 카테고리별 그룹화
  const groupedItems = useMemo(() => {
    if (!showCategories) {
      return { '': filteredItems };
    }
    
    const groups: Record<string, CommandPaletteItem[]> = {};
    
    filteredItems.forEach(item => {
      const category = item.category || '기타';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    
    return groups;
  }, [filteredItems, showCategories]);

  // 플랫 아이템 리스트 (키보드 네비게이션용)
  const flatItems = useMemo(() => {
    return Object.values(groupedItems).flat().filter(item => item.enabled !== false);
  }, [groupedItems]);

  // 키보드 네비게이션
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < flatItems.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : flatItems.length - 1
        );
        break;
        
      case 'Enter':
        event.preventDefault();
        if (flatItems[selectedIndex]) {
          executeCommand(flatItems[selectedIndex]);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
        
      case 'Tab':
        event.preventDefault();
        break;
    }
  }, [flatItems, selectedIndex, onClose]);

  // 명령 실행
  const executeCommand = useCallback(async (item: CommandPaletteItem) => {
    if (item.enabled === false) return;
    
    try {
      onExecute(item);
      await item.action();
      onClose();
    } catch (error) {
      console.error('Command execution failed:', error);
    }
  }, [onExecute, onClose]);

  // 검색어 변경
  const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    setSelectedIndex(0);
  }, []);

  // 아이템 클릭
  const handleItemClick = useCallback((item: CommandPaletteItem, index: number) => {
    setSelectedIndex(index);
    executeCommand(item);
  }, [executeCommand]);

  // 키보드 트랩 설정
  useEffect(() => {
    if (isOpen && containerRef.current) {
      globalKeyboardTrapManager.addTrap(containerRef.current, {
        autoFocus: true,
        escapeDeactivates: true,
        returnFocusOnDeactivate: true
      });
      
      // 입력 필드에 포커스
      inputRef.current?.focus();
      
      return () => {
        if (containerRef.current) {
          globalKeyboardTrapManager.removeTrap(containerRef.current);
        }
      };
    }
  }, [isOpen]);

  // 선택된 아이템으로 스크롤
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  // 검색어 초기화
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClick={onClose}>
      <Container
        ref={containerRef}
        className={className}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <SearchContainer>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
          />
        </SearchContainer>

        <ResultsContainer ref={resultsRef}>
          {Object.keys(groupedItems).length === 0 ? (
            <NoResults>
              검색 결과가 없습니다
            </NoResults>
          ) : (
            Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category}>
                {showCategories && category && (
                  <CategoryHeader>{category}</CategoryHeader>
                )}
                {categoryItems.map((item, index) => {
                  const flatIndex = flatItems.indexOf(item);
                  return (
                    <ResultItem
                      key={item.id}
                      isHighlighted={flatIndex === selectedIndex}
                      disabled={item.enabled === false}
                      onClick={() => handleItemClick(item, flatIndex)}
                    >
                      {item.icon && (
                        <ItemIcon>{item.icon}</ItemIcon>
                      )}
                      <ItemContent>
                        <ItemTitle>{item.title}</ItemTitle>
                        {item.description && (
                          <ItemDescription>{item.description}</ItemDescription>
                        )}
                      </ItemContent>
                      {showShortcuts && item.shortcut && (
                        <ItemShortcut>
                          {Array.isArray(item.shortcut) ? item.shortcut.join(' + ') : item.shortcut}
                        </ItemShortcut>
                      )}
                    </ResultItem>
                  );
                })}
              </div>
            ))
          )}
        </ResultsContainer>

        <Footer>
          <FooterHint>
            <KeyHint>
              <KeyCode>↑↓</KeyCode> 탐색
            </KeyHint>
            <KeyHint>
              <KeyCode>Enter</KeyCode> 실행
            </KeyHint>
            <KeyHint>
              <KeyCode>Esc</KeyCode> 닫기
            </KeyHint>
          </FooterHint>
          <div>
            {flatItems.length}개 결과
          </div>
        </Footer>
      </Container>
    </Overlay>
  );
};

export default CommandPalette;