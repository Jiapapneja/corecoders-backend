import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../lib/auth.js';

export default function Navbar() {
  const user = getUser(); const navigate = useNavigate();
  return <header className="sticky top-0 z-30 border-b border-black/5 bg-cream/90 backdrop-blur">
    <div className="container-page flex h-16 items-center justify-between">
      <Link to="/" className="text-xl font-black tracking-tight">Plate<span className="text-terracotta">Share</span></Link>
      <nav className="hidden items-center gap-6 text-sm md:flex">
        <NavLink to="/" className={({isActive}) => isActive ? 'font-bold' : 'text-black/60'}>Discover</NavLink>
        {user && <NavLink to="/feed" className={({isActive}) => isActive ? 'font-bold' : 'text-black/60'}>My Feed</NavLink>}
        {user && <NavLink to="/create" className={({isActive}) => isActive ? 'font-bold' : 'text-black/60'}>Share Recipe</NavLink>}
      </nav>
      <div className="flex items-center gap-2">
        {user ? <><Link className="btn-secondary hidden sm:inline-flex" to="/collections">Cookbooks</Link><button className="btn-primary" onClick={() => { clearAuth(); navigate('/login'); }}>Log out</button></> : <><Link className="btn-secondary" to="/login">Log in</Link><Link className="btn-primary" to="/register">Join</Link></>}
      </div>
    </div>
  </header>;
}
