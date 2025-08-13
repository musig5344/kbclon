import styled from 'styled-components';
export const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.headline};
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.kbBlack};
`;
export const Subtitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.title};
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.kbBlack};
`;
export const Body = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  font-size: ${({ theme }) => theme.typography.fontSize.subhead};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.kbBlack};
`;
export const Caption = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.fontWeight.light};
  font-size: ${({ theme }) => theme.typography.fontSize.body1};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textHint};
`; 