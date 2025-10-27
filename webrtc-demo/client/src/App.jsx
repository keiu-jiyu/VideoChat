import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert
} from '@mui/material';
import VideoChat from './components/VideoChat';

function App() {
  const [roomID, setRoomID] = useState('');
  const [userName, setUserName] = useState('');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  const handleJoinRoom = () => {
    if (!roomID.trim() || !userName.trim()) {
      setError('房间号和用户名不能为空');
      return;
    }
    setError('');
    setJoined(true);
  };

  const handleLeaveRoom = () => {
    setJoined(false);
    setRoomID('');
    setUserName('');
  };

  if (joined) {
    return <VideoChat roomID={roomID} userName={userName} onLeave={handleLeaveRoom} />;
  }

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Card sx={{ width: '100%', boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4, color: '#667eea' }}>
              🎥 WebRTC 视频聊天
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="用户名"
                variant="outlined"
                fullWidth
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="请输入您的用户名"
              />
              <TextField
                label="房间号"
                variant="outlined"
                fullWidth
                value={roomID}
                onChange={(e) => setRoomID(e.target.value)}
                placeholder="请输入房间号，邀请朋友加入相同房间"
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleJoinRoom}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  py: 1.5
                }}
              >
                进入房间
              </Button>
            </Box>

            <Typography variant="body2" align="center" sx={{ mt: 4, color: '#666' }}>
              💡 提示：多个用户可以使用相同的房间号进行群聊
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default App;