import { v4 as uuid } from 'uuid'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Home = () => {

    const createNewRoom = (e) => {
        e.preventDefault()
        const id = uuid()
        console.log(id);
        setRoomId(id)
        toast.success('Created a new room')
    }

    const navigate = useNavigate()

    const joinRoom = () => {
        if (!userName || !roomId) {
            toast.error('Room ID and Username is required!!')
            return
        }

        // Redirect

        navigate(`/editor/${roomId}`, {
            state: {
                userName
            }
        })
    }

    const handleKeyEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom()
        }
    }

    const [roomId, setRoomId] = useState('')
    const [userName, setUserName] = useState('')

    return (
        <section className='homePageWrapper'>
            <div className="formWrapper">
                <img src="/code-sync-logo.png" alt="code-sync-logo" className="homeImage" />
                <h4 className="mainLabel">PASTE YOUR INVITATION ROOM ID</h4>
                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleKeyEnter}
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="USERNAME"
                        onChange={(e) => setUserName(e.target.value)}
                        value={userName}
                        onKeyUp={handleKeyEnter}
                    />
                    <button
                        className="btn joinBtn"
                        onClick={joinRoom}>
                        Join
                    </button>
                    <span className="createInfo">
                        If you do not have invitation id then ,  &nbsp; <a onClick={createNewRoom} href="" className="createNewBtn"> New Room</a>
                    </span>
                </div>
            </div>
            <footer>
                <h4>Siddhant R Sen</h4>
            </footer>
        </section>
    )
}

export default Home