import { useEffect, useRef, useState } from 'react'
import Client from '../Components/Client'
import Editor from '../Components/Editor'
import { initSocket } from '../socket'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ACTIONS } from '../Actions'
import toast from 'react-hot-toast'

const EditorPage = () => {

    const socketRef = useRef(null)
    const codeRef = useRef(null)
    const { roomId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [clients, setClients] = useState([])


    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket()
            socketRef.current.on('connect-error', (err) => handleErrors(err))
            socketRef.current.on('connect-failed', (err) => handleErrors(err))


            const handleErrors = (e) => {
                console.log('socket error', e);
                toast.error('Socket Connection Failed, Try again !!')
                navigate('/')
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.userName,
            })



            // Listening for Joined event
            socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room successfully`)
                }
                setClients(clients)
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId
                })
            })


            // Listening for disconnected events
            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.success(`${username} left the room `)
                setClients((prev) => {
                    return prev.filter((client) => client.socketId !== socketId)
                })
            })
        }
        init()

        return () => {
            socketRef.current.disconnect()
            socketRef.current.off(ACTIONS.JOINED)
            socketRef.current.off(ACTIONS.DISCONNECTED)
        }


    }, [])


    if (!location.state) {
        return <Navigate to='' />
    }

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId)
            toast.success('RoomId copied to clipboard')
        } catch (error) {
            toast(error.message)
        }
    }

    const leaveRoom = () => {
        navigate('/')
    }

    return (
        <section className='mainWrap'>
            <div className="aside">
                <div className='asideInner'>
                    <div className='logo'>
                        <img className='logoImage' src="/code-sync-logo.png" alt="code-sync-logo" />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {
                            clients.map((client) => {
                                const { socketId, username } = client
                                return (
                                    < Client
                                        key={socketId}
                                        username={username}
                                    />
                                )
                            })
                        }
                    </div>
                </div>
                <button className='btn copyBtn' onClick={copyRoomId}>Copy Room ID</button>
                <button className='btn leaveBtn' onClick={leaveRoom}>Leave Room</button>
            </div>
            <div className="editorWrap">
                <Editor onCodeChange={(code) => {
                    codeRef.current = code
                }} socketRef={socketRef} roomId={roomId} />
            </div>
        </section>
    )
}

export default EditorPage