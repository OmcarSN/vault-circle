import { useParams } from 'react-router-dom';
export function DepositPage() { 
  const { id } = useParams();
  return <div className="page-container"><h1>Deposit to Circle: {id}</h1><p>Deposit interface goes here.</p></div>; 
}
