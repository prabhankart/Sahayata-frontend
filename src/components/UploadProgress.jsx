import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const UploadProgress = ({ progress }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex flex-col justify-center items-center">
      <div style={{ width: 150, height: 150 }}>
        <CircularProgressbar
          value={progress}
          text={`${progress}%`}
          styles={buildStyles({
            textColor: '#fff',
            pathColor: '#6366F1', // Your primary color
            trailColor: 'rgba(255, 255, 255, 0.2)',
          })}
        />
      </div>
      <p className="text-white text-lg mt-4">Uploading media, please wait...</p>
    </div>
  );
};

export default UploadProgress;