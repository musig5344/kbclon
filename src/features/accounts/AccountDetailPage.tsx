import React, { useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
/**
 * AccountDetailPage - TransactionHistoryPage로 리다이렉트
 * 원본 거래내역 조회는 TransactionHistoryPage에 구현되어 있음
 */
const AccountDetailPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  useEffect(() => {
    if (accountId) {
      navigate(`/account/${accountId}/transactions`, { replace: true });
    }
  }, [accountId, navigate]);
  return null;
};
export default AccountDetailPage;