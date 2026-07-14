import { useNavigate } from 'react-router-dom';
import acSav from '../../../assets/icons/ac-sav.svg';

function SavedLibraryButton({ className = 'learners-btn learners-btn-secondary' }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={className}
      onClick={() => navigate('/academia/learner/saved-library')}
    >
      <img src={acSav} alt="" />
      <span>Saved Library</span>
    </button>
  );
}

export default SavedLibraryButton;
