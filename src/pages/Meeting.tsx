import "./App.css";
import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";


function Meeting() {
    const client = ZoomMtgEmbedded.createClient();

  const authEndpoint = "http://localhost:4001"; // http://localhost:4000
  const sdkKey = "XHMOFl1MTJy1pbMT2NDfZg";
  const meetingNumber = "89432115485";
  const passWord = "123456";
  const role =0;
  const userName = "youcef tebbi";
  const userEmail = "youcefmilk@gmail.com";
  const zakToken='eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6IkFfUHdfa3h6VEVpZVJDUkNxTTVtNEEiLCJ6aWQiOiJlYjhiYjYxZTAzZjA0MzcxOGYyNWNiM2U3MTgxZTlhNyIsImlzcyI6IndlYiIsInNrIjoiMCIsInN0eSI6MSwid2NkIjoidXMwNSIsImNsdCI6MCwiZXhwIjoxNzMzNDI3MDI2LCJpYXQiOjE3MzM0MTk4MjYsImFpZCI6Inc5MFNwdG5HUmQ2X2ZTaGtSMWZBcUEiLCJjaWQiOiIifQ.k53ja60-D8CvKXadyD5CJrJ95HVrZysVbDHPYenldLU'
  const leaveUrl = "http://localhost:5173";
  const getSignature = async () => {
    try {
      const req = await fetch(authEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingNumber: meetingNumber,
          role: role,
          //expirationSeconds:3600
        }),
      });
      const res = await req.json()
      const signature = res.signature as string;
      //console.log("sig",signature);
      
      startMeeting(signature)
    } catch (e) {
      console.log(e);
    }
  };
  async function startMeeting(signature: string) {
    const meetingSDKElement = document.getElementById("meetingSDKElement")!;
    try {
      await client.init({
        zoomAppRoot: meetingSDKElement,
        language: "en-US",
        patchJsMedia: true,
        leaveOnPageUnload: true,
      })
      await client.join({
        signature: signature,
        sdkKey: sdkKey,
        meetingNumber: meetingNumber,
        password: passWord,
        userName: userName,
        userEmail: userEmail,
        
        //zak: zakToken,
      }).catch((error)=>console.log(error)
      )
      console.log("joined successfully");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="App">
      <main>
      <h1>Zoom Meeting SDK Sample React</h1>
        {/* For Component View */}
        <div id="meetingSDKElement">
          {/* Zoom Meeting SDK Component View Rendered Here */}
        </div>
        <button onClick={getSignature}>Join Meeting</button>
      </main>
    </div>
  );
}

export default Meeting;
