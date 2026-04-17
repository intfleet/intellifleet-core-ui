import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import NoPage from '@/components/ui/NoPage';
import Login from '@/components/login'

const AppRouter = () => {
  
  

  return <>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </>
}

export default AppRouter;
