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
  const [participantCount, setParticipantCount] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const { currentSchool } = useSchool();
  const themeColor = currentSchool?.themeColor || 'purple';

  useEffect(() => {
    // Find content in subjectData
    const findContent = () => {
      for (const [subjectKey, subject] of Object.entries(subjectData)) {
        for (const teacher of subject.teachers) {
          if (contentType === 'recording') {
            const recording = teacher.recordings.find(r => `${teacher.id}-${r.id}` === contentId);
            if (recording) {
              setContent({
                title: recording.title,
                thumbnail: recording.thumbnail,
                teacherName: teacher.name
              });
              return;
            }
          } else if (contentType === 'stream') {
            const stream = teacher.liveStreams.find(s => `${teacher.id}-${s.id}` === contentId);
            if (stream) {
              setContent({
                title: stream.title,
                thumbnail: stream.thumbnail,
                teacherName: teacher.name,
                scheduledFor: stream.scheduledFor
              });
              return;
            }
          }
        }
      }
    };

    if (contentType && contentId) {
      findContent();
    }

    // Simulate random participant count changes for live streams
    if (contentType === 'stream') {
      const interval = setInterval(() => {
        setParticipantCount(prev => Math.min(prev + Math.floor(Math.random() * 2), 30));
      }, 5000);

      return () => clearInterval(interval);
    }
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
        {contentType === 'stream' ? (
          <div className="w-full h-full flex flex-col">
            {/* Main video area */}
            <div className="flex-1 bg-gray-900 relative">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-10"
                style={{ backgroundImage: `url(${content.thumbnail})` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold mb-4">{content.title}</h2>
                  <p className="text-xl text-white/80">مباشر مع {content.teacherName}</p>
                </div>
              </div>

              {/* Stream controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600'} hover:bg-opacity-80 transition-colors`}
                    >
                      <Mic className="h-5 w-5 text-white" />
                    </button>
                    <button 
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className={`p-3 rounded-full ${!isVideoOn ? 'bg-red-500' : 'bg-gray-600'} hover:bg-opacity-80 transition-colors`}
                    >
                      <VideoIcon className="h-5 w-5 text-white" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-white">
                      <Users className="h-5 w-5 mr-2" />
                      <span>{participantCount}</span>
                    </div>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {content.title}
        </h1>
        <p className="text-gray-600 mb-2">المدرس: {content.teacherName}</p>
        {content.scheduledFor && (
          <p className="text-gray-600 mb-2">مجدول لـ: {content.scheduledFor}</p>
        )}
        <div className="prose max-w-none">
          <p className="text-gray-600">
            {contentType === 'stream'
              ? 'أنت الآن متصل بالجلسة المباشرة. استخدم عناصر التحكم أعلاه لإدارة إعدادات الصوت والفيديو الخاصة بك.'
              : 'شاهد هذا الدرس المسجل بالوتيرة التي تناسبك. يمكنك الإيقاف المؤقت، والتراجع، ومراجعة المحتوى حسب الحاجة.'}
          </p>
        </div>
      </div>
    </div>
  );
}