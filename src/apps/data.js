import { FiLoader, FiMessageCircle, FiRadio } from "react-icons/fi";
import { IoIosMusicalNotes } from "react-icons/io";

export const Nav_Buttons = [
  {
    index: 0,
    icon: <FiLoader />,
    path: '/'
  },
  {
    index: 1,
    icon: <FiMessageCircle />,
    path: '/chat'
  },
  {
    index: 2,
    icon: <IoIosMusicalNotes />,
    path: '/music'
  },
  {
    index: 3,
    icon: <FiRadio />,
    path: '/live'
  }
]; 