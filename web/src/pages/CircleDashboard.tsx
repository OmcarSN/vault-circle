import { useParams } from 'react-router-dom';
export function CircleDashboard() { 
  const { id } = useParams();
  return <div className="page-container"><h1>Circle Dashboard: {id}</h1><p>Circle details and ledger go here.</p></div>; 
}
