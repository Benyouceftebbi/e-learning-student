import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase/firebaseConfig'; // Import your Firestore configuration
import { doc, onSnapshot } from 'firebase/firestore'; // Import Firestore functions

interface WaitingModalProps {
  onAccepted: () => void;
  onCancel: () => void;
  teacherId:string;
  streamId:string;
  studentId:string
}

export default function WaitingModal({ onAccepted, onCancel,teacherId,streamId,studentId }: WaitingModalProps) {
  const [waitTime, setWaitTime] = useState(0);
  const {subjectId } = useParams<{ subjectId: string }>();

  useEffect(() => {
    // Firestore document reference
    const docRef = doc(db, 'E-groups', "first-year-science-m1"); // Reference to the e-Groups document

    // Listen for changes in the document
    const unsubscribe = onSnapshot(docRef, (doc) => {
      const data = doc.data();
      if (data) {
        const teacher = data.teachers.find(t => t.teacherId === "tch1");
 
     
        if (teacher) {
          const livestream = teacher.livestreams.find(ls => ls.streamId === "str1");
 
          if (livestream) {
            const request = livestream.requests.find(r => r.studentId === "std1");
         
           
            if (request) {
             
              if (request.status === 'accepted') {
                onAccepted(); // Trigger accepted callback
              } else if (request.status === 'rejected') {
                onCancel(); // Trigger rejected callback
              }
            }
          }
        }
      }
    });



    // Update wait time every second
    const interval = setInterval(() => {
      setWaitTime(prev => prev + 1);
    }, 1000);

    // Cleanup function
    return () => {
      unsubscribe(); // Unsubscribe from Firestore listener
      clearInterval(interval);
    };
  }, [onAccepted, onCancel, subjectId, teacherId, streamId, studentId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            في انتظار المضيف
          </h2>
          
          <p className="text-gray-600 mb-6">
            يرجى الانتظار بينما يقوم المضيف بمراجعة طلبك للانضمام إلى الجلسة المباشرة.
            <br />
            <span className="text-sm">
              وقت الانتظار: {waitTime} ثواني
            </span>
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((waitTime / 15) * 100, 100)}%` }}
            ></div>
          </div>
          
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            إلغاء الطلب
          </button>
        </div>
      </div>
    </div>
  );
}