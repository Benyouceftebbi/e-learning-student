import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mic, Video as VideoIcon, Users, MessageCircle } from 'lucide-react';
import { subjectData } from './data/subjectData';
import BackButton from '../components/BackButton';
import { useSchool } from '../context/SchoolContext';

interface VideoContent {
  title: string;
  thumbnail: string;
  teacherName: string;
  scheduledFor?: string;
}

export default function VideoPage() {
  const { contentType, contentId } = useParams<{ contentType: string; contentId: string }>();
  const [content, setContent] = useState<VideoContent | null>(null);
  const { currentSchool } = useSchool();
  const themeColor = currentSchool?.themeColor || 'purple';

  useEffect(() => {

  }, [contentType, contentId]);

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">المحتوى غير موجود</h2>
          <BackButton themeColor={themeColor} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackButton themeColor={themeColor} />

      <div className="bg-black aspect-video rounded-lg overflow-hidden mb-8 relative">

          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${content.thumbnail})` }}
          >
            <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white text-center">
                <h2 className="text-2xl font-bold mb-4">{content.title}</h2>
                <p className={`text-${themeColor}-400`}>مع {content.teacherName}</p>
              </div>
            </div>
          </div>
        
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {content.title}
        </h1>
        <p className="text-gray-600 mb-2">المدرس: {content.teacherName}</p>
        <div className="prose max-w-none">
          <p className="text-gray-600">

             'شاهد هذا الدرس المسجل بالوتيرة التي تناسبك. يمكنك الإيقاف المؤقت، والتراجع، ومراجعة المحتوى حسب الحاجة.'
          </p>
        </div>
      </div>
    </div>
  );
}