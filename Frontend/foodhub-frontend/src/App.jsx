import './App.css';
import Sidebar from './component/Sidebar/Sidebar.jsx';
import MenuList from './component/Menulist/Menulist.jsx';
import Banner from './component/MainBanner/MainBanner.jsx';
import Navbar from './component/Navbar/Navbar.jsx';


function App() {
  return (
    <>
    
    <Sidebar></Sidebar>
    <Navbar></Navbar>
    <Banner></Banner>
    <MenuList></MenuList>
    
    </>
  );
}

export default App;
