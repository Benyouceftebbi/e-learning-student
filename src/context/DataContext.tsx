"use client"
import React, { createContext, useState,useContext,useEffect} from 'react';
import { getDocs,collection,query,where,orderBy,getDoc, doc} from 'firebase/firestore';
import {db} from '../../firebase/firebaseConfig'
interface Teacher {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  experience: string;
  recordings: { id: string; title: string; duration: string; thumbnail: string }[];
  liveStreams: { id: string; title: string; scheduledFor: string; thumbnail: string }[];
}

interface GroupData {
  name: string;
  teachers: Teacher[];
}

interface GroupContextType {
  groupData: Record<string, GroupData>;
  fetchGroups: () => Promise<void>;
  setGroupData:any
}

// Create the context
const GroupContext = createContext<GroupContextType | undefined>(undefined);

// Provider Component
export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groupData, setGroupData] = useState<Record<string, GroupData>>({});

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      const groupsCollectionRef = collection(db, 'E-groups');
      const querySnapshot = await getDocs(groupsCollectionRef);

      const groups: Record<string, GroupData> = {};
      querySnapshot.forEach((doc) => {
        groups[doc.id] = doc.data() as GroupData; // Map each document to an object
      });

      setGroupData(groups); // Update the state with the groups object
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };
  useEffect(() => {
    fetchGroups(); // Fetch all groups when the component mounts
  }, []);
  return (
    <GroupContext.Provider value={{ groupData, fetchGroups,setGroupData}}>
      {children}
    </GroupContext.Provider>
  );
};
// Custom hook to use the context
export const useGroupContext = (): GroupContextType => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroupContext must be used within a GroupProvider');
  }
  return context;
}; 