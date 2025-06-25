import React, { useRef } from "react";
import {
  Box,
  Stack,
  TextField,
  Button
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Send } from "@mui/icons-material";
import useMediaQuery from '@mui/material/useMediaQuery';

const GroupFooter = ({
  newMessage,
  setNewMessage,
  sendMessage,
  isSending,
  isConnected,
  onTypingStart,
  onTypingStop
}) => {
  const theme = useTheme();
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  // Обработчик изменения текста
  const handleChange = (e) => {
    setNewMessage(e.target.value);
    if (onTypingStart) onTypingStart();
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      if (onTypingStop) onTypingStop();
    }, 1500);
  };

  return (
    <Box sx={{ position: "relative", backgroundColor: "transparent !important", paddingBottom: isMobile ? '80px' : 0 }}>
      <Box
        p={2}
        width={"100%"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.paper,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Stack direction="row" alignItems={"center"} spacing={2}>
          <Stack sx={{ width: "100%" }}>
            <TextField
              inputRef={inputRef}
              value={newMessage}
              onChange={handleChange}
              onFocus={onTypingStart}
              onBlur={onTypingStop}
              fullWidth
              placeholder={isConnected ? "Написать сообщение..." : "Подключение к чату..."}
              variant="filled"
              disabled={isSending}
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                '& .MuiInputBase-input': {
                  paddingTop: '12px !important',
                  paddingBottom: '12px !important',
                },
              }}
            />
          </Stack>
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            sx={{
              minWidth: 48,
              height: 48,
              borderRadius: 1.5,
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.text.disabled,
              },
            }}
          >
            <Send />
          </Button>
        </Stack>
        {!isConnected && (
          <Box mt={1}>
            <span style={{ color: '#ff6b6b', fontSize: 12 }}>
              ⚠️ Нет подключения к чату. Сообщения будут отправлены при восстановлении связи.
            </span>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GroupFooter; 