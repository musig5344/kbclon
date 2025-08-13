import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';
/**
 * KB 스타뱅킹 사진전송 (OCR) 페이지
 * - 원본 KB 앱의 카메라/OCR UI 완벽 재현
 * - 계좌번호 스캔 기능 UI (실제 OCR 기능은 미구현)
 */
const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000000;
  display: flex;
  flex-direction: column;
`;
const Header = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  z-index: 10;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  img {
    width: 24px;
    height: 24px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  }
`;
const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;
const Spacer = styled.div`
  width: 40px;
`;
const CameraPreview = styled.div`
  flex: 1;
  position: relative;
  background-color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const PreviewMessage = styled.div`
  color: #666666;
  font-size: 16px;
  text-align: center;
  line-height: 1.5;
`;
const ScanGuide = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const GuideCorner = styled.img`
  position: absolute;
  width: 40px;
  height: 40px;
  &.top-left {
    top: 0;
    left: 0;
  }
  &.top-right {
    top: 0;
    right: 0;
  }
  &.bottom-left {
    bottom: 0;
    left: 0;
  }
  &.bottom-right {
    bottom: 0;
    right: 0;
  }
`;
const GuideText = styled.div`
  position: absolute;
  width: 100%;
  text-align: center;
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  &.top {
    top: -40px;
  }
  &.bottom {
    bottom: -40px;
  }
`;
const ScanLine = styled.div<{ isScanning: boolean }>`
  position: absolute;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(to right, 
    transparent 0%, 
    #ffd338 20%, 
    #ffd338 80%, 
    transparent 100%
  );
  box-shadow: 0 0 10px #ffd338;
  top: 20%;
  opacity: ${props => props.isScanning ? 1 : 0};
  animation: ${props => props.isScanning ? 'scanAnimation 2s linear infinite' : 'none'};
  @keyframes scanAnimation {
    0% {
      top: 20%;
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      top: 80%;
      opacity: 0;
    }
  }
`;
const BottomControls = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;
const ShutterButton = styled.button`
  width: 72px;
  height: 72px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  img {
    width: 100%;
    height: 100%;
  }
  &:active img {
    transform: scale(0.95);
  }
`;
const ModeSelector = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
`;
const ModeButton = styled.button<{ isActive?: boolean }>`
  background: none;
  border: none;
  color: ${props => props.isActive ? '#ffd338' : '#999999'};
  font-size: 14px;
  font-weight: ${props => props.isActive ? '600' : '400'};
  padding: 8px 12px;
  cursor: pointer;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #ffd338;
    opacity: ${props => props.isActive ? 1 : 0};
    transition: opacity 0.2s ease;
  }
`;
const InfoBox = styled.div`
  background-color: rgba(38, 40, 44, 0.9);
  border-radius: 8px;
  padding: 12px 16px;
  margin: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const InfoIcon = styled.div`
  width: 20px;
  height: 20px;
  background-color: #ffd338;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: #26282c;
`;
const InfoText = styled.div`
  flex: 1;
  color: white;
  font-size: 13px;
  line-height: 1.4;
`;
const GalleryButton = styled.button`
  position: absolute;
  bottom: 24px;
  right: 24px;
  bottom: calc(24px + env(safe-area-inset-bottom));
  background-color: rgba(38, 40, 44, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:active {
    background-color: rgba(38, 40, 44, 0.9);
  }
`;
type ScanMode = 'account' | 'giro' | 'qr';
const TransferPicturePage: React.FC = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('account');
  const handleClose = () => {
    navigate('/transfer');
  };
  const handleCapture = () => {
    setIsScanning(true);
    // 2초 후 스캔 완료 시뮬레이션
    setTimeout(() => {
      setIsScanning(false);
      // 실제로는 여기서 OCR 결과를 처리하고 이체 페이지로 데이터 전달
      navigate('/transfer', { 
        state: { 
          scannedData: {
            bank: 'KB국민은행',
            account: '123456-78-901234',
            name: '홍길동'
          }
        }
      });
    }, 2000);
  };
  const getModeText = () => {
    switch(scanMode) {
      case 'account':
        return '계좌번호가 인쇄된 부분을 화면에 맞춰주세요';
      case 'giro':
        return '지로용지의 번호와 금액을 화면에 맞춰주세요';
      case 'qr':
        return 'QR코드를 화면 중앙에 맞춰주세요';
      default:
        return '';
    }
  };
  return (
    <Container>
      <Header>
        <CloseButton onClick={handleClose}>
          <img src="/assets/images/icon_close_white.png" alt="닫기" />
        </CloseButton>
        <Title>사진전송</Title>
        <Spacer />
      </Header>
      <CameraPreview>
        <PreviewMessage>
          카메라 미리보기<br />
          (실제 카메라 기능은 미구현)
        </PreviewMessage>
        <ScanGuide>
          <GuideCorner 
            className="top-left" 
            src="/assets/images/img_cameraline_tl.png" 
            alt="" 
          />
          <GuideCorner 
            className="top-right" 
            src="/assets/images/img_cameraline_tr.png" 
            alt="" 
          />
          <GuideCorner 
            className="bottom-left" 
            src="/assets/images/img_cameraline_bl.png" 
            alt="" 
          />
          <GuideCorner 
            className="bottom-right" 
            src="/assets/images/img_cameraline_br.png" 
            alt="" 
          />
          <GuideText className="top">{getModeText()}</GuideText>
          <ScanLine isScanning={isScanning} />
          {scanMode === 'giro' && (
            <img 
              src="/assets/images/img_ocr_t.png" 
              alt="지로 가이드" 
              style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                opacity: 0.6 
              }} 
            />
          )}
        </ScanGuide>
        {isScanning && (
          <GuideText className="bottom" style={{ color: '#ffd338' }}>
            인식 중...
          </GuideText>
        )}
      </CameraPreview>
      <InfoBox>
        <InfoIcon>!</InfoIcon>
        <InfoText>
          {scanMode === 'account' && '통장, 카드, 명함 등에서 계좌번호를 자동으로 인식합니다'}
          {scanMode === 'giro' && '지로용지의 번호와 금액을 자동으로 인식합니다'}
          {scanMode === 'qr' && 'QR코드를 스캔하여 이체 정보를 자동으로 입력합니다'}
        </InfoText>
      </InfoBox>
      <BottomControls>
        <ModeSelector>
          <ModeButton 
            isActive={scanMode === 'account'}
            onClick={() => setScanMode('account')}
          >
            계좌번호
          </ModeButton>
          <ModeButton 
            isActive={scanMode === 'giro'}
            onClick={() => setScanMode('giro')}
          >
            지로
          </ModeButton>
          <ModeButton 
            isActive={scanMode === 'qr'}
            onClick={() => setScanMode('qr')}
          >
            QR코드
          </ModeButton>
        </ModeSelector>
        <ShutterButton onClick={handleCapture} disabled={isScanning}>
          <img 
            src={`/assets/images/bt_shutter_${isScanning ? 'dim' : 'nor'}.png`} 
            alt="촬영" 
          />
        </ShutterButton>
      </BottomControls>
      <GalleryButton>
        <span>🖼</span>
        <span>갤러리</span>
      </GalleryButton>
    </Container>
  );
};
export default TransferPicturePage;