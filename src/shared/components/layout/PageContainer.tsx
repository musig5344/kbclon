import styled from 'styled-components';

import { colors } from '../../../styles/colors';
import { responsiveContainer, responsiveContent } from '../../../styles/responsive';
import { tokens } from '../../../styles/tokens';
export const PageContainer = styled.div`
  ${responsiveContainer}
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f7f7f8;
  overflow: hidden;
`;
export const MainContent = styled.main`
  ${responsiveContent}
  flex: 1;
  padding-bottom: calc(60px + env(safe-area-inset-bottom)); /* TabBar height + safe area */
  min-height: calc(100vh - 48px); /* viewport height - header height */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;
export const Section = styled.div<{
  background?: string;
  padding?: string;
  marginBottom?: string;
  noBorder?: boolean;
}>`
  background-color: ${props => props.background || colors.white};
  padding: ${props => props.padding || '24px'};
  margin-bottom: ${props => props.marginBottom || '8px'};
  ${props => !props.noBorder && 'border-bottom: 8px solid #f5f6f8;'}
`;
export const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #26282c;
  margin: 0 0 16px 0;
`;
export const ContentCard = styled.div<{
  padding?: string;
  margin?: string;
  borderRadius?: string;
}>`
  background: ${tokens.colors.white};
  padding: ${props => props.padding || '16px'};
  margin: ${props => props.margin || '0'};
  border-radius: ${props => props.borderRadius || '8px'};
  border: 1px solid #ebeef0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;
export const FormSection = styled.div<{ marginBottom?: string }>`
  margin-bottom: ${props => props.marginBottom || '24px'};
  &:last-child {
    margin-bottom: 0;
  }
`;
export const FlexRow = styled.div<{
  gap?: string;
  justifyContent?: string;
  alignItems?: string;
  wrap?: boolean;
}>`
  display: flex;
  gap: ${props => props.gap || '8px'};
  justify-content: ${props => props.justifyContent || 'flex-start'};
  align-items: ${props => props.alignItems || 'center'};
  ${props => props.wrap && 'flex-wrap: wrap;'}
`;
export const FlexColumn = styled.div<{
  gap?: string;
  alignItems?: string;
  justifyContent?: string;
}>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.gap || '8px'};
  align-items: ${props => props.alignItems || 'stretch'};
  justify-content: ${props => props.justifyContent || 'flex-start'};
`;
export const Spacer = styled.div<{ height?: string; width?: string }>`
  height: ${props => props.height || '16px'};
  width: ${props => props.width || 'auto'};
  flex-shrink: 0;
`;
export const ScrollContainer = styled.div<{ maxHeight?: string }>`
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  max-height: ${props => props.maxHeight || 'none'};
  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: #cccccc transparent;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #cccccc;
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #999999;
  }
`;
// 특수한 용도의 컨테이너들
export const CenteredContainer = styled.div<{ minHeight?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.minHeight || '200px'};
  padding: 20px;
  text-align: center;
`;
export const LoadingContainer = styled(CenteredContainer)`
  color: #666666;
  font-size: 14px;
`;
export const ErrorContainer = styled(CenteredContainer)`
  color: #ff4444;
  font-size: 14px;
`;
export const EmptyContainer = styled(CenteredContainer)`
  color: #999999;
  font-size: 14px;
`;
