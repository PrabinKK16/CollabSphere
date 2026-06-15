import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import GlobalSearch from '../common/GlobalSearch';

const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden page-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Outlet />
      </div>
      <GlobalSearch />
    </div>
  );
};

export default AppLayout;
