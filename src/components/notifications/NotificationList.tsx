/**
 * Notification List Component
 * 
 * 알림 목록을 표시하는 컴포넌트
 * - 알림 내역 표시
 * - 필터링 및 정렬
 * - 읽음/안읽음 상태 관리
 * - 알림 액션 처리
 */

import React, { useState, useMemo } from 'react';

import styled from 'styled-components';

import { 
  PushNotificationData, 
  NotificationType, 
  NotificationPriority 
} from '../../services/pushNotificationService';

import { useNotifications } from './NotificationProvider';

interface NotificationListProps {
  className?: string;
  maxItems?: number;
  showFilters?: boolean;
  onNotificationClick?: (notification: PushNotificationData) => void;
}

const Container = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
`;

const UnreadBadge = styled.span`
  background: #FF4444;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
  min-width: 20px;
  text-align: center;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const FilterDropdown = styled.select`
  padding: 6px 12px;
  border: 1px solid #DDD;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #FFD338;
  }
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #DDD;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #F5F5F5;
    border-color: #CCC;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const NotificationContainer = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const NotificationItem = styled.div<{ isRead: boolean; priority: NotificationPriority }>`
  padding: 16px 24px;
  border-bottom: 1px solid #F5F5F5;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: #FAFAFA;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => !props.isRead && `
    background: #FFFDF0;
    border-left: 4px solid #FFD338;
    
    &:hover {
      background: #FFFACD;
    }
  `}
  
  ${props => props.priority === NotificationPriority.CRITICAL && `
    border-left: 4px solid #F44336;
    background: #FFEBEE;
    
    &:hover {
      background: #FFCDD2;
    }
  `}
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const NotificationIcon = styled.div<{ type: NotificationType }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
  flex-shrink: 0;
  
  background: ${props => {
    switch (props.type) {
      case NotificationType.TRANSACTION:
        return 'linear-gradient(135deg, #4CAF50, #45A049)';
      case NotificationType.SECURITY:
        return 'linear-gradient(135deg, #F44336, #E53935)';
      case NotificationType.BALANCE_ALERT:
        return 'linear-gradient(135deg, #FF9800, #F57C00)';
      case NotificationType.BILL_REMINDER:
        return 'linear-gradient(135deg, #2196F3, #1976D2)';
      case NotificationType.PROMOTIONAL:
        return 'linear-gradient(135deg, #9C27B0, #7B1FA2)';
      case NotificationType.SYSTEM_MAINTENANCE:
        return 'linear-gradient(135deg, #607D8B, #455A64)';
      default:
        return 'linear-gradient(135deg, #FFD338, #FFCC00)';
    }
  }};
  
  &::after {
    content: '${props => {
      switch (props.type) {
        case NotificationType.TRANSACTION:
          return '💳';
        case NotificationType.SECURITY:
          return '🔒';
        case NotificationType.BALANCE_ALERT:
          return '📈';
        case NotificationType.BILL_REMINDER:
          return '📄';
        case NotificationType.PROMOTIONAL:
          return '🎁';
        case NotificationType.SYSTEM_MAINTENANCE:
          return '⚙️';
        default:
          return '🔔';
      }
    }}';
    color: white;
  }
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const NotificationTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
`;

const NotificationTime = styled.div`
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  margin-left: 12px;
`;

const NotificationBody = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PriorityBadge = styled.span<{ priority: NotificationPriority }>`
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  
  ${props => {
    switch (props.priority) {
      case NotificationPriority.CRITICAL:
        return `
          background: #FFEBEE;
          color: #C62828;
          border: 1px solid #FFCDD2;
        `;
      case NotificationPriority.HIGH:
        return `
          background: #FFF3E0;
          color: #F57C00;
          border: 1px solid #FFCC02;
        `;
      case NotificationPriority.NORMAL:
        return `
          background: #E3F2FD;
          color: #1976D2;
          border: 1px solid #BBDEFB;
        `;
      default:
        return `
          background: #F3E5F5;
          color: #7B1FA2;
          border: 1px solid #E1BEE7;
        `;
    }
  }}
`;

const TypeBadge = styled.span<{ type: NotificationType }>`
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  
  ${props => {
    switch (props.type) {
      case NotificationType.TRANSACTION:
        return 'background: #E8F5E8; color: #2E7D32;';
      case NotificationType.SECURITY:
        return 'background: #FFEBEE; color: #C62828;';
      case NotificationType.BALANCE_ALERT:
        return 'background: #FFF3E0; color: #F57C00;';
      case NotificationType.BILL_REMINDER:
        return 'background: #E3F2FD; color: #1976D2;';
      case NotificationType.PROMOTIONAL:
        return 'background: #F3E5F5; color: #7B1FA2;';
      case NotificationType.SYSTEM_MAINTENANCE:
        return 'background: #ECEFF1; color: #455A64;';
      default:
        return 'background: #FFFDE7; color: #F57F17;';
    }
  }}
`;

const EmptyState = styled.div`
  padding: 40px 24px;
  text-align: center;
  color: #999;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  color: #666;
  margin: 0 0 8px;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  color: #999;
  margin: 0;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  background: #F8F9FA;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #E9ECEF;
  }
`;

type FilterType = 'all' | NotificationType;
type SortType = 'newest' | 'oldest' | 'priority';

interface ExtendedNotification extends PushNotificationData {
  isRead: boolean;
  receivedAt: number;
}

