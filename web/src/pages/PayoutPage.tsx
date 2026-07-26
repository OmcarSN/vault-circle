import { useParams } from 'react-router-dom';
export function PayoutPage() { 
  const { id } = useParams();
  return <div className="page-container"><h1>Claim Payout: {id}</h1><p>Payout claiming interface goes here.</p></div>; 
}
