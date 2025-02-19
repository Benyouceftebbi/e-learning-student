import React, { useEffect, useState } from "react";
import "./App.css";
import { ZoomMtg } from "@zoom/meetingsdk";
import { doc, onSnapshot } from "firebase/firestore";
import { functions } from "../../firebase/firebaseConfig";
import { httpsCallable } from "firebase/functions";


ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

function Meeting() {
  const [isAccepted, setIsAccepted] = useState(false);
  const authEndpoint = "https://generatezoomsignature-b6inkznkfa-uc.a.run.app"; // Your backend endpoint for signature generation
  const sdkKey = "XHMOFl1MTJy1pbMT2NDfZg"; // Replace with your SDK Key
  const meetingNumber = "82553579618"; // Your Meeting ID
  const passWord = "123456"; // Meeting Password
  const role = 0; // Role: 0 = attendee, 1 = host
  const userName = "youcef tebbi";
  const userEmail = "youcefmilk@gmail.com"; // Optional, used for recording notifications

  // Function to fetch the signature
  const getSignature = async () => {
    try {
      const generateSignature = httpsCallable(functions, "generateZoomSignature");

      const response = await generateSignature({
        meetingNumber,
        role,

      });
     
      const signature  = await response.data.signature;
      console.log("Signature:", signature);

      if (signature) {
        startMeeting(signature); // Proceed to start the meeting
      } else {
        console.error("Signature not received.");
      }
    } catch (error) {
      console.error("Error fetching signature:", error);
    }
  };
  function startMeeting(signature: string) {
    document.getElementById("zmmtg-root")!.style.display = "block";

    ZoomMtg.init({
      leaveUrl:"http://localhost:5173/level/elementary/subject/fifth-year-arabic/meeting",
      patchJsMedia: true,
      leaveOnPageUnload: true,
      success: (success: unknown) => {
        console.log(success);
        // can this be async?
        ZoomMtg.join({
          signature: signature,
          sdkKey: sdkKey,
          meetingNumber: meetingNumber,
          passWord: passWord,
          userName: userName,
          userEmail: userEmail,
          disableInvite: true,
          success: (success: unknown) => {
            console.log(success);
          },
          error: (error: unknown) => {
            console.log(error);
          },
        });
      },
      error: (error: unknown) => {
        console.log(error);
      },
    });
  }

  // useEffect to check acceptance status
  {/*useEffect(() => {
    const docRef = doc(db, 'E-groups', "first-year-science-m1"); // Reference to the e-Groups document

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
                setIsAccepted(true); // Set accepted status
              } else if (request.status === 'rejected') {
                alert("You have been kicked out of the meeting. Please contact the school."); // Alert on rejection
                window.location.href = "/previous-screen"; // Redirect to previous screen
              }
            }
          }
        }
      }
    });

    return () => {
      unsubscribe(); // Cleanup
    };
  }, []);*/}

  return (
    <div className="App">
    <main>
      <h1>Zoom Meeting SDK Sample React</h1>
      {/*isAccepted && <button onClick={getSignature}>Join Meeting</button>*/}
      { <button onClick={getSignature}>Join Meeting</button>}
    </main>
  </div>
  );
}

export default Meeting;
