import { useNavigate } from 'react-router-dom';
import { JoinGame } from '../../components/Poker/JoinGame/JoinGame';

export const JoinPage = () => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center w-full py-8 flex-1'>
      <div className='w-full max-w-5xl flex justify-center'>
        <div className='w-full max-w-xl animate-fade-in-down'>
          <JoinGame open onClose={() => navigate('/')} />
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
