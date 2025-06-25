import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../axios';
import { keyframes } from '@emotion/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { FaPerson } from "react-icons/fa6";
import remarkGfm from 'remark-gfm';
import {
  Box,
  styled,
  Skeleton
} from '@mui/material';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  Clear as DeleteIcon,
  Edit as EditIcon,
  RemoveRedEyeOutlined as EyeIcon,
  FavoriteBorder as FavoriteIcon,
  Favorite as FavoriteFilledIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkFilledIcon,
  ThumbDownOutlined as ThumbDownIcon,
  ThumbDown as ThumbDownFilledIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Report as ReportIcon,
  Code as CodeIcon,
  Language as LanguageIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import styles from '../../style/post/post.scss';
import { UserInfo } from '../../account/UserInfo';

const tagColors = [
  '#ff80ab', '#82b1ff', '#b9f6ca', '#ffd180', 
  '#ea80fc', '#8c9eff', '#ccff90', '#ffff8d'
];

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Post = ({
  _id,
  title = '',
  language = 'JavaScript',
  createdAt = '',
  imageUrl = '',
  user = {},
  viewsCount = 0,
  commentsCount = 0,
  isEditable = false,
  likesCount = 0,
  dislikesCount = 0,
  userReaction = null,
  isFavorite = false,
  onFavoriteToggle,
  isFullPost = false,
  isLoading = false
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const userData = useSelector(state => state.auth.data);
  const navigate = useNavigate();

  const currentUserId = userData?._id || userData?.user?._id || userData?.user;
  const postAuthorId = user?._id || user;
  const isAuthor = currentUserId && postAuthorId && String(currentUserId) === String(postAuthorId);
  const colors = {
    primary: '#9147ff',
    secondary: '#772ce8',
    background: '#0d1117',
    card: '#161b22',
    text: '#c9d1d9',
    accent: '#58a6ff'
  };
  
  const CodeBlock = styled(Box)(({ theme }) => ({
    backgroundColor: colors.card,
    padding: theme.spacing(2),
    borderRadius: '8px',
    overflowX: 'auto',
    fontFamily: 'monospace',
    margin: theme.spacing(2, 0),
    borderLeft: `4px solid ${colors.accent}`
  }));
  
  const [reactionData, setReactionData] = React.useState({
    likesCount,
    dislikesCount,
    userReaction
  });
  const [favorite, setFavorite] = React.useState(isFavorite);
  const [isReacting, setIsReacting] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setReactionData({ likesCount, dislikesCount, userReaction });
    setFavorite(isFavorite);
  }, [likesCount, dislikesCount, userReaction, isFavorite]);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUserId) {
      alert('Для этого действия нужно авторизоваться');
      return;
    }

    try {
      if (favorite) {
        await axios.delete(`/auth/favorites/${_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post(`/auth/favorites/${_id}`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      setFavorite(!favorite);
      if (onFavoriteToggle) onFavoriteToggle(_id, !favorite);
    } catch (err) {
      console.error('Error updating favorites:', err.response?.data || err);
      alert(err.response?.data?.error || 'Ошибка сервера');
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    handleMenuClose();
    if (navigator.share) {
      navigator.share({
        title: title,
        text: 'Посмотрите этот пост:',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  };

  const handleReport = (e) => {
    e.stopPropagation();
    handleMenuClose();
    alert('Жалоба отправлена модераторам');
  };

  const handleDeletePost = async () => {
    try {
      await axios.delete(`/posts/${_id}`);
      alert("Пост успешно удален");
      window.location.reload();
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Не удалось удалить пост');
    }
    setDeleteDialogOpen(false);
  };

  const handleReaction = async (type, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!currentUserId) {
      alert('Для этого действия нужно авторизоваться');
      return;
    }
    if (isReacting) return;
    setIsReacting(true);

    try {
      const currentReaction = reactionData.userReaction;
      const newReaction = currentReaction === type ? null : type;

      setReactionData(prev => {
        let newLikes = prev.likesCount;
        let newDislikes = prev.dislikesCount;

        if (type === 'like') {
          if (currentReaction === 'like') {
            newLikes -= 1;
          } else if (currentReaction === 'dislike') {
            newDislikes -= 1;
            if (newReaction) newLikes += 1;
          } else {
            if (newReaction) newLikes += 1;
          }
        } else if (type === 'dislike') {
          if (currentReaction === 'dislike') {
            newDislikes -= 1;
          } else if (currentReaction === 'like') {
            newLikes -= 1;
            if (newReaction) newDislikes += 1;
          } else {
            if (newReaction) newDislikes += 1;
          }
        }

        return {
          likesCount: newLikes,
          dislikesCount: newDislikes,
          userReaction: newReaction
        };
      });

      if (currentReaction) {
        await axios.delete(`/posts/reaction/${_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      
      if (newReaction) {
        await axios.post(`/posts/${newReaction}/${_id}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
    } catch (err) {
      console.error('Ошибка реакции:', err);
      alert('Бро ты уже ставил эту реакцию на пост ');
      setReactionData({
        likesCount,
        dislikesCount,
        userReaction
      });
    } finally {
      setIsReacting(false);
    }
  };

  const processImageUrl = (url) => 
    url?.startsWith('http') ? url : `https://atomglidedev.ru${url}`;
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);

  const handleImageOpen = () => setIsImageModalOpen(true);
  const handleImageClose = () => setIsImageModalOpen(false);

  return (
    <div className="post-GHJ" onClick={() => !isFullPost && navigate(`/posts/${_id}`)}>
      <div className="post-content">
        <div className="image-container">
          {imageUrl ? (
            <img 
              src={processImageUrl(imageUrl)} 
              alt={title}
              loading="lazy"
            />
          ) : (
            <div className="skeleton-image">
              <Box sx={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundColor: '#161b22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                🤷‍♂️ 📷
              </Box>
            </div>
          )}
        </div>
        <div className="post-header">
          <div className="user-info">
            <img 
              className="avatar"
              src={processImageUrl(user?.avatarUrl) || '/default-avatar.png'} 
              alt={user?.fullName || 'User'}
            />
            <div className="user-details">
              <span className="username">{user?.fullName || 'Аноним'}</span>
              <span className="date">{new Date(createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {(isEditable || isAuthor) && (
            <div className="post-actions">
              <IconButton onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => navigate(`/posts/${_id}/edit`)}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  Редактировать
                </MenuItem>
                <MenuItem onClick={() => setDeleteDialogOpen(true)}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  Удалить
                </MenuItem>
              </Menu>
            </div>
          )}
        </div>
        <h2 className="title-GHJ">{title}</h2>
      </div>
      <div className="post-meta">
        <div className="post-actions">
          <button className="action-btn" onClick={(e) => handleReaction('like', e)}>
            {reactionData.userReaction === 'like' ? <FavoriteFilledIcon /> : <FavoriteIcon />}
            <span>{reactionData.likesCount}</span>
          </button>
          <button className="action-btn" onClick={(e) => handleReaction('dislike', e)}>
            {reactionData.userReaction === 'dislike' ? <ThumbDownFilledIcon /> : <ThumbDownIcon />}
            <span>{reactionData.dislikesCount}</span>
          </button>
          <button 
            className="action-btn" 
            onClick={handleFavorite}
            style={{
              color: favorite ? '#ff6b6b' : 'inherit',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (favorite) {
                e.target.style.color = '#ff5252';
              }
            }}
            onMouseLeave={(e) => {
              if (favorite) {
                e.target.style.color = '#ff6b6b';
              }
            }}
          >
            {favorite ? <BookmarkFilledIcon /> : <BookmarkIcon />}
          </button>
          <button className="action-btn" onClick={handleShare}>
            <ShareIcon />
          </button>
        </div>
        <div className="post-stats">
          <EyeIcon fontSize="small" />
          <span>{viewsCount}</span>
        </div>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        className="delete-dialog"
      >
        <DialogTitle>
          Удаление поста
          <IconButton
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить этот пост?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} className="bth-white9">
            Отмена
          </Button>
          <Button onClick={handleDeletePost} className="bth-white9" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};