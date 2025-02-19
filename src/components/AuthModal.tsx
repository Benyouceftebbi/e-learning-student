import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import WaitingModal from './WaitingModal';
import { auth, db } from '../../firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: string;
}

export default function AuthModal({ isOpen, onClose, contentType }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showWaiting, setShowWaiting] = useState(false);
  const [user,setUser]=useState(null)
  const navigate = useNavigate();
  const { levelId,subjectId } = useParams<{ levelId: string;subjectId: string }>();

  if (!isOpen) return null;

  // Parse content type to get teacher ID
  const [type, contentId] = contentType.split('/');
  const teacherId = contentId?.split('-')[0];
  const strId = contentId?.split('-')[1];



 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(''); // Clear previous errors
  
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (!user) {
        setError('Invalid email or password.');
        return;
      }
  
      // Generate session token
      const userAgent = navigator.userAgent;
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();
      const sessionToken = `${user.uid}-${userAgent}-${ip}`;
  
      // Firestore session reference
      const userDocRef = doc(db, 'sessions', user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const storedToken = userDoc.data()?.sessionToken;
  
        if (storedToken && storedToken !== sessionToken) {
          alert('You are already signed in on another device or browser.');
          return;
        }
      }
  
      // Save session token to Firestore
      await setDoc(userDocRef, { sessionToken });
      const groupDocRef = doc(db, "E-groups", subjectId, "groups", teacherId);

      // Fetch the document
      const groupDoc = await getDoc(groupDocRef);
      const groupData = groupDoc.data();
  
      // Check if the user is in the students array
      if (!groupData?.students || !groupData.students.includes(user.uid)) {
        setUser(user.uid)
        setShowWaiting(true);
        setError('You need to subscribe to this teacher\'s course to access their content.');
        return null;
      }
  
      // Handle access based on type
      if (type === 'stream') {
        setUser(user.uid)
           setShowWaiting(true);
      }else {
        onClose(); // Close modal or UI element
        navigate(`/watch/${contentType}`); // Navigate to content page
      }
    } catch (err: any) {
      console.error('Error during sign-in:', err);
      setError(err.message || 'An error occurred during sign-in.');
    }
  };

  const handleHostAccept = () => {
    onClose();
    navigate(`/level/${levelId}/subject/${subjectId}/meeting`);
  };

  if (showWaiting) {
    return (
      <WaitingModal
      teacherId={teacherId}
      streamId={strId}
      studentId={user}
        onAccepted={handleHostAccept}
        onCancel={() => {
          setShowWaiting(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          سجّل الدخول لـ {type === 'stream' ? 'الانضمام إلى البث المباشر' : 'مشاهدة التسجيل'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            تسجيل الدخول
          </button>
          <p className="text-center text-sm text-gray-600">
            ليس لديك حساب؟{' '}
            <a href="#" className="text-purple-600 hover:text-purple-500">
              سجّل الآن
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}