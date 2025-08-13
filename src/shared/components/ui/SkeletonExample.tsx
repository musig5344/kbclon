import React from 'react';

import styled from 'styled-components';

import { tokens } from '../../../styles/tokens';

import {
  Skeleton,
  SkeletonGroup,
  TextSkeleton,
  AccountSkeleton,
  TransactionSkeleton,
  DashboardSkeleton,
  MenuItemSkeleton,
} from './index';

/**
 * Skeleton UI 사용 예제
 * - 다양한 스켈레톤 컴포넌트 사용법
 * - 커스텀 스켈레톤 레이아웃 예제
 */

const ExampleContainer = styled.div`
  padding: ${tokens.spacing[5]};
  background: ${tokens.colors.background.primary};
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.div`
  margin-bottom: ${tokens.spacing[8]};
`;

const Title = styled.h2`
  font-size: ${tokens.typography.fontSize.titleLarge};
  margin-bottom: ${tokens.spacing[4]};
  color: ${tokens.colors.text.primary};
`;

const Card = styled.div`
  background: ${tokens.colors.background.primary};
  border-radius: ${tokens.borderRadius.large};
  padding: ${tokens.spacing[5]};
  box-shadow: ${tokens.shadows.elevation2};
  margin-bottom: ${tokens.spacing[4]};
`;

// 사용자 프로필 카드 스켈레톤 예제
const ProfileCardSkeleton: React.FC = () => {
  const ProfileContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${tokens.spacing[4]};
  `;

  const ProfileInfo = styled.div`
    flex: 1;
  `;

  return (
    <Card>
      <ProfileContainer>
        {/* 프로필 이미지 */}
        <Skeleton width={80} height={80} variant='circular' />
        {/* 프로필 정보 */}
        <ProfileInfo>
          <SkeletonGroup $gap={12}>
            {/* 이름 */}
            <Skeleton width={120} height={24} variant='text' />
            {/* 이메일 */}
            <Skeleton width={180} height={16} variant='text' />
            {/* 상태 메시지 */}
            <Skeleton width={240} height={14} variant='text' />
          </SkeletonGroup>
        </ProfileInfo>
      </ProfileContainer>
    </Card>
  );
};

// 게시글 카드 스켈레톤 예제
const PostCardSkeleton: React.FC = () => {
  return (
    <Card>
      {/* 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
        }}
      >
        <Skeleton width={40} height={40} variant='circular' />
        <SkeletonGroup style={{ flex: 1 }}>
          <Skeleton width={100} height={16} variant='text' />
          <Skeleton width={80} height={12} variant='text' />
        </SkeletonGroup>
      </div>

      {/* 콘텐츠 */}
      <TextSkeleton lines={3} lastLineWidth='80%' />

      {/* 이미지 */}
      <Skeleton
        width='100%'
        height={200}
        variant='rectangular'
        style={{ marginTop: tokens.spacing[4], marginBottom: tokens.spacing[4] }}
      />

      {/* 액션 버튼들 */}
      <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
        <Skeleton width={60} height={32} variant='rectangular' />
        <Skeleton width={60} height={32} variant='rectangular' />
        <Skeleton width={60} height={32} variant='rectangular' />
      </div>
    </Card>
  );
};

// 테이블 스켈레톤 예제
const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
  `;

  const Th = styled.th`
    padding: ${tokens.spacing[3]};
    text-align: left;
    border-bottom: 2px solid ${tokens.colors.border.divider};
  `;

  const Td = styled.td`
    padding: ${tokens.spacing[3]};
    border-bottom: 1px solid ${tokens.colors.border.divider};
  `;

  return (
    <Table>
      <thead>
        <tr>
          <Th>
            <Skeleton width={80} height={16} variant='text' />
          </Th>
          <Th>
            <Skeleton width={120} height={16} variant='text' />
          </Th>
          <Th>
            <Skeleton width={100} height={16} variant='text' />
          </Th>
          <Th>
            <Skeleton width={80} height={16} variant='text' />
          </Th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <tr key={index}>
            <Td>
              <Skeleton width={60} height={14} variant='text' />
            </Td>
            <Td>
              <Skeleton width={150} height={14} variant='text' />
            </Td>
            <Td>
              <Skeleton width={80} height={14} variant='text' />
            </Td>
            <Td>
              <Skeleton width={100} height={14} variant='text' />
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

// 메인 예제 컴포넌트
export const SkeletonExample: React.FC = () => {
  return (
    <ExampleContainer>
      <Title>Skeleton UI Components 예제</Title>

      <Section>
        <h3>기본 Skeleton 컴포넌트</h3>
        <Card>
          <SkeletonGroup $gap={16}>
            <div>
              <p>Text variant:</p>
              <Skeleton width={200} height={16} variant='text' />
            </div>
            <div>
              <p>Circular variant:</p>
              <Skeleton width={60} height={60} variant='circular' />
            </div>
            <div>
              <p>Rectangular variant:</p>
              <Skeleton width={200} height={100} variant='rectangular' />
            </div>
          </SkeletonGroup>
        </Card>
      </Section>

      <Section>
        <h3>TextSkeleton (여러 줄)</h3>
        <Card>
          <TextSkeleton lines={4} lastLineWidth='60%' />
        </Card>
      </Section>

      <Section>
        <h3>프로필 카드 스켈레톤</h3>
        <ProfileCardSkeleton />
      </Section>

      <Section>
        <h3>게시글 카드 스켈레톤</h3>
        <PostCardSkeleton />
      </Section>

      <Section>
        <h3>테이블 스켈레톤</h3>
        <Card>
          <TableSkeleton rows={5} />
        </Card>
      </Section>

      <Section>
        <h3>계좌 섹션 스켈레톤</h3>
        <AccountSkeleton count={2} />
      </Section>

      <Section>
        <h3>거래내역 스켈레톤</h3>
        <TransactionSkeleton count={5} />
      </Section>

      <Section>
        <h3>메뉴 아이템 스켈레톤</h3>
        <Card>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: tokens.spacing[3],
            }}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <MenuItemSkeleton key={index} />
            ))}
          </div>
        </Card>
      </Section>
    </ExampleContainer>
  );
};

export default SkeletonExample;
