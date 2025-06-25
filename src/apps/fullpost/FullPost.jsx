import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Post } from "../post/post";
import axios from "../../axios";
import styles from '../../style/post-fullview/FULLPOST.scss';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'prism-react-renderer';
import { themes } from 'prism-react-renderer';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShareIcon from '@mui/icons-material/Share';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import Popover from '@mui/material/Popover';


export const FullPost = () => {
  const [post, setPost] = React.useState(null);
  const [isLoading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const userData = useSelector(state => state.auth.data);

  const processImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://atomglidedev.ru${url.startsWith('/') ? url : `/${url}`}`;
  };

  const handleDownload = () => {
    if (!post) return;
    const element = document.createElement("a");
    const file = new Blob([post.text], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${post.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.text.substring(0, 100) + '...',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована!');
    }
  };

  React.useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`/posts/${id}`);
        setPost({
          ...data,
          imageUrl: processImageUrl(data.imageUrl),
          user: {
            ...data.user,
            avatarUrl: processImageUrl(data.user?.avatarUrl)
          }
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (isLoading) return (
    <Box className="loading-container">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <div className="error-container">
      <h3>Ошибка загрузки</h3>
      <p>{error}</p>
      <Button onClick={() => navigate('/')}>На главную</Button>
    </div>
  );

  return (
    <div className="full-post-container">
      {post && (
        <>
          <Post {...post} isFullPost={true} />
        </>
      )}
    </div>
  );
};