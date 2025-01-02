import { useNavigate } from 'react-router-dom';
import { levelData } from './data/levelData';
import LevelCard from '../components/LevelCard';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const levelImages = {
  'elementary': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80',
  'middle-school': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80',
  'high-school': 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&q=80'
};

export default function LevelsPage() {
  const navigate = useNavigate();

  const handleLevelSelect = (levelId: string) => {
    navigate(`/level/${levelId}`);
  };

  
  const years = [
    { year: 'first-year', label: 'First Year',level:'h1',branches:["scientific","letterature",] },
    { year: 'second-year', label: 'Second Year',level:'h2' ,branches:["mathemathics","scientific","technicmath","letterature","languages","economics"]},
    { year: 'third-year', label: 'Third Year',level:'h3',branches:["mathemathics","scientific","technicmath","letterature","languages","economics"]},


  ];
  
  const subjects = [
    'math',
    'arabic',
    'french',
    'english',
    'science',
    'history',
    'islamic',
    "physics",
    "civil"
  ];
  const generateGroupIds = () => {
    const groupIds: string[] = [];
  
    years.forEach(({ year,level }) => {
      subjects.forEach((subject) => {
        groupIds.push(`${year}-${subject}-${level}`);
      });
    });
  
    return groupIds;
  };  
   const createGroupDocuments = async () => {
    try {
      const groupIds = generateGroupIds();
      const promises = groupIds.map(async (groupId) => {
        const parts = groupId.split('-');
        const last=parts[parts.length - 2]; // Get the last part
        const groupDocRef = doc(db, 'E-groups', groupId); // Reference to the document
        await setDoc(groupDocRef, {name:last==='math'?'Mathematics':last,teachers:[]}); // Create the document with default data
        console.log(`Group ${groupId} created successfully.`);
      });
  
      // Wait for all promises to resolve
      await Promise.all(promises);
      console.log('All groups created successfully.');
    } catch (error) {
      console.error('Error creating group documents:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">اختر مستواك الأكاديمي</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              اختر مرحلتك التعليمية وابدأ رحلتك نحو التميز
            </p>
          </div>
        </div>
      </div>

      {/* Levels Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(levelData).map(([id, level]) => (
            <LevelCard
              key={id}
              id={id}
              title={level.title}
              grades={level.grades}
              image={levelImages[id as keyof typeof levelImages]}
              onClick={() => handleLevelSelect(id)}
              themeColor="purple"
            />
          ))}
        </div>
      </div>
    </div>
  );
}