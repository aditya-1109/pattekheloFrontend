import { useState, useEffect, useRef } from "react";
import axios, { all } from "axios";
import { io } from "socket.io-client";
import "./STYLE/game.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";


const Game = () => {

    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [showOptionModal, setShowOptionModal] = useState(false);
    const [pot, setPot] = useState(0);
    const [bootAmount, setBootAmount] = useState(null);
    const [showButton, setShowButton] = useState(false);
    const [socket, setSocket] = useState(null);
    const [sideShow, setSideShow] = useState(false);
    const [seeCards, setSeeCards] = useState(false);
    const [blindBet, setBlindBet] = useState("blind");
    const [winner, setWinner] = useState("");
    const [countDown, setCountDown] = useState(5);
    const [otherPlayerName, setOtherPlayerName] = useState("");
    const [roomNo, setRoomNo] = useState("");
    const [waiting, setWaiting] = useState(false)
    const [firstPlayerIndex, setFirstPlayerIndex] = useState();
    const [secondPlayerIndex, setSecondPlayerIndex] = useState();
    const [thirdPlayerIndex, setThirdPlayerIndex] = useState();
    const [fourthPlayerIndex, setFourthPlayerIndex] = useState();
    const [distributeCard, setDistributeCard] = useState(false);
    const [index, setIndex] = useState(0);
    const [peekDisable, setPeekDisable] = useState(false);
    const [packPresser, setPackPresser] = useState("");
    const [blindPresser, setBlindPresser] = useState("");
    const [betPresser, setBetPresser] = useState("");
    const [showRequest, setShowRequest] = useState(false);
    const [takeInput, setTakeInput] = useState(false);
    const [chatterName, setChatterName] = useState("");
    const [sender, setSender] = useState("");
    const [recievedMessage, setRecieveMessage] = useState(null);
    const [myMessage, setMyMessage] = useState(null);
    const [requester, setRequester] = useState(null);
    const [seeExitOptions, setSeeExitOptions] = useState(false);
    const [potKey, setPotKey] = useState(1);

    const audioRef = useRef(null);
    const flipcardRef = useRef(null);
    const timeInterval = useRef(null);
    const dealCardRef = useRef(null);
    const packRef = useRef(null);
    const blindRef = useRef(null);
    const winnerRef = useRef(null);
    const betRef = useRef(null);
    const doubleBlindRef = useRef(null);
    const doubleBetRef = useRef(null);
    const showRef = useRef(null);
    const inputRef = useRef(null);
    const coinRef = useRef(null);
    const countDownRef = useRef(null);
    const alarmRef = useRef(null);

    const nevigate = useNavigate();


    const userName = localStorage.getItem("user");





    useEffect(() => {

        const newSocket = io('https://pattekhelo.vercel.app/');
        setSocket(newSocket);



        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {

        if (socket) {
            socket.on("updatePot", (newPot) => {
                setPot(newPot);
            });



            socket.on("setShow", (data) => {
                setSideShow(data.sideShow);

            })

            socket.on("startGame", (data) => {
                setBootAmount(data.users[index].bootAmount);
                if (audioRef.current) {
                    audioRef.current.play();
                };

                setTimeout(() => {
                    setPot(data.pot);
                    if (coinRef.current) {
                        coinRef.current.play();
                    }


                }, 1000);

                setTimeout(() => {
                    setDistributeCard(true);
                    if (dealCardRef.current) {
                        dealCardRef.current.play();
                    }
                }, 1500);

                setTimeout(() => {
                    setDistributeCard(false);
                    setAllUsers(data.users);
                    dealCardRef.current.pause();
                }, 1500 + (1000 * data.users.length))

            })

            socket.on("updateUsers", (data) => {
                setAllUsers(data.users);
                setBootAmount(data.users[index].bootAmount);
                getIndexValues(data.users);
            });

            socket.on("showCards", (data) => {
                if (userName === data.playerName) {
                    setOtherPlayerName(data.otherPlayer);
                } else if (userName === data.otherPlayer) {
                    setOtherPlayerName(data.playerName);
                }
            });

            socket.on("decline", (data) => {
                if (data.playerName === userName) {
                    setRecieveMessage(data.message);
                };
                setTimeout(() => {
                    setRecieveMessage(null)
                }, 2000)
            })

            socket.on("recieveChat", (data) => {
                if (userName === data.playerName || data.playerName === "everyone") {
                    setRecieveMessage(data.message);
                    setSender(data.userName);
                } else if (userName === data.userName) {
                    setMyMessage(data.message);
                    setSender(data.playerName);
                }

                setTimeout(() => {
                    setRecieveMessage(null);
                    setSender("");
                    setMyMessage(null);
                }, 5000)


            })

            socket.on("winner", (data) => {
                setWinner(data.winner);
                if (winnerRef.current) {
                    winnerRef.current.play();
                }

                setTimeout(() => {

                    restartGame(data.winner);
                }, 2000)
            })

            socket.on("packPress", (data) => {
                setPackPresser(data.playerName);
            })

            socket.on("blindPress", (data) => {
                if (data.bet) {
                    setBetPresser(data.playerName);
                    if (data.double) {
                        if (doubleBetRef.current) {
                            doubleBetRef.current.play();
                        }
                    } else {
                        if (betRef.current) {
                            betRef.current.play();
                        }
                    }
                } else {
                    setBlindPresser(data.playerName);
                    if (data.double) {
                        if (doubleBlindRef.current) {
                            doubleBlindRef.current.play();
                        }
                    } else {
                        if (blindRef.current) {
                            blindRef.current.play();
                        }
                    }

                }
            });

            socket.on("askRequest", (data) => {
                console.log(data.previousPlayer);
                if (userName === data.previousPlayer) {
                    setShowRequest(true);
                    setRequester(data.playerName);
                }
                setTimeout(() => {
                    setShowRequest(false);
                }, 5000);
            })

            socket.on("getAllUsers", (data) => {
                setRoomNo(data.users[0].room_No);
                getIndexValues(data.users);
                setAllUsers(data.users);

                if (data.gameStarted) {


                } else {
                    if (data.users.length >= 2) {
                        setWaiting(true);
                        let count = 5;
                        if (countDownRef.current) {
                            countDownRef.current.play();
                        }
                        const interval = setInterval(() => {
                            setCountDown(count);
                            if (count === 0) {
                                setWaiting(false);
                                socket.emit("dealCards", { playerName: userName, room_no: data.users[0].room_No })
                                clearInterval(interval);
                            }
                            count--
                        }, 1000);

                    }
                }

            })

            return () => {
                if (socket) {
                    socket.off("updatePot");
                    socket.off("getAllUsers");
                    socket.off("setShow");
                    socket.off("winner");
                    socket.off("updateUsers");
                    socket.off("startGame");
                    socket.off("showCards");

                }
            };
        }
    }, [socket, allUsers]);

    useEffect(() => {
        setPotKey((prev) => prev + 1);
    }, [pot]);


    useEffect(() => {
        const getUser = async () => {
            const users = await axios.post("https://pattekhelo.vercel.app/api/user/getUser", { name: userName });
            if (users) {
                setUser(users.data);
                setWallet(users.data.points);
                if (socket) {
                    socket.emit("addUser", { user: users.data });
                }
            }
        };
        getUser();
    }, [userName, socket]);


    useEffect(() => {


        if (allUsers[index]?.currentTurn === userName) {
            setShowButton(true);
            let count = 10;
            if (timeInterval.current) {
                clearInterval(timeInterval.current);
            }

            timeInterval.current = setInterval(() => {
                count--;
                if (count === 0) {
                    socket.emit("pack", { room_no: roomNo, playerName: userName })
                    clearInterval(timeInterval.current);
                    timeInterval.current = null;
                }
                else if (count == 3) {

                    if (alarmRef.current) {
                        alarmRef.current.play();
                    }
                }

            }, 1000)

        } else {
            setShowButton(false)
        }

    }, [allUsers[index]?.currentTurn]);




    const restartGame = (player) => {
        allUsers.forEach(user => {
            user.cards = [];
            user.bootAmount = null;
            user.currentTurn = "";
        })

        clearInterval(timeInterval.current);
        timeInterval.current = null;
        setAllUsers(allUsers);
        setPot(0);
        setBootAmount(null);
        setSideShow(false);
        setSeeCards(false);
        setBlindBet("blind");
        setWinner("");
        setCountDown(5);
        setOtherPlayerName("");
        setPeekDisable(false);
        setShowButton(false);
        setShowOptionModal(false);

        if (player === userName) {
            socket.emit("restartGame", { room_no: roomNo, winner: player });
        }
    }

    const getIndexValues = (users) => {
        const index = users.findIndex(user => user.name === userName);
        setIndex(index);
        const firstIndex = (index + 1) % users.length;
        const secondIndex = (index + 2) % users.length;
        const thirdIndex = (index + 3) % users.length;
        const fourthIndex = (index + 4) % users.length;
        if (users.length == 2) {
            setFirstPlayerIndex(firstIndex)
        } else if (users.length === 3) {
            setFirstPlayerIndex(firstIndex)
            setSecondPlayerIndex(secondIndex)
        } else if (users.length === 4) {
            setFirstPlayerIndex(firstIndex)
            setSecondPlayerIndex(secondIndex)
            setThirdPlayerIndex(thirdIndex)
        } else if (users.length === 5) {
            setFirstPlayerIndex(firstIndex)
            setSecondPlayerIndex(secondIndex)
            setThirdPlayerIndex(thirdIndex)
            setFourthPlayerIndex(fourthIndex);
        }
    };


    const handleOptionSelect = (option) => {

        setShowOptionModal(false);
        clearInterval(timeInterval.current);
        timeInterval.current = null;
        let double = false;
        if (option === "double") {
            double = true;
        }

        socket.emit("blind", { room_no: roomNo, userName, double, bootAmount, bet: seeCards });
    };

    const handleRequest = (option) => {
        setShowRequest(false);

        socket.emit("show", { room_no: roomNo, playerName: requester, bootAmount, option });

    }


    const peek = () => {
        setSeeCards(true);
        setBlindBet("bet");
        setBootAmount(bootAmount * 2);
        setPeekDisable(true);
        if (flipcardRef.current) {
            flipcardRef.current.play();
        }
        socket.emit("peek", { room_no: roomNo, playerName: userName, bootAmount });
    }


    const show = () => {
        clearInterval(timeInterval.current);
        timeInterval.current = null;

        if (showRef.current) {
            showRef.current.play();
        }

        if (sideShow) {
            socket.emit("showRequest", { room_no: roomNo, playerName: userName });
            setSender("Comp");
            setRecieveMessage("Wait for Response");
            setTimeout(() => {
                if (otherPlayerName === "") {
                    setRecieveMessage("declined");
                }
            }, 5000);
            setTimeout(() => {
                setRecieveMessage(null);
                setSender("");
            }, 7000);
        } else {
            socket.emit("show", { room_no: roomNo, playerName: userName, bootAmount, option: "yes" });
        }

    };

    const pack = () => {
        if (packRef.current) {
            packRef.current.play();
        }
        clearInterval(timeInterval.current);
        timeInterval.current = null;
        socket.emit("pack", { room_no: roomNo, playerName: userName });
    };

    const chat = (playerName) => {
        setTakeInput(!takeInput);
        setChatterName(playerName);
    }

    const sendMessgae = () => {
        setTakeInput(false);
        socket.emit("chat", { room_no: roomNo, playerName: chatterName, userName: userName, message: inputRef.current.value });
        inputRef.current = null;
    }

    const exitRoom = () => {
        socket.emit("exitRoom", { name: userName, room_no: roomNo });
        nevigate("/playTeen");
    }

    const switchRoom = async () => {
        socket.emit("exitRoom", { name: userName, room_no: roomNo });
        const room_no = await axios.post("https://pattekhelo.vercel.app/api/user/getTeenRoomNo", { name: userName });
        nevigate(`/game/${room_no.data.roomNo}`);
    }



    return (

        <div className="container">
            <motion.div key={potKey} initial={{ scale: 1 }} animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.5, ease: "easeInOut", times: [0.1, 0.9, 1] }} className="pot-container">
                 <img className="potIcon" src="/images/pot.png" /> <p><b>: ₹ {pot}</b></p>
            </motion.div>



            <div>
                <audio ref={audioRef} src="/audio/startGame.mp3" preload="auto" volume={0.1} />
            </div>

            <div>
                <audio ref={countDownRef} src="/audio/countDown.mp3" preload="auto" volume={0.1} />
            </div>

            <div>
                <audio ref={flipcardRef} src="/audio/flipcard.mp3" preload="auto" />
            </div>

            <div>
                <audio ref={dealCardRef} src="/audio/deal-card.mp3" preload="auto" loop />
            </div>

            <div>
                <audio ref={packRef} src="/audio/pack.mp3" preload="auto" />
            </div>

            <div>
                <audio ref={blindRef} src="/audio/blind.mp3" preload="auto" />
            </div>

            <div>
                <audio ref={doubleBlindRef} src="/audio/doubleBlind.mp3" preload="auto" />
            </div>

            <div>
                <audio ref={doubleBetRef} src="/audio/doubleBet.mp3" preload="auto" />
            </div>

            <div>
                <audio ref={betRef} src="/audio/bet.mp3" preload="auto" />
            </div>

            <div>
                <audio ref={winnerRef} src="/audio/winner.mp3" preload="auto" />
            </div>

            <div>
                <audio ref={alarmRef} src="/audio/alarm.mp3" preload="auto" />
            </div>
            <div>
                <audio ref={showRef} src="/audio/show.mp3" preload="auto" />
            </div>

            <div>
                <audio ref={coinRef} src="/audio/coinSound.mp3" preload="auto" />
            </div>

            <div className="exitBox">
                <img className="backIcon" onClick={() => setSeeExitOptions(!seeExitOptions)} src="/images/backIcon.png" alt="exit" />
                {seeExitOptions && (
                    <div className="exitButtonContainer">
                        <button onClick={exitRoom} className="exitButton"><b>Exit from this room</b></button>
                        <button onClick={switchRoom} className="exitButton"><b>Switch to another room</b></button>
                    </div>
                )}
            </div>

            <div className="walletBox">
                <img className="coin" src="/images/coin.jpg" />
                <p className="walletAmount">{wallet}</p>
            </div>



            {waiting && (
                <div className="waiting">
                    {waiting ? <h2>Game is starting in {countDown} s</h2> : ""}
                </div>
            )}



            {distributeCard && (
                <div>
                    <img className="cardDeck" src={"/images/cardDeck.png"} />
                    <img className={`card${allUsers.length}`} src={"/images/cardDeck.png"} />

                </div>)}



            {showRequest && (

                <div className="modal">
                    <h3>Give permission to {requester} to sideshow your cards</h3>
                    <button onClick={() => handleRequest("yes")}>yes</button>
                    <button onClick={() => handleRequest("No")}>No</button>
                </div>

            )}

            {takeInput && (
                <form className="messageContain" onSubmit={sendMessgae}>
                    <input className="messageBox" ref={inputRef} type="text" placeholder="Type your message here..." />
                </form>

            )}




            {/* my container */}
            <div className="myContainer">
                <div className="notificationContainer">

                    {recievedMessage && (<div className="messageContainer"><h1>{sender}: </h1>{recievedMessage}</div>)}
                    {winner === userName ? <motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification" src={"/images/winnerEmote.png"} alt="winner" /> : ""}
                    {allUsers[index]?.name == packPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification" src={"/images/packEmote.png"} alt="pack" />)}
                    {allUsers[index]?.name == betPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification" src={"/images/betEmote.png"} alt="bet" />)}
                    {allUsers[index]?.name == blindPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification" src={"/images/blindEmote.png"} alt="blind" />)}

                </div>
                {allUsers[index]?.name && (<img className="message" onClick={() => chat("everyone")} src={"/images/messageIcon.png"} alt="message" />)}

                <div className="myAvator">
                    <img src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${userName}`} alt="avatar" />
                    {allUsers[index]?.pack ? <div className="cover"></div> : ""}
                    {allUsers[index]?.currentTurn === userName ? <div className="circle"></div> : ""}
                    {allUsers[index]?.cards.length > 0 && <button className="peek" onClick={peek} disabled={peekDisable} >SEE</button>}
                </div>

                {allUsers[index]?.cards.length > 0 && (seeCards ?
                    <div className="MycardContainer">
                        {allUsers[index]?.cards.map((card, index) => (
                            <img className={`my${index}card`} key={index} src={card.image} alt="user card" />
                        ))}
                    </div>
                    : <img className="cardContainer" src={"/images/threeCards.png"} alt="three cards" />)}

                <div className="name-container">
                    <p><b>{userName}</b></p>
                    <div className="bootAmount"><img className="coin" src="/images/coin.jpg" /> {allUsers[index]?.bootAmount}</div>
                    {bootAmount && (<motion.div className="bootAmount0" initial={{ opacity: 1, scale: 1, x: 0, y: 0 }} animate={{ opacity: [1, 1, 1, 0], scale: [1, 1.5, 1.5, 1], x: [0, 0, 40, 40], y: [0, 0, -280, -280] }} transition={{ duration: 1, ease: "easeInOut", times: [0, 0.1, 0.9, 1] }}>₹ {bootAmount}</motion.div>)}
                </div>


                <div className="myButton">
                    <button onClick={show} disabled={!showButton}>{sideShow ? "SideShow" : "Show"}</button>
                    <button onClick={() => setShowOptionModal(!showOptionModal)} disabled={!showButton}>{blindBet}</button>
                    <button onClick={pack} disabled={!showButton}>Pack</button>

                </div>

                {showOptionModal && (

                    <div className="myButton">

                        <button className="single" onClick={() => handleOptionSelect("same")}>Same ({bootAmount})</button>
                        <button className="double" onClick={() => handleOptionSelect("double")}>Double ({bootAmount * 2})</button>
                    </div>

                )}


            </div>



            {/* first player container */}

            <div className="firstPlayerContainer">
                <div className="notification0">
                    {allUsers[firstPlayerIndex]?.name === sender && (<div className="messageContainer">{myMessage}</div>)}
                    {winner === allUsers[firstPlayerIndex]?.name ? <motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/winnerEmote.png"} alt="winner" /> : ""}
                    {allUsers[firstPlayerIndex]?.name == packPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/packEmote.png"} alt="pack" />)}
                    {allUsers[firstPlayerIndex]?.name == betPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/betEmote.png"} alt="bet" />)}
                    {allUsers[firstPlayerIndex]?.name == blindPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/blindEmote.png"} alt="blind" />)}
                </div>
                {allUsers[firstPlayerIndex]?.name && (<img className="message0" onClick={() => chat(allUsers[firstPlayerIndex]?.name)} src={"/images/messageIcon.png"} alt="message" />)}

                {allUsers[firstPlayerIndex]?.name ?
                    <div className="firstPlayerAvatarContainer">

                        <img
                            src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${allUsers[firstPlayerIndex]?.name}`}
                            alt="avatar"
                        />

                        {allUsers[firstPlayerIndex]?.cards.length > 0 && (allUsers[firstPlayerIndex]?.peek ? <div className="msg">seen</div> : <div className="msg">Blind</div>)}
                        {allUsers[firstPlayerIndex]?.pack ? <div className="cover0"></div> : ""}
                        {allUsers[firstPlayerIndex]?.currentTurn === allUsers[firstPlayerIndex]?.name ? <div className="circle0" ></div> : ""}
                    </div> : ""}

                {allUsers[firstPlayerIndex]?.cards.length > 0 && (otherPlayerName === "everyone" || otherPlayerName === allUsers[firstPlayerIndex]?.name ?
                    <div className="firstPlayerCardContainer">
                        {allUsers[firstPlayerIndex].cards.map((card, index) => (
                            <img src={card.image} alt="card-Image" />
                        ))}
                    </div> : <img className="firstcardContainer" src={"/images/threeCards.png"} alt="three cards" />)}

                {allUsers[firstPlayerIndex]?.name ?
                    <div className={"firstPlayerNameContainer"}>
                        <p><b>{allUsers[firstPlayerIndex]?.name}</b></p>
                        <div className="bootAmount"><img className="coin" src="/images/coin.jpg" />{allUsers[firstPlayerIndex]?.bootAmount}</div>
                        {bootAmount && (<motion.div className="bootAmount0" initial={{ opacity: 1, scale: 1, x: 0, y: 0 }} animate={{ opacity: [1, 1, 1, 0], scale: [1, 1.5, 1.5, 1], x: [0, 0, 170, 170], y: [0, 0, -205, -205] }} transition={{ duration: 1, ease: "easeInOut", times: [0, 0.1, 0.9, 1] }}>₹ {bootAmount}</motion.div>)}
                    </div> : ""}





            </div>

            {/* second player container */}

            <div className="secondPlayerContainer">
                {allUsers[secondPlayerIndex]?.name === sender && (<div className="messageContainer">{myMessage}</div>)}
                {winner === allUsers[secondPlayerIndex]?.name ? <motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/winnerEmote.png"} alt="winner" /> : ""}
                {allUsers[secondPlayerIndex]?.name == packPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/packEmote.png"} alt="pack" />)}
                {allUsers[secondPlayerIndex]?.name == betPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/betEmote.png"} alt="bet" />)}
                {allUsers[secondPlayerIndex]?.name == blindPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/blindEmote.png"} alt="blind" />)}

                {allUsers[secondPlayerIndex]?.name && (<img className="message0" onClick={() => chat(allUsers[secondPlayerIndex]?.name)} src={"/images/messageIcon.png"} alt="message" />)}

                {allUsers[secondPlayerIndex]?.name ?
                    <div className="secondPlayerAvatarContainer">
                        <img
                            src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${allUsers[secondPlayerIndex]?.name}`}
                            alt="avatar"
                        />
                        {allUsers[secondPlayerIndex]?.cards.length > 0 && (allUsers[firstPlayerIndex]?.peek ? <div className="msg">seen</div> : <div className="msg">Blind</div>)}
                        {allUsers[secondPlayerIndex]?.pack ? <div className="cover0"></div> : ""}
                        {allUsers[secondPlayerIndex]?.currentTurn === allUsers[secondPlayerIndex]?.name ? <div className="circle0" ></div> : ""}
                    </div> : ""}


                {allUsers[secondPlayerIndex]?.cards.length > 0 && (otherPlayerName === "everyone" || otherPlayerName === allUsers[secondPlayerIndex]?.name ?
                    <div className="secondPlayerCardContainer">
                        {allUsers[secondPlayerIndex].cards.map((card, index) => (
                            <img src={card.image} alt="card-Image" />
                        ))}
                    </div> :
                    <img className="secondcardContainer" src={"/images/threeCards.png"} alt="three cards" />)}

                {allUsers[secondPlayerIndex]?.name ?
                    <div className={"secondPlayerNameContainer"}>
                        <p><b>{allUsers[secondPlayerIndex]?.name}</b></p>
                        <div className="bootAmount"><img className="coin" src="/images/coin.jpg" /> {allUsers[secondPlayerIndex]?.bootAmount}</div>
                        {bootAmount && (<motion.div className="bootAmount0" initial={{ opacity: 1, scale: 1, x: 0, y: 0 }} animate={{ opacity: [1, 1, 1, 0], scale: [1, 1.5, 1.5, 1], x: [0, 0, 170, 170], y: [0, 0, 20, 20] }} transition={{ duration: 1, ease: "easeInOut", times: [0, 0.1, 0.9, 1] }}>₹ {bootAmount}</motion.div>)}

                    </div>
                    : ""}



            </div>

            {/* third player container */}

            <div className="thirdPlayerContainer">
                {allUsers[thirdPlayerIndex]?.name === sender && (<div className="messageContainer">{myMessage}</div>)}
                {winner === allUsers[thirdPlayerIndex]?.name ? <motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/winnerEmote.png"} alt="winner" /> : ""}
                {allUsers[thirdPlayerIndex]?.name == packPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/packEmote.png"} alt="pack" />)}
                {allUsers[thirdPlayerIndex]?.name == betPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/betEmote.png"} alt="bet" />)}
                {allUsers[thirdPlayerIndex]?.name == blindPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/blindEmote.png"} alt="blind" />)}

                {allUsers[thirdPlayerIndex]?.name && (<img className="message0" onClick={() => chat(allUsers[thirdPlayerIndex]?.name)} src={"/images/messageIcon.png"} alt="message" />)}




                {allUsers[thirdPlayerIndex]?.name ?
                    <div className="thirdPlayerAvatarContainer">
                        <img
                            src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${allUsers[thirdPlayerIndex]?.name}`}
                            alt="avatar"

                        />
                        {allUsers[thirdPlayerIndex]?.cards.length > 0 && (allUsers[firstPlayerIndex]?.peek ? <div className="msg">seen</div> : <div className="msg">Blind</div>)}
                        {allUsers[thirdPlayerIndex]?.pack ? <div className="cover0"></div> : ""}
                        {allUsers[thirdPlayerIndex]?.currentTurn === allUsers[thirdPlayerIndex]?.name ? <div className="circle0" ></div> : ""}
                    </div> : ""}

                {allUsers[thirdPlayerIndex]?.cards.length > 0 && (otherPlayerName === "everyone" || otherPlayerName === allUsers[thirdPlayerIndex]?.name ?
                    <div className="thirdPlayerCardContainer">
                        {allUsers[thirdPlayerIndex].cards.map((card, index) => (
                            <img src={card.image} alt="card-Image" />
                        ))}
                    </div> :
                    <img className="thirdcardContainer" src={"/images/threeCards.png"} alt="three cards" />)}

                {allUsers[thirdPlayerIndex]?.name ?
                    <div className={"thirdPlayerNameContainer"}>
                        <p><b>{allUsers[thirdPlayerIndex]?.name}</b></p>
                        <div className="bootAmount"><img className="coin" src="/images/coin.jpg" />{allUsers[thirdPlayerIndex]?.bootAmount}</div>
                        {bootAmount && (<motion.div className="bootAmount0" initial={{ opacity: 1, scale: 1, x: 0, y: 0 }} animate={{ opacity: [1, 1, 1, 0], scale: [1, 1.5, 1.5, 1], x: [0, 0, -100, -100], y: [0, 0, 20, 20] }} transition={{ duration: 1, ease: "easeInOut", times: [0, 0.1, 0.9, 1] }}>₹ {bootAmount}</motion.div>)}
                    </div>
                    : ""}


            </div>

            {/* fourth player container */}

            <div className="fourthPlayerContainer">
                {allUsers[fourthPlayerIndex]?.name === sender && (<div className="messageContainer">{myMessage}</div>)}
                {winner === allUsers[fourthPlayerIndex]?.name ? <motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/winnerEmote.png"} alt="winner" /> : ""}
                {allUsers[fourthPlayerIndex]?.name == packPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/packEmote.png"} alt="pack" />)}
                {allUsers[fourthPlayerIndex]?.name == betPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/betEmote.png"} alt="bet" />)}
                {allUsers[fourthPlayerIndex]?.name == blindPresser && (<motion.img initial={{ y: 0, opacity: 1 }} animate={{ y: -20, opacity: 0 }} transition={{ duration: 2, ease: "easeInOut" }} className="notification0" src={"/images/blindEmote.png"} alt="blind" />)}

                {allUsers[fourthPlayerIndex]?.name && (<img className="message0" onClick={() => chat(allUsers[fourthPlayerIndex]?.name)} src={"/images/messageIcon.png"} alt="message" />)}





                {allUsers[fourthPlayerIndex]?.name ?
                    <div className="fourthPlayerAvatarContainer">
                        <img
                            src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${allUsers[fourthPlayerIndex]?.name}`}
                            alt="avatar"

                        />
                        {allUsers[fourthPlayerIndex]?.cards.length > 0 && (allUsers[firstPlayerIndex]?.peek ? <div className="msg">seen</div> : <div className="msg">Blind</div>)}
                        {allUsers[fourthPlayerIndex]?.pack ? <div className="cover0"></div> : ""}
                        {allUsers[fourthPlayerIndex]?.currentTurn === allUsers[fourthPlayerIndex]?.name ? <div className="circle0" ></div> : ""}
                    </div> : ""}

                {(allUsers[fourthPlayerIndex]?.cards.length > 0) && (otherPlayerName === "everyone" || otherPlayerName === allUsers[fourthPlayerIndex]?.name ?
                    <div className="fourthPlayerCardContainer">
                        {allUsers[fourthPlayerIndex].cards.map((card, index) => (
                            <img src={card.image} alt="card-Image" />
                        ))}
                    </div> :
                    <img className="fourthcardContainer" src={"/images/threeCards.png"} alt="three cards" />)}


                {allUsers[fourthPlayerIndex]?.name ?
                    <div className={"fourthPlayerNameContainer"}>
                        <p><b>{allUsers[fourthPlayerIndex]?.name}</b></p>
                        <div className="bootAmount"><img className="coin" src="/images/coin.jpg" />{allUsers[fourthPlayerIndex]?.bootAmount}</div>
                        {bootAmount && (<motion.div className="bootAmount0" initial={{ opacity: 1, scale: 1, x: 0, y: 0 }} animate={{ opacity: [1, 1, 1, 0], scale: [1, 1.5, 1.5, 1], x: [0, 0, -100, -100], y: [0, 0, -205, -205] }} transition={{ duration: 1, ease: "easeInOut", times: [0, 0.1, 0.9, 1] }}>₹ {bootAmount}</motion.div>)}
                    </div>
                    : ""}
            </div>

        </div>

    );
};

export default Game;
