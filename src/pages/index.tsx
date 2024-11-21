import { useEffect } from "react";

const Home: React.FC = () => {
  useEffect(() => {
    window.location.href = "https://tifoo.co";
  }, []);

  return null;
};

export default Home;
