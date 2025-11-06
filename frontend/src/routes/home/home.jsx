import './home.css';
import Navbar from '@/components/Navbar';
import { Outlet } from "react-router"



const Home = () => {
    return(
        <div className="home-wrapper">
            <Navbar/>
        <Outlet/>
        </div>
        
    )
}


export default Home;