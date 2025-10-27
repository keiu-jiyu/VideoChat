import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Typography,
  Chip,
  Stack,
  Paper
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  CallEnd,
  Person
} from '@mui/icons-material';

const VideoChat = ({ roomID, userName, onLeave }) => {
  const socketRef = useRef();
  const peersRef = useRef({});
  const [peers, setPeers] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const userVideo = useRef();
  const userStream = useRef();

  // 初始化本地视频流
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
      .then((stream) => {
        userStream.current = stream;
        userVideo.current.srcObject = stream;
        setLocalStream(stream);

        // 连接到 Socket.IO 服务器
        socketRef.current = io('http://localhost:5000', {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5
        });

        socketRef.current.emit('join_room', { roomID, userName });

        // 接收所有已在房间内的用户
        socketRef.current.on('all_users', (users) => {
          const peers = [];
          users.forEach((userObject) => {
            const peer = createPeer(userObject.id, socketRef.current.id, stream, userObject.name);
            peersRef.current[userObject.id] = peer;
            peers.push({
              peerID: userObject.id,
              peer,
              name: userObject.name
            });
          });
          setPeers(peers);
        });

        // 新用户加入
        socketRef.current.on('user_joined', (payload) => {
          if (payload.signal) {
            const peer = addPeer(payload.signal, payload.callerID, stream, payload.callerName);
            peersRef.current[payload.callerID] = peer;
            setPeers((users) => [
              ...users,
              {
                peerID: payload.callerID,
                peer,
                name: payload.callerName
              }
            ]);
          }
        });

        // 接收返回信号
        socketRef.current.on('receiving_returned_signal', (payload) => {
          const peer = peersRef.current[payload.id];
          if (peer) {
            peer.signal(payload.signal);
          }
        });

        // 用户离开
        socketRef.current.on('user_left', (id) => {
          const peer = peersRef.current[id];
          if (peer) {
            peer.destroy();
          }
          delete peersRef.current[id];
          setPeers((users) => users.filter((u) => u.peerID !== id));
        });

        return () => {
          stream.getTracks().forEach((track) => track.stop());
        };
      })
      .catch((err) => {
        console.error('获取媒体设备失败:', err);
      });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (userStream.current) {
        userStream.current.getTracks().forEach((track) => track.stop());
      }
      Object.values(peersRef.current).forEach((peer) => {
        peer.destroy();
      });
    };
  }, [roomID, userName]);

  // 创建 Peer 连接（主动方）
  const createPeer = (userToSignal, callerID, stream, userName) => {
    const peer = new SimplePeer({
      initiator: true,
      trickleICE: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', (signal) => {
      socketRef.current.emit('send_signal', {
        userToSignal,
        callerID,
        callerName: userName,
        signal
      });
    });

    return peer;
  };

  // 添加 Peer 连接（被动方）
  const addPeer = (incomingSignal, callerID, stream, callerName) => {
    const peer = new SimplePeer({
      initiator: false,
      trickleICE: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', (signal) => {
  socketRef.current.emit('return_signal', {
        signal,
        callerID,
        name: userName
      });
    });

    peer.signal(incomingSignal);
    return peer;
  };

  // 切换视频
  const toggleVideo = () => {
    if (userStream.current) {
      userStream.current.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled;
      });
 setVideoEnabled(!videoEnabled);
    }
  };

  // 切换音频
  const toggleAudio = () => {
    if (userStream.current) {
      userStream.current.getAudioTracks().forEach((track) => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  // 离开房间
  const handleLeaveRoom = () => {
    if (userStream.current) {
      userStream.current.getTracks().forEach((track) => track.stop());
    }
    Object.values(peersRef.current).forEach((peer) => {
      peer.destroy();
    });
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    onLeave();
  };

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        {/* 头部信息 */}
        <Paper elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.9)', p: 2, mb: 3, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                🎥 房间号: {roomID}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                用户: {userName}
              </Typography>
            </Box>
            <Chip
              label={`在线: ${peers.length + 1}`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </Paper>

        {/* 本地视频 */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
              <Box
                component="video"
                ref={userVideo}
                autoPlay={true}
                muted={true}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                  background: '#000'
                }}
              />
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <Person sx={{ fontSize: 20 }} />
                  <Typography variant="h6">{userName} (你)</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 远程视频 */}
          {peers.map((peer) => (
            <Grid item xs={12} md={6} key={peer.peerID}>
              <PeerVideo peerObj={peer} />
            </Grid>
          ))}
        </Grid>

        {/* 控制按钮 */}
        <Paper elevation={3} sx={{ p: 2, background: 'rgba(255, 255, 255, 0.95)', borderRadius: 2 }}>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={videoEnabled ? <Videocam /> : <VideocamOff />}
              onClick={toggleVideo}
              sx={{
                background: videoEnabled ? '#4CAF50' : '#f44336',
                '&:hover': {
                  background: videoEnabled ? '#45a049' : '#da190b'
                }
              }}
            >
              {videoEnabled ? '关闭摄像头' : '开启摄像头'}
            </Button>

            <Button
              variant="contained"
              startIcon={audioEnabled ? <Mic /> : <MicOff />}
              onClick={toggleAudio}
              sx={{
                background: audioEnabled ? '#2196F3' : '#f44336',
                '&:hover': {
                  background: audioEnabled ? '#0b7dda' : '#da190b'
                }
              }}
            >
              {audioEnabled ? '关闭麦克风' : '开启麦克风'}
            </Button>

            <Button
              variant="contained"
              startIcon={<CallEnd />}
              onClick={handleLeaveRoom}
              sx={{
                background: '#f44336',
                '&:hover': {
                  background: '#da190b'
                }
              }}
            >
              离开房间
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

// 远程视频组件
const PeerVideo = ({ peerObj }) => {
  const ref = useRef();

  useEffect(() => {
    peerObj.peer.on('stream', (stream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peerObj]);

  return (
    <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
      <Box
        component="video"
        ref={ref}
        autoPlay={true}
        sx={{
          width: '100%',
          height: 400,
          objectFit: 'cover',
          background: '#000'
        }}
      />
      <CardContent>
        <Box display="flex" alignItems="center" gap={1}>
          <Person sx={{ fontSize: 20 }} />
          <Typography variant="h6">{peerObj.name}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VideoChat;