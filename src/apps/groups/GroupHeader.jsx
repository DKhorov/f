import React from "react";
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ArrowBack, MoreVert } from "@mui/icons-material";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const GroupHeader = ({ selectedGroup, onToggleSidebar, onMenu, anchorEl, onCloseMenu, isConnected }) => {
  const theme = useTheme();
  const openMenu = Boolean(anchorEl);

  return (
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
      <Stack
        alignItems={"center"}
        direction={"row"}
        sx={{ width: "100%", height: "100%" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={onToggleSidebar} sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <ArrowBack />
          </IconButton>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
          >
            <Avatar
              alt={selectedGroup?.name}
              src={selectedGroup?.avatarUrl}
            >
              {selectedGroup?.name?.[0]?.toUpperCase()}
            </Avatar>
          </StyledBadge>
          <Stack spacing={0.2}>
            <Typography variant="subtitle2">
              {selectedGroup?.name}
            </Typography>
            <Typography variant="caption" color={isConnected ? 'green' : 'red'}>
              {isConnected ? 'Online' : 'Offline'}
            </Typography>
          </Stack>
        </Stack>
        <Stack direction={"row"} alignItems="center" spacing={2}>
          <Divider orientation="vertical" flexItem />
          <IconButton
            aria-controls={openMenu ? "group-header-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? "true" : undefined}
            onClick={onMenu}
          >
            <MoreVert />
          </IconButton>
          <Menu
            id="group-header-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={onCloseMenu}
            TransitionComponent={Fade}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={onCloseMenu}>Покинуть группу</MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
};

export default GroupHeader; 