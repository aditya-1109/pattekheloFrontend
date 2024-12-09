import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./STYLE/play.css";

const Play = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState();
  const userName = localStorage.getItem("user");

  useEffect(() => {
    // Fetch user details from backend when component mounts
    const getUser = async () => {
      const users = await axios.post("https://pattekhelo.vercel.app/api/user/getUser", { name: userName });
      if (users) {
        setUser(users.data);
      }
    };

    getUser();
  }, [userName]);

  const play = async() => {
    const room_no=await axios.post("https://pattekhelo.vercel.app/api/user/getTeenRoomNo", {name: userName});
      navigate(`/game/${room_no.data.roomNo}`); 
  }

  const playFriend = async() => {
    try {
      const response = await axios.post("https://pattekhelo.vercel.app/api/user/getTeenRoomNo", { name: userName });
      const roomNo = response.data.roomNo; 
      if (roomNo) {
        const link = `http://localhost:3000/game/${roomNo}`;
        const message = `Join my teen patti game room: ${link}`;
        
        // Open WhatsApp sharing URL
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
      } else {
        console.error("Room number not received from server.");
      }
    } catch (error) {
      console.error("Error creating the friend game link:", error);
    }
  };

  const back = () => {
    const message = window.confirm("Are you sure?");
    if (message) {
      navigate("/");
    }
  };

  return (
    <>
    <div className="frontContainer">
      <button className="button playButton"  onClick={play}><img className="friendImage" src="/images/playOnline.png" alt="friends"/>Play online</button>
      <button className="button playFriendButton" onClick={playFriend}><img className="friendImage" src="/images/friends.png" alt="friends"/>Play with Friends</button>
      <button className="button backButton" onClick={back}>Back to home</button>
    </div>
    </>
  );
};

export default Play;