const NotificationList: React.FC<NotificationListProps> = ({
  className,
  maxItems = 20,
  showFilters = true,
  onNotificationClick
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications();
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [displayCount, setDisplayCount] = useState(maxItems);

  // 목 데이터 (실제로는 useNotifications에서 가져온 데이터 사용)
  const mockExtendedNotifications: ExtendedNotification[] = notifications.map((notification, index) => ({
    ...notification,
    isRead: index % 3 !== 0, // 목 데이터로 일부를 안읽음으로 설정
    receivedAt: Date.now() - (index * 3600000) // 1시간 간격
  }));

  const filteredAndSortedNotifications = useMemo(() => {
    let filtered = mockExtendedNotifications;
    
    // 필터링
    if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }
    
    // 정렬
    filtered.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return b.receivedAt - a.receivedAt;
        case 'oldest':
          return a.receivedAt - b.receivedAt;
        case 'priority':
          const priorityOrder = {
            [NotificationPriority.CRITICAL]: 4,
            [NotificationPriority.HIGH]: 3,
            [NotificationPriority.NORMAL]: 2,
            [NotificationPriority.LOW]: 1
          };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        default:
          return 0;
      }
    });
    
    return filtered.slice(0, displayCount);
  }, [mockExtendedNotifications, filter, sort, displayCount]);

  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '지금';
    if (minutes < 60) return `${minutes}분 전`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    
    return new Date(timestamp).toLocaleDateString('ko-KR');
  };

  const getTypeLabel = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.TRANSACTION:
        return '거래';
      case NotificationType.SECURITY:
        return '보안';
      case NotificationType.BALANCE_ALERT:
        return '잔고';
      case NotificationType.BILL_REMINDER:
        return '청구서';
      case NotificationType.PROMOTIONAL:
        return '홀보';
      case NotificationType.SYSTEM_MAINTENANCE:
        return '시스템';
      default:
        return '알림';
    }
  };

  const getPriorityLabel = (priority: NotificationPriority): string => {
    switch (priority) {
      case NotificationPriority.CRITICAL:
        return '긴급';
      case NotificationPriority.HIGH:
        return '중요';
      case NotificationPriority.NORMAL:
        return '일반';
      default:
        return '낮음';
    }
  };

  const handleNotificationClick = (notification: ExtendedNotification) => {
    // 알림을 읽음으로 표시
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // 커스텀 핸들러 호출
    onNotificationClick?.(notification);
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + maxItems);
  };

  return (
    <Container className={className}>
      <Header>
        <Title>
          알림
          {unreadCount > 0 && <UnreadBadge>{unreadCount}</UnreadBadge>}
        </Title>
        
        {showFilters && (
          <HeaderActions>
            <FilterDropdown
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
            >
              <option value="all">전체</option>
              <option value={NotificationType.TRANSACTION}>거래</option>
              <option value={NotificationType.SECURITY}>보안</option>
              <option value={NotificationType.BALANCE_ALERT}>잔고</option>
              <option value={NotificationType.BILL_REMINDER}>청구서</option>
              <option value={NotificationType.PROMOTIONAL}>홀보</option>
              <option value={NotificationType.SYSTEM_MAINTENANCE}>시스템</option>
            </FilterDropdown>
            
            <FilterDropdown
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
            >
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="priority">중요도순</option>
            </FilterDropdown>
            
            {unreadCount > 0 && (
              <ActionButton onClick={markAllAsRead}>
                모두 읽음
              </ActionButton>
            )}
          </HeaderActions>
        )}
      </Header>
      
      <NotificationContainer>
        {filteredAndSortedNotifications.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🔔</EmptyIcon>
            <EmptyTitle>알림이 없습니다</EmptyTitle>
            <EmptyDescription>
              {filter === 'all' 
                ? '아직 받은 알림이 없습니다.'
                : `${getTypeLabel(filter as NotificationType)} 알림이 없습니다.`
              }
            </EmptyDescription>
          </EmptyState>
        ) : (
          <>
            {filteredAndSortedNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                isRead={notification.isRead}
                priority={notification.priority}
                onClick={() => handleNotificationClick(notification)}
              >
                <NotificationHeader>
                  <NotificationIcon type={notification.type} />
                  <NotificationContent>
                    <NotificationTitleRow>
                      <NotificationTitle>{notification.title}</NotificationTitle>
                      <NotificationTime>
                        {formatTime(notification.receivedAt)}
                      </NotificationTime>
                    </NotificationTitleRow>
                    
                    <NotificationBody>{notification.body}</NotificationBody>
                    
                    <NotificationMeta>
                      <TypeBadge type={notification.type}>
                        {getTypeLabel(notification.type)}
                      </TypeBadge>
                      
                      {notification.priority !== NotificationPriority.NORMAL && (
                        <PriorityBadge priority={notification.priority}>
                          {getPriorityLabel(notification.priority)}
                        </PriorityBadge>
                      )}
                    </NotificationMeta>
                  </NotificationContent>
                </NotificationHeader>
              </NotificationItem>
            ))}
            
            {mockExtendedNotifications.length > displayCount && (
              <LoadMoreButton onClick={handleLoadMore}>
                더 보기 ({mockExtendedNotifications.length - displayCount}개 더)
              </LoadMoreButton>
            )}
          </>
        )}
      </NotificationContainer>
    </Container>
  );
};

export default NotificationList;
