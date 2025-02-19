import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase/firebaseConfig'; // Import your Firestore configuration
import { addDoc, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'; // Import Firestore functions

interface WaitingModalProps {
  onAccepted: () => void;
  onCancel: () => void;
  teacherId:string;
  streamId:string;
  studentId:string | null
}

export default function WaitingModal({ onAccepted, onCancel,teacherId,streamId,studentId }: WaitingModalProps) {
  const [waitTime, setWaitTime] = useState(0);
  const {subjectId } = useParams<{ subjectId: string }>();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
  
    const setupListener = async () => {
      try {
        const requestDocRef = doc(
          db,
          "E-groups",
          "fifth-year-arabic",
          "groups",
          teacherId,
          "livestreams",
          streamId,
          "requests",
          studentId
        );
  console.log("sdaSDASDaSdas",requestDocRef.path);
  
        // Check if the document exists
        const docSnap = await getDoc(requestDocRef);
  
        if (!docSnap.exists()) {
          // Create the document if it doesn't exist
          await setDoc(requestDocRef, {
            studentId: studentId,
            status: "waiting",
          });
        }
  
        // Listen for changes in the document
        unsubscribe = onSnapshot(requestDocRef, (doc) => {
          const data = doc.data();
          console.log(data);
          
          if (data) {
            if (data.status === "accepted") {
              console.log("adsdasdasd");
              
              onAccepted(); // Trigger accepted callback
            } else if (data.status === "rejected") {
              onCancel(); // Trigger rejected callback
            }
          }
        });
      } catch (error) {
        console.error("Error setting up Firestore listener:", error);
      }
    };
  
    // Call the setup function
    setupListener();
  
    // Update wait time every second
    const interval = setInterval(() => {
      setWaitTime((prev) => prev + 1);
    }, 1000);
  
    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe(); // Unsubscribe from Firestore listener
      }
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