import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherCard from '../components/TeacherCard';
import AuthModal from '../components/AuthModal';
import BackButton from '../components/BackButton';
import { subjectData } from './data/subjectData';
import { levelData } from './data/levelData'
import { useSchool } from '../context/SchoolContext';
import { db } from '../../firebase/firebaseConfig';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { BookOpen, Brain, GraduationCap, Users } from 'lucide-react';

export default function SubjectPage() {
  const { levelId, subjectId } = useParams<{ levelId: string; subjectId: string }>();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState('');
  const { currentSchool } = useSchool();
  const themeColor = currentSchool?.themeColor || 'purple';
  const [subject, setSubject] = useState<any>(null); // State to hold subject data
  const [loading, setLoading] = useState(true); // State to manage loading
  // Find the level and grade information for breadcrumb navigation
  const level = levelId ? levelData[levelId as keyof typeof levelData] : null;
  
  // Parse the subject path for breadcrumb
  const pathParts = subjectId?.split('-') || [];
  const gradeId = `${pathParts[0]}-${pathParts[1]}`;
  const grade = level?.grades.find(g => g.id === gradeId);

  

  const branchId = pathParts[2];
  const branch = grade?.branches?.find(b => b.id === branchId);
  const actualSubjectId =branch
  ?  `${pathParts[pathParts.length - 2]}-${pathParts[pathParts.length - 1]}`:`${pathParts[pathParts.length - 1]}`;

  const subjectName = branch
    ? branch.subjects.find(s => s.id === actualSubjectId)?.name
    : grade?.subjects?.find(s => s.id === actualSubjectId)?.name;


  
    useEffect(() => {
      const fetchSubjectData = async () => {
        try {
          const subjectDoc = await getDoc(doc(db,"E-groups","fifth-year-arabic"));
          if (subjectDoc.exists) {
            const groups = (await getDocs(collection(db,"E-groups","fifth-year-arabic","sub-groups"))).docs.map((grp) => ({ ...grp.data(), id: grp.id }));
            setSubject({ ...subjectDoc.data(), id: subjectDoc.id, teachers: groups });
          } else {
            console.error('Subject not found');
          }
        } catch (error) {
          console.error('Error fetching subject data:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchSubjectData();
    }, [subjectId]);
  
    if (loading) {
      return (
        <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center">
 <div className="relative w-24 h-24">
      {/* Outer spinning circle */}
      <div className="absolute inset-0 animate-spin-slow">
        <div className="absolute -left-4 top-1/2 -translate-y-1/2">
          <GraduationCap className="w-8 h-8 text-purple-500" />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
          <BookOpen className="w-8 h-8 text-purple-400" />
        </div>
        <div className="absolute -right-4 top-1/2 -translate-y-1/2">
          <Users className="w-8 h-8 text-purple-600" />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4">
          <Brain className="w-8 h-8 text-purple-700" />
        </div>
      </div>
      
      {/* Center pulsing circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse"></div>
      </div>
    </div>
        <p className="mt-8 text-purple-700 font-medium">Loading teachers...</p>
      </div>
      )
    }
  
    if (!subject) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">الموضوع غير موجود</h2>
            <button
              onClick={() => navigate(`/level/${levelId}`)}
              className="mt-4 text-purple-600 hover:text-purple-500"
            >
              العودة إلى المستوى
            </button>
          </div>
        </div>
      );
    }

  const handleWatchRecording = (teacherId: string, recordingId: string) => {
    setSelectedContent(`recording/${teacherId}-${recordingId}`);
    setIsAuthModalOpen(true);
  };

  const handleJoinLiveStream = (teacherId: string, streamId: string) => {
    setSelectedContent(`stream/${teacherId}-${streamId}`);
    setIsAuthModalOpen(true);

      //navigate(`/level/${levelId}/subject/${subjectId}/meeting`);
 
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
      <BackButton themeColor={themeColor} />
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <span>{level.title}</span>
        <span>/</span>
        <span>{grade?.name}</span>
        {branch && (
          <>
            <span>/</span>
            <span>{branch.name}</span>
          </>
        )}
        <span>/</span>
        <span className="font-medium text-gray-900">{subjectName}</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">{subjectName}</h1>

      <div className="space-y-8">
        {subject.teachers.map((teacher) => (
          <TeacherCard
            key={teacher.id}
            {...teacher}
            recordings={teacher.videos}
            liveStreams={teacher.liveSessions}
            onWatchRecording={handleWatchRecording}
            onJoinLiveStream={handleJoinLiveStream}
          />
        ))}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        contentType={selectedContent}
      />
    </div>
  );
}